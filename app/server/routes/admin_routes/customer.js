import { Router } from "express";
import { getQueriedCustomer } from "../../controllers/customer.js";

const customerRoutes = Router();

customerRoutes.get("/", async (req, res) => {
  try {
    const { query } = req.query;
    const shop = res.locals.user_session.shop;
    const customerList = await getQueriedCustomer(query, shop);
    res.status(200).json({
      ok: true,
      customers: customerList,
    });
  } catch (err) {
    console.log("Failed to get customer reason -->" + err.message);
    res.status(400).json({
      ok: false,
    });
  }
});

export default customerRoutes;
