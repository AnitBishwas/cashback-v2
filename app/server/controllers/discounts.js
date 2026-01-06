import mongoose from "mongoose";
import CashbackDiscountModel from "../../utils/models/CashbackDiscounts.js";
import RecordModal from "../../utils/models/Records.js";

const handleCashbackDiscountCreationTransaction = async (payload, user) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const discountCreation = await CashbackDiscountModel.create(
      [{ ...payload }],
      { session }
    );
    await RecordModal.create(
      [
        {
          type: "discounts",
          action: "create",
          user: {
            id: user.id,
            email: user.email,
          },
          newChanges: payload,
        },
      ],
      { session }
    );
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw new Error(
      "Failed to handle cashback discount transaction reason -->" + err.message
    );
  } finally {
    session.endSession();
  }
};

const handleCashbackDiscountUpdationTransaction = async (id, payload, user) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const oldDiscountConfigs = await CashbackDiscountModel.findById(id)
      .session(session)
      .lean();
    const discountUpdates = await CashbackDiscountModel.findByIdAndUpdate(
      id,
      payload,
      {
        new: true,
        session,
      }
    ).lean();
    await RecordModal.create(
      [
        {
          type: "discounts",
          action: "update",
          user: {
            id: user.id,
            email: user.email,
          },
          newChanges: discountUpdates,
          oldChanges: oldDiscountConfigs,
        },
      ],
      { session }
    );
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw new Error(
      "Failed to handle cashback discount update transaction reason -->" +
        err.message
    );
  } finally {
    session.endSession();
  }
};
const handleCashbackDiscountDeletionTransaction = async (discountId, user) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const discountDeletion = await CashbackDiscountModel.findByIdAndDelete(
      discountId,
      { session }
    );
    await RecordModal.create(
      [
        {
          type: "discounts",
          action: "delete",
          user: {
            id: user.id,
            email: user.email,
          },
          newChanges: discountDeletion,
        },
      ],
      { session }
    );
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw new Error(
      "Failed to handle cashback discount deletion transaction reason -->" +
        err.message
    );
  } finally {
    session.endSession();
  }
};
export {
  handleCashbackDiscountCreationTransaction,
  handleCashbackDiscountDeletionTransaction,
  handleCashbackDiscountUpdationTransaction,
};
