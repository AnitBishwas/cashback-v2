import { Router } from "express";
import distributionValidationSchema from "../../validators/Distribution.js";
import { distributeCashback } from "../../controllers/distribution.js";

const distributionRoutes = Router();

distributionRoutes.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const isPayloadValid = distributionValidationSchema.validate(payload, {
      convert: true,
    });
    if (isPayloadValid.error) {
      throw new Error("Incorrect pyalod");
    }
    const distribute = await distributeCashback(payload,res.locals.user_session.onlineAccessInfo.associated_user);
    res.status(200).json({
      ok: true,
    });
  } catch (err) {
    console.log(
      "Failed to handle distibution post request reason -->" + err.message
    );
    res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
});
export default distributionRoutes;
