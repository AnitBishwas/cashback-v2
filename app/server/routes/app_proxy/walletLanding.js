import { Router } from "express";
import { getLandingPageData } from "../../controllers/landingPage.js";

const walletLandingRoutes = Router();

walletLandingRoutes.get("/", async (req, res) => {
  try {
    const customerId = req.query.logged_in_customer_id;
    const shop = req.query.shop;
    const data = await getLandingPageData(customerId, shop);
    res.status(200).json({
      ok: true,
      ...data,
    });
  } catch (err) {
    console.log(
      "Failed to get wallet landing page data reason -->" + err.message
    );
    res.status(400).json({
      ok: false,
    });
  }
});

export default walletLandingRoutes;
