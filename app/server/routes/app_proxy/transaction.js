import { Router } from "express";
import { getTransactions } from "../../controllers/transaction.js";

const transactionRoutes = Router();

transactionRoutes.get("/", async (req, res) => {
  try {
    const customerId = req.query.logged_in_customer_id;
    const shop = req.query.shop;
    const query = req.query;
    console.log(customerId, "on first");
    const data = await getTransactions(customerId, shop, query);
    res.status(200).json({
      ok: true,
      transactions: { ...data },
    });
  } catch (err) {
    res.status(400).json({ ok: false });
  }
});

export default transactionRoutes;
