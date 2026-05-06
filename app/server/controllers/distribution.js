import mongoose from "mongoose";
import WalletModel from "../../utils/models/Wallet.js";
import CustomerModel from "../../utils/models/Customer.js";
import PointModel from "../../utils/models/Point.js";
import TransactionModel from "../../utils/models/Transaction.js";
import RecordModal from "../../utils/models/Records.js";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import { createServerEvent } from "./bigQueryAnalytics.js";
import sendMessageToSQS from "../controllers/aws.js";
/**
 * @param {string} id - shopify customer id
 */
const normalizeCustomerId = (id) =>
  id.includes("gid") ? id.replace("gid://shopify/Customer/", "") : id;

/**
 * @param {array} payload -  list of customers
 * @param {object} user - admin user details
 */

const distributeCashback = async (
  payload,
  user,
  shop = "swissbeauty-dev.myshopify.com"
) => {
  const session = await mongoose.startSession();
  const events = [];

  try {
    session.startTransaction();

    for (const el of payload) {
      const customerId = normalizeCustomerId(el.id);

      await CustomerModel.updateOne(
        { customerId },
        {
          $setOnInsert: {
            firstName: el.firstName,
            lastName: el.lastName,
            phone: el.phone,
            email: el.email,
          },
        },
        { upsert: true, session }
      );

      const wallet = await WalletModel.findOneAndUpdate(
        { customerId },
        { $setOnInsert: { customerId, balance: 0 } },
        { upsert: true, new: true, session }
      );

      const [pointDoc] = await PointModel.create(
        [
          {
            customerId,
            walletId: wallet._id,
            expiresOn: new Date(el.expiryDate),
            amount: el.amount,
            status: "ready",
          },
        ],
        { session }
      );

      const updatedWallet = await WalletModel.findByIdAndUpdate(
        wallet._id,
        {
          $inc: { balance: el.amount },
          $push: { points: pointDoc._id },
        },
        { new: true, session }
      );

      await TransactionModel.create(
        [
          {
            walletId: wallet._id,
            amount: el.amount,
            type: "credit",
            closingBalance: updatedWallet.balance,
            status: "completed",
            note: el.note,
          },
        ],
        { session }
      );

      await RecordModal.create(
        [
          {
            type: "distribution",
            action: "disburse",
            user: { id: user.id, email: user.email },
            newChanges: {
              amount: el.amount,
              customerId,
              phone: el.phone || "",
              email: el.email || "",
              walletId: wallet._id,
            },
          },
        ],
        { session }
      );

      events.push({
        eventName: "cashback_assigned_v2",
        params: {
          date: pointDoc.updatedAt,
          pointId: pointDoc._id.toString(),
          expires_on: pointDoc.expiresOn,
          cashback_to_be_credited: pointDoc.amount,
          manual_flag: true,
          wallet_balance: updatedWallet.balance,
          userEmail: user.email,
        },
      });
    }

    await session.commitTransaction();

    for (const ev of events) {
      createServerEvent(ev);
      sendS2sEventOnManualDistribution({
        pointId: ev.params.pointId,
        shop,
      });
    }
  } catch (err) {
    console.error("Cashback distribution failed:", err);
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
const sendS2sEventOnManualDistribution = async (payload) => {
  try {
    console.log("Sending s2s event on manual cashback distribution");
    await sendMessageToSQS({
      topic: "CASHBACK_Manual_DISTRIBUTION",
      ...payload,
    });
  } catch (err) {
    console.log(
      "Failed to s2s event on manual distributikon reason -->" + err.message
    );
  }
};
const handleBulkDistributionFileUpload = async ({ fileName, contentType }) => {
  try {
    if (!fileName || !contentType) {
      throw new Error("Required parameters missing");
    }
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;

    const sanitizeFileName = (name = "upload.csv") =>
      path.basename(name).replace(/[^\w.\-]+/g, "_");
    if (!bucket || !region) throw new Error("Missing AWS config");

    // basic validation
    if (!String(fileName).toLowerCase().endsWith(".csv")) {
      throw new Error("Only CSV files allowed");
    }

    const jobId = crypto.randomUUID();
    const safeName = sanitizeFileName(fileName);
    const key = `cashback-imports/${jobId}/${Date.now()}-${safeName}`;

    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType || "text/csv",
      Metadata: { jobid: jobId, originalname: safeName },
    });

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 10 }); // 10 mins
    return {
      jobId,
      bucket,
      key,
      uploadUrl,
    };
  } catch (err) {
    console.log(
      "Failed to handle bulk distribution file upload reason -->" + err.message
    );
    throw new Error(
      "Failed to handle bulk distribution file upload reason -->" + err.message
    );
  }
};
export { distributeCashback, handleBulkDistributionFileUpload };
