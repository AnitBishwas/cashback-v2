import CustomerModel from "../../utils/models/Customer.js";
import PointModel from "../../utils/models/Point.js";
import WalletModel from "../../utils/models/Wallet.js";
import TransactionModel from "../../utils/models/Transaction.js";
import RecordModal from "../../utils/models/Records.js";
import mongoose from "mongoose";

const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCustomersWallet = async ({ query = "", page = 1, limit = 20 }) => {
  try {
    const Customer = CustomerModel;
    const Wallet = WalletModel;

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    const q = (query || "").trim().length > 0 ? query : null;
    const isNumeric = /^\d+$/.test(q);
    let filter = null;
    if (q) {
      filter = {
        $or: [
          { firstName: { $regex: escapeRegex(q), $options: "i" } },
          { lastName: { $regex: escapeRegex(q), $options: "i" } },
          { email: { $regex: escapeRegex(q), $options: "i" } },
          { phone: { $regex: escapeRegex(q), $options: "i" } },
          ...(isNumeric ? [{ customerId: Number(q) }] : []),
        ],
      };
    } else {
      filter = {};
    }
    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort({ customerId: -1 })
        .skip(skip)
        .limit(safeLimit)
        .select("customerId firstName lastName email phone")
        .lean(),
      Customer.countDocuments(filter),
    ]);
    if (!customers.length) {
      return {
        data: [],
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit) || 0,
      };
    }

    const ids = customers.map((c) => c.customerId);
    const wallets = await Wallet.find({ customerId: { $in: ids } })
      .select("customerId balance")
      .lean();

    const walletMap = new Map(wallets.map((w) => [w.customerId, w.balance]));

    const data = customers.map((c) => ({
      customerId: c.customerId,
      firstName: c.firstName || "",
      lastName: c.lastName || "",
      email: c.email || "",
      phone: c.phone || "",
      walletBalance: Number(walletMap.get(c.customerId) || 0),
    }));

    return {
      customerWallets: [...data],
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  } catch (err) {
    console.log(err.message);
    throw new Error("Failed to get customers wallet reason --> " + err.message);
  }
};

/**
 *
 * @param {Number} customerId - shopify customer id
 */
const getCustomerWalletSummary = async (customerId) => {
  try {
    const wallet = await WalletModel.findOne({ customerId }).lean();
    if (!wallet) throw new Error("Wallet not found");
    const customer = await CustomerModel.findOne({ customerId }).lean();
    return {
      wallet: {
        walletId: String(wallet._id),
        balance: Number(wallet.balance || 0),
        customerId: wallet.customerId,
      },
      customer: {
        firstName: customer?.firstName || "",
        lastName: customer?.lastName || "",
        email: customer?.email || "",
        phone: customer?.phone || "",
        customerId: wallet.customerId,
      },
    };
  } catch (err) {
    throw new Error(
      "Failed to get customer specific wallet related data reason -->" +
        err.message
    );
  }
};

const getCustomerPoint = async (customerId, { page = 1, limit = 20 } = {}) => {
  try {
    const Point = PointModel;
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    const filter = { customerId: customerId };
    const [points, total] = await Promise.all([
      Point.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .select("status amount expiresOn orders createdAt")
        .lean(),
      Point.countDocuments(filter),
    ]);
    return {
      points,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  } catch (err) {
    throw new Error("Failed to get customer point reason -->" + err.message);
  }
};

const getCustomerTransactions = async (
  walletId,
  { query = "", page = 1, limit = 20 } = {}
) => {
  try {
    const Transaction = TransactionModel;

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    const q = String(query || "").trim();
    const isNumeric = /^\d+$/.test(q);

    const filter = {
      walletId: String(walletId),
      ...(q
        ? {
            $or: [
              { orderName: { $regex: escapeRegex(q), $options: "i" } },
              ...(isNumeric ? [{ orderId: Number(q) }] : []),
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .select(
          "walletId status type orderId orderName amount closingBalance note createdAt updatedAt"
        )
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return {
      transactions: items || [],
      total: total || 0,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil((total || 0) / safeLimit) || 1,
    };
  } catch (err) {
    throw new Error(
      "Failed to get customer transactions reason -->" + err.message
    );
  }
};

const updateCustomerPhoneNumber = async (customerId, phone, user) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const normalizePhone = String(phone).trim();
    const isValidIndianPhone = (phone = "") =>
      /^\+91\d{10}$/.test(normalizePhone(phone));
    if (!isValidIndianPhone || !customerId) {
      throw new Error("Required paramters missing");
    }
    const Customer = CustomerModel;
    const updated = await Customer.findOneAndUpdate(
      { customerId: Number(customerId) },
      { $set: { phone: normalizePhone } },
      { session: session }
    ).lean();
    await RecordModal.create(
      [
        {
          type: "customer/phone",
          action: "update",
          user: {
            id: user.id,
            email: user.email,
          },
          newChanges: {
            phone: normalizePhone,
          },
          oldChanges: {
            ...updated,
          },
        },
      ],
      { session }
    );
    if (!updated) {
      throw new Error("Customer not found");
    }
    await session.commitTransaction();
    return {
      customerId: updated.customerId,
      phone: updated.phone,
    };
  } catch (err) {
    await session.abortTransaction();
    throw new Error(
      "Failed to update customer phone number reason -->" + err.message
    );
  } finally {
    session.endSession();
  }
};
export {
  getCustomersWallet,
  getCustomerWalletSummary,
  getCustomerPoint,
  getCustomerTransactions,
  updateCustomerPhoneNumber,
};
