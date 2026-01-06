import { Router } from "express";
import { createWalletWidget } from "../../controllers/widget.js";

const widgetRoutes = Router();

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
