import { Router } from "express";
import storeFrontOfferValidationSchema from "../../validators/StorefrontOffer.js";
import {
  createStorefrontOffer,
  deleteStoreFrontOffer,
  getStorefrontOffers,
  updateOfferPosition,
  updateStorontOffer,
} from "../../controllers/storefront.js";
import StorefrontOfferModel from "@swiss-beauty/cashback-schema/src/models/StorefrontOffer.model.js";

const storeFrontRoutes = Router();

storeFrontRoutes.post("/offers/create", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) {
      throw new Error("Required parameters missing");
    }
    const isPayloadValid = storeFrontOfferValidationSchema.validate(payload);
    const offer = await createStorefrontOffer(
      isPayloadValid.value,
      res.locals.user_session.onlineAccessInfo.associated_user
    );
    res.status(200).json({
      ok: true,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ ok: false });
  }
});

storeFrontRoutes.post("/offers/updatePosition", async (req, res) => {
  try {
    const payload = req.body;
    if (
      !payload.id ||
      payload.position === undefined ||
      payload.position === null
    ) {
      throw new Error("Required parameters missing");
    }
    const updatePostion = await updateOfferPosition(
      payload.id,
      payload.position,
      res.locals.user_session.onlineAccessInfo.associated_user
    );
    res.status(200).json({
      ok: true,
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
    });
  }
});

storeFrontRoutes.post("/offers/update", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) {
      throw new Error("Required paramters missing");
    }
    const isPayloadValid = storeFrontOfferValidationSchema.validate(payload);
    const offerUpdate = await updateStorontOffer(
      isPayloadValid.value._id,
      isPayloadValid.value,
      res.locals.user_session.onlineAccessInfo.associated_user
    );
    res.status(200).json({
      ok: true,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      ok: false,
    });
  }
});

storeFrontRoutes.post("/offers/delete", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload?.id) {
      throw new Error("Required parameters missing");
    }
    const deleteOffer = await deleteStoreFrontOffer(
      payload.id,
      res.locals.user_session.onlineAccessInfo.associated_user
    );
    res.status(200).json({
      ok: true,
      offer: deleteOffer,
    });
  } catch (err) {
    console.log("Failed to delete offer reason -->" + err.message);
    res.status(400).json({
      ok: false,
    });
  }
});

storeFrontRoutes.get("/offers", async (req, res) => {
  try {
    const offersList = await getStorefrontOffers();
    res.status(200).json({
      ok: true,
      offers: [...offersList],
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
    });
  }
});
storeFrontRoutes.get("/offers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("Required param missing");
    }
    const offer = await StorefrontOfferModel.findById(id).lean();
    res.status(200).json({
      ok: true,
      offer: { ...offer },
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
    });
  }
});
export default storeFrontRoutes;
