import { Router } from "express";
import CashbackDiscountModel from "../../../utils/models/CashbackDiscounts.js";
import discountValidationSchema from "../../validators/Discounts.js";
import {
  handleCashbackDiscountCreationTransaction,
  handleCashbackDiscountDeletionTransaction,
  handleCashbackDiscountUpdationTransaction,
} from "../../controllers/discounts.js";

const discountRoutes = Router();

discountRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("Id is required to get discount");
    }
    const discount = await CashbackDiscountModel.findById(id).lean();
    res.status(200).json({
      ok: true,
      discount,
    });
  } catch (err) {
    console.log(
      "Failed to get specific coupon detail reason -->" + err.message
    );
    res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
});
discountRoutes.get("/", async (req, res) => {
  try {
    const discountsList = await CashbackDiscountModel.find({})
      .sort({ updatedAt: -1 })
      .lean();
    res.status(200).json({
      ok: true,
      discounts: [...discountsList],
    });
  } catch (err) {
    console.log("Failed to get cashback discounts reason -->" + err.message);
    res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
});
discountRoutes.post("/create", async (req, res) => {
  try {
    const payload = req.body;

    const isPayloadValid = discountValidationSchema.validate(payload);
    if (isPayloadValid.error) {
      throw new Error("Invalid payload");
    }
    const discountCreation = await handleCashbackDiscountCreationTransaction(
      isPayloadValid.value,
      res.locals.user_session.onlineAccessInfo.associated_user
    );
    res.status(200).json({
      ok: true,
    });
  } catch (err) {
    console.log("Failed to create discount reason -->" + err.message);
    res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
});
discountRoutes.post("/update", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload?.id) {
      throw new Error("Payload can not be empty");
    }
    const isPayloadValid = discountValidationSchema.validate(payload);
    if (isPayloadValid.error) {
      throw new Error("Invalid payload");
    }
    const discountUpdate = await handleCashbackDiscountUpdationTransaction(
      payload.id,
      isPayloadValid.value,
      res.locals.user_session.onlineAccessInfo.associated_user
    );
    res.status(200).json({
      ok: true,
    });
  } catch (err) {
    console.log("Failed to update discount reason -->" + err.message);
    res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
});
discountRoutes.post("/delete", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload?.id) {
      throw new Error("Id is required");
    }
    const discountDeletion = await handleCashbackDiscountDeletionTransaction(
      payload.id,
      res.locals.user_session.onlineAccessInfo.associated_user
    );
    res.status(200).json({
      ok: true,
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
});
export default discountRoutes;
