import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  customerId: {
    type: Number,
    required: true,
  },
  points: [
    {
      id: {
        type: String,
      },
    },
  ],
  balance: {
    type: Number,
    required: true,
  },
});

const WalletModel = mongoose.model("Wallet", walletSchema);

export default WalletModel;
