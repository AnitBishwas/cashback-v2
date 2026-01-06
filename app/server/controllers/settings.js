import RecordModal from "../../utils/models/Records.js";
import SettingsModal from "../../utils/models/Settings.js";
import mongoose from "mongoose";

const getCashbackSettings = async () => {
  try {
    const cashbackSettings = await SettingsModal.findOne({}).lean();
    return cashbackSettings;
  } catch (err) {
    throw new Error("Failed to get cashback settings reason -->" + err.message);
  }
};

/**
 * Update cashback setting update
 * @param {object} settingsUpdate - updated settings values
 * @param {string} shop - shopify store handle Ex - swiss-local-dev.myshopify.com
 * @param {object} userInfo - user details whoever making the changes
 */
const handleCashbackSettingUpdateTransaction = async (
  settingsUpdate,
  shop,
  userInfo
) => {
  const session = await mongoose.startSession();
  try {
    const oldSettings = await SettingsModal.findOne({ shop }).lean();
    session.startTransaction();
    const settings = await SettingsModal.findOneAndUpdate(
      { shop },
      settingsUpdate,
      { new: true, upsert: true, session }
    ).lean();
    await RecordModal.create(
      [
        {
          type: "settings",
          action: "update",
          user: {
            id: userInfo.id,
            email: userInfo.email,
          },
          oldChanges: { ...oldSettings },
          newChanges: { ...settings },
        },
      ],
      { session }
    );
    await session.commitTransaction();
    return settings;
  } catch (err) {
    await session.abortTransaction();
    throw new Error(
      "Failed to handle cashback setting update transaction reason -->" +
        err.message
    );
  } finally {
    session.endSession();
  }
};
export { getCashbackSettings, handleCashbackSettingUpdateTransaction };
