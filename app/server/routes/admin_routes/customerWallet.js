import { Router } from "express";
import {
  getCustomerPoint,
  getCustomersWallet,
  getCustomerWalletSummary,
  getCustomerTransactions,
  updateCustomerPhoneNumber,
} from "../../controllers/customerWallet.js";

const customerWalletRoutes = Router();

customerWalletRoutes.get("/:id/wallet", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("Required params missing");
    }
    const walletData = await getCustomerWalletSummary(id);
    res.status(200).json({
      ok: true,
      ...walletData,
    });
  } catch (err) {
    console.log("failed reason -->" + err.message);
    res.status(400).json({
      ok: false,
    });
  }
});
customerWalletRoutes.get("/:id/points", async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    if (!id) {
      throw new Error("Required params missing");
    }
    const pointData = await getCustomerPoint(id, { page, limit });
    res.status(200).json({
      ok: true,
      ...pointData,
    });
  } catch (err) {
    console.log("failed reason -->" + err.message);
    res.status(400).json({
      ok: false,
    });
  }
});

customerWalletRoutes.get("/:id/transactions", async (req, res) => {
  try {
    const { id } = req.params;
    const url = new URL(req.originalUrl, `http://${req.headers.host}`);
    const page = url.searchParams.get("page") || 1;
    const limit = url.searchParams.get("limit") || 20;
    const query = url.searchParams.get("query") || "";

    if (!id) {
      throw new Error("Required params missing");
    }

    const txData = await getCustomerTransactions(id, { page, limit, query });

    res.status(200).json({
      ok: true,
      ...txData,
    });
  } catch (err) {
    console.log("failed reason -->" + err.message);
    res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
});

customerWalletRoutes.put("/:id/phone", async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.body || {};
    if (!id || !phone) {
      throw new Error("Required params missing");
    }

    const data = await updateCustomerPhoneNumber(
      id,
      phone,
      res.locals.user_session.onlineAccessInfo.associated_user
    );

    return res.status(200).json({
      ok: true,
      ...data,
    });
  } catch (err) {
    console.log("failed reason -->" + err.message);
    return res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
});
/**
 * acceptable query format
{
  query = "",
  page = 1,
  limit = 20,
}
 */
customerWalletRoutes.get("/", async (req, res) => {
  try {
    const url = new URL(req.originalUrl, `http://${req.headers.host}`);
    const query = Object.fromEntries(url.searchParams.entries());

    const payload = {
      query: query.query == "undefined" || !query.query ? "" : query.query,
      page: Number(query.page || 1),
      limit: Number(query.limit || 20),
    };
    const data = await getCustomersWallet({ ...payload });
    res.status(200).json({
      ok: true,
      data,
    });
  } catch (err) {
    console.log("Failed to get customer wallet reason -->" + err.message);
    res.status(400).json({
      ok: false,
    });
  }
});
export default customerWalletRoutes;
