import Joi from "joi";

const storeFrontOfferValidationSchema = Joi.object({
  code: Joi.string().required().min(1),
  position: Joi.number().optional(),
  status: Joi.string().required().valid("active", "disabled"),
  title: Joi.string().required(),
  description: Joi.string().optional(),
  btn: Joi.object({
    text: Joi.string(),
    url: Joi.string(),
  }),
  info: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    terms: Joi.string(),
  }),
});

export default storeFrontOfferValidationSchema;
