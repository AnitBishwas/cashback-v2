import mongoose from "mongoose";
import WalletModel from "../../utils/models/Wallet.js";
import CustomerModel from "../../utils/models/Customer.js";
import PointModel from "../../utils/models/Point.js";
import TransactionModel from "../../utils/models/Transaction.js";
import RecordModal from "../../utils/models/Records.js";
// import WalletModel from "@swiss-beauty/cashback-schema/src/models/Wallet.model.js";
// import CustomerModel from "@swiss-beauty/cashback-schema/src/models/CustomKeys.model.js";
// import PointModel from "@swiss-beauty/cashback-schema/src/models/Point.model.js";
// import TransactionModel from "@swiss-beauty/cashback-schema/src/models/Transaction.model.js";
// import RecordModal from "@swiss-beauty/cashback-schema/src/models/Record.model.js";

/**
 * @param {string} id - shopify customer id
 */
const normalizeCustomerId = (id) =>
  id.includes("gid") ? id.replace("gid://shopify/Customer/", "") : id;

/**
 * @param {array} payload -  list of customers
 * @param {object} user - admin user details
 */

const distributeCashback = async (payload, user) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await Promise.all(
      payload.map(async (el) => {
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
          {
            $setOnInsert: {
              customerId,
              balance: 0,
            },
          },
          { upsert: true, new: true, session }
        );

        const point = await PointModel.create(
          [
            {
              customerId: customerId,
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
            $push: { points: point[0]._id },
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
              user: {
                id: user.id,
                email: user.email,
              },
              newChanges: {
                amount: el.amount,
                customerId: customerId,
                phone: el.phone || "",
                email: el.email || "",
                walletId: wallet._id,
              },
            },
          ],
          { session }
        );
      })
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error("Cashback distribution failed:", err);
    throw err;
  } finally {
    session.endSession();
  }
};
export { distributeCashback };
