import { Router } from "express";
import {
  getCashbackSettings,
  handleCashbackSettingUpdateTransaction,
} from "../../controllers/settings.js";
import settingsValidationSchema from "../../validators/Settings.js";

const settingRoutes = Router();

settingRoutes.get("/", async (req, res) => {
  try {
    const cashbackSettings = await getCashbackSettings();
    res.status(200).send({
      ok: true,
      ...cashbackSettings,
    });
  } catch (err) {
    console.log("Failed to get cashback settings reason -->" + err.message);
    res.status(420).send({
      ok: false,
      message: "Failed to get cashback settings NOTE: Server error",
    });
  }
});
settingRoutes.post("/update", async (req, res) => {
  try {
    const payload = req.body;
    const shop = res.locals.user_session.shop;
    const isPayloadValid =
      await settingsValidationSchema.validateAsync(payload);
    const settingsUpdatePayload = {
      shop: shop,
      usage: {
        type: isPayloadValid.usage.type,
        value: isPayloadValid.usage.value,
      },
      order_allocation: {
        type: isPayloadValid.allocation.type,
        value: isPayloadValid.allocation.value,
      },
      max_cashback: isPayloadValid.maxCashback,
      expiry_period: isPayloadValid.expiryPeriod,
      extension: {
        enable: isPayloadValid.extension?.enable || false,
        period: isPayloadValid.extension?.period || 1,
      }
    };
    await handleCashbackSettingUpdateTransaction(
      settingsUpdatePayload,
      shop,
      res.locals.user_session.onlineAccessInfo.associated_user
    );
    res.status(200).json({
      ok: true,
    });
  } catch (err) {
    console.log("Failed to update cashback settings reason -->" + err.message);
    res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
});
export default settingRoutes;
