import PointModel from "../../utils/models/Point.js";
import WalletModel from "../../utils/models/Wallet.js";
import { getCashbackSettings } from "./settings.js";

/**
 * Create wallet widget
 * @param {string} customerId - shopify customer id
 */
const createWalletWidget = async (customerId = null) => {
  try {
    const now = new Date();
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const cashbackSettings = await getCashbackSettings();
    if (!customerId) {
      return {
        isGuest: true,
        balance: 0,
        expiringCredits: [],
        cashbackSettings,
      };
    }
    const customerWallet = await WalletModel.findOne({ customerId }).lean();
    if (!customerWallet) {
      return {
        isGuest: false,
        balance: 0,
        expiringCredits: [],
        cashbackSettings,
      };
    }
    const expiringCredits = await PointModel.find({
      walletId: customerWallet._id,
      status: "ready",
      amount: { $gt: 0 },
      expiresOn: {
        $gte: now,
        $lte: next30Days,
      },
    })
      .sort({ expiresOn: 1 })
      .lean();
    return {
      isGuest: false,
      balance: customerWallet.balance,
      expiringCredits,
      cashbackSettings,
    };
  } catch (err) {
    throw new Error("Failed to create wallet widget reason -->" + err.message);
  }
};

export { createWalletWidget };
