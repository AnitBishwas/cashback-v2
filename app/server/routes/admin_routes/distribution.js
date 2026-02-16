import { Router } from "express";
import distributionValidationSchema from "../../validators/Distribution.js";
import {
  distributeCashback,
  handleBulkDistributionFileUpload,
} from "../../controllers/distribution.js";
import multer from "multer";
import sendMessageToSQS from "../../controllers/aws.js";
const upload = multer();

const distributionRoutes = Router();

distributionRoutes.post("/bulk/confirm", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.jobId || !payload.bucket || !payload.key) {
      throw new Error("Required params missing");
    }
    await sendMessageToSQS({
      topic: "CASHBACK_BULK_DISTRIBUTION",
      ...payload,
      user: { ...res.locals.user_session.onlineAccessInfo.associated_user },
    });
    res.status(200).json({
      ok: true,
      user: { ...res.locals.user_session.onlineAccessInfo.associated_user },
    });
  } catch (err) {
    console.log("Failed to handle bulk distribution reason -->" + err.message);
    res.status(400).json({
      ok: false,
    });
  }
});

distributionRoutes.post("/bulk", async (req, res) => {
  try {
    const payload = req.body;
    const data = await handleBulkDistributionFileUpload(payload);
    res.status(200).json({
      ok: true,
      ...data,
      user: { ...res.locals.user_session.onlineAccessInfo.associated_user },
    });
  } catch (err) {
    console.log("Failed to handle bulk distribution reason -->" + err.message);
    res.status(400).json({
      ok: false,
    });
  }
});

distributionRoutes.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const isPayloadValid = distributionValidationSchema.validate(payload, {
      convert: true,
    });
    if (isPayloadValid.error) {
      throw new Error("Incorrect pyalod");
    }
    const distribute = await distributeCashback(
      payload,
      res.locals.user_session.onlineAccessInfo.associated_user
    );
    res.status(200).json({
      ok: true,
    });
  } catch (err) {
    console.log(
      "Failed to handle distibution post request reason -->" + err.message
    );
    res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
});

export default distributionRoutes;
