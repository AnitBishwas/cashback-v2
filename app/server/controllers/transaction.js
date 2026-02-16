import WalletModel from "../../utils/models/Wallet.js";
import TransactionModel from "../../utils/models/Transaction.js";

const getTransactions = async (
  customerId = null,
  shop,
  { page = 1, limit = 10, startDate = null, endDate = null } = {}
) => {
  try {
    const safePage = Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
    const safeSkip = (safePage - 1) * safeLimit;

    const sDate = startDate ? new Date(startDate) : null;
    const eDate = endDate ? new Date(endDate) : null;

    const dateMatch =
      sDate || eDate
        ? {
            createdAt: {
              ...(sDate ? { $gte: sDate } : {}),
              ...(eDate ? { $lte: eDate } : {}),
            },
          }
        : null;

    const cidNum =
      customerId === null || customerId === undefined || customerId === ""
        ? null
        : Number(customerId);
    if (!cidNum || Number.isNaN(cidNum)) {
      return {
        total: 0,
        transactions: [],
        pagination: {
          currentPage: safePage,
          nextPage: null,
          prevPage: safePage > 1 ? safePage - 1 : null,
          totalPages: 1,
          pages: [1],
        },
        filters: { startDate: sDate, endDate: eDate },
      };
    }

    // ---- wallet lookup ----
    const wallet = await WalletModel.findOne(
      { customerId: cidNum },
      { _id: 1, balance: 1 }
    ).lean();
    if (!wallet?._id) {
      return {
        total: 0,
        transactions: [],
        pagination: {
          currentPage: safePage,
          nextPage: null,
          prevPage: safePage > 1 ? safePage - 1 : null,
          totalPages: 1,
          pages: [1],
        },
        filters: { startDate: sDate, endDate: eDate },
      };
    }

    const walletIdStr = String(wallet._id);
    // ---- build query ----
    const q = {
      walletId: walletIdStr,
      ...(dateMatch ? dateMatch : {}),
    };
    console.log(q);

    // ---- total + page docs ----
    const [total, transactions] = await Promise.all([
      TransactionModel.countDocuments(q),
      TransactionModel.find(q)
        .sort({ createdAt: -1 })
        .skip(safeSkip)
        .limit(safeLimit)
        .lean(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const nextPage = safePage < totalPages ? safePage + 1 : null;
    const prevPage = safePage > 1 ? safePage - 1 : null;

    return {
      total,
      transactions,
      pagination: {
        currentPage: safePage,
        nextPage,
        prevPage,
        totalPages,
        pages: Array.from({ length: totalPages }, (_, i) => i + 1),
      },
      filters: { startDate: sDate, endDate: eDate },
    };
  } catch (err) {
    console.log("Failed to get transactions reason -->" + err.message);
    throw new Error("Failed to get transactions reason --> " + err.message);
  }
};

export { getTransactions };
