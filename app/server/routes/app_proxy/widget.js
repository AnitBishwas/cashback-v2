import { Router } from "express";
import { createWalletWidget } from "../../controllers/widget.js";
import WalletModel from "../../../utils/models/Wallet.js";

const widgetRoutes = Router();

widgetRoutes.get("/balance", async (req, res) => {
  try {
    console.log("get balance route was hit")
    const customerId = req.query.logged_in_customer_id;
    const customerWallet = await WalletModel.findOne({
      customerId: customerId,
    }).lean();
    if (!customerWallet) {
      throw new Error("No wallet found against customer");
    }
    res.status(200).json({
      ok: true,
      balance: customerWallet.balance,
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
    });
  }
});

widgetRoutes.get("/", async (req, res) => {
  try {
    const customerId = req.query.logged_in_customer_id;
    const walletWidget = await createWalletWidget(customerId);
    res.status(200).json(walletWidget);
  } catch (err) {
    console.log("Failed to get widget reason -->" + err.message);
    res.status(400).json({
      ok: false,
    });
  }
});

export default widgetRoutes;
