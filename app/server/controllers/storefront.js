import StorefrontOfferModel from "@swiss-beauty/cashback-schema/src/models/StorefrontOffer.model.js";
import mongoose from "mongoose";
import RecordModal from "../../utils/models/Records.js";

/**
 *
 * @typedef {object} payload
 * @property {string} code - dicount code
 * @property {string} status - discount status enums - ['active','disabled']
 * @property {string} title - disoucnt title
 * @property {string} description - discount description
 * @typedef {object} btn - button object
 * @property {string} text - button text
 * @property {string} url - button redirection url
 * @typedef {object} info - info object
 * @property {string} title - info title
 * @property {string} description - info description
 * @property {string} terms - info terms and conditions
 * @typedef {object} userInfo
 * @property {string} id - user id
 * @property {string} email - user email
 */
const createStorefrontOffer = async (payload, userInfo) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    let lastOffer = await StorefrontOfferModel.findOne()
      .sort("-position")
      .select("position")
      .lean()
      .session(session);
    const position = lastOffer ? lastOffer.position + 1 : 0;
    const storefrontOffer = await StorefrontOfferModel.create(
      [
        {
          position,
          code: payload.code,
          status: payload.status,
          title: payload.title,
          description: payload.description,
          btnText: payload?.btn?.text || "",
          url: payload?.btn?.url || "",
          info: {
            title: payload?.info?.title,
            description: payload?.info?.description,
            terms: payload?.info?.terms,
          },
        },
      ],
      { session }
    );
    await RecordModal.create(
      [
        {
          type: "storefront/offers",
          action: "create",
          user: {
            id: userInfo.id,
            email: userInfo.email,
          },
          oldChanges: {},
          newChanges: { storefrontOffer },
        },
      ],
      { session }
    );
    await session.commitTransaction();
    return storefrontOffer;
  } catch (err) {
    await session.abortTransaction();
    throw new Error(
      "Failed to create storefront offer reason -->" + err.message
    );
  } finally {
    session.endSession();
  }
};

const getStorefrontOffers = async () => {
  try {
    const storefrontOffers = await StorefrontOfferModel.find()
      .sort({ position: 1 })
      .lean();
    return storefrontOffers;
  } catch (err) {
    throw new Error("Failed to get storefront offers reason -->" + err.message);
  }
};

/**
 * @param {string} id - offer id
 * @param {object} userInfo - user details
 */
const deleteStoreFrontOffer = async (id, userInfo) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const offerToDelete =
      await StorefrontOfferModel.findById(id).session(session);

    if (!offerToDelete) {
      throw new Error("Offer not found");
    }

    const deletedPosition = offerToDelete.position;
    await StorefrontOfferModel.deleteOne({ _id: id }).session(session);

    await StorefrontOfferModel.updateMany(
      { position: { $gt: deletedPosition } },
      { $inc: { position: -1 } },
      { session }
    );

    await RecordModal.create(
      [
        {
          type: "storefront/offers",
          action: "delete",
          user: {
            id: userInfo.id,
            email: userInfo.email,
          },
          oldChanges: offerToDelete.toObject(),
          newChanges: {},
        },
      ],
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw new Error(
      "Failed to delete storefront offer reason --> " + err.message
    );
  } finally {
    session.endSession();
  }
};

const updateOfferPosition = async (id, newPosition) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const offer = await StorefrontOfferModel.findById(id).session(session);

    if (!offer) {
      throw new Error("Offer not found");
    }

    const oldPosition = offer.position;

    if (oldPosition === newPosition) {
      await session.commitTransaction();
      return;
    }
    if (newPosition > oldPosition) {
      await StorefrontOfferModel.updateMany(
        {
          position: { $gt: oldPosition, $lte: newPosition },
        },
        { $inc: { position: -1 } },
        { session }
      );
    }
    if (newPosition < oldPosition) {
      await StorefrontOfferModel.updateMany(
        {
          position: { $gte: newPosition, $lt: oldPosition },
        },
        { $inc: { position: 1 } },
        { session }
      );
    }
    offer.position = newPosition;
    await offer.save({ session });
    await RecordModal.create(
      [
        {
          type: "storefront/offers",
          action: "update",
          user: {
            id: userInfo.id,
            email: userInfo.email,
          },
          oldChanges: {},
          newChanges: {},
        },
      ],
      { session }
    );
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw new Error(
      "Failed to update offer position reason --> " + err.message
    );
  } finally {
    session.endSession();
  }
};

/**
 * @param {string} id - offer id
 * @typedef {object} payload
 * @property {string} code - dicount code
 * @property {string} status - discount status enums - ['active','disabled']
 * @property {string} title - disoucnt title
 * @property {string} description - discount description
 * @typedef {object} btn - button object
 * @property {string} text - button text
 * @property {string} url - button redirection url
 * @typedef {object} info - info object
 * @property {string} title - info title
 * @property {string} description - info description
 * @property {string} terms - info terms and conditions
 * @typedef {object} userInfo
 * @property {string} id - user id
 * @property {string} email - user email
 */
const updateStorontOffer = async (id, updates) => {
  const session = await mongoose.startSession();
  try {
    session.tartTransaction();
    const offerUpdate = await StorefrontOfferModel.findByIdAndUpdate(id, {
      ...updates,
    })
      .lean()
      .session(session);
    await RecordModal.create(
      [
        {
          type: "storefront/offers",
          action: "update",
          user: {
            id: userInfo.id,
            email: userInfo.email,
          },
          oldChanges: { ...offerUpdate },
          newChanges: { ...updates },
        },
      ],
      { session }
    );
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw new Error(
      "Failed to update storefront offer reason -->" + err.message
    );
  } finally {
    session.endSession();
  }
};
export {
  createStorefrontOffer,
  getStorefrontOffers,
  deleteStoreFrontOffer,
  updateOfferPosition,
  updateStorontOffer,
};
