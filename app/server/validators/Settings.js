import Joi from "joi";

const settingsValidationSchema = Joi.object({
  usage: Joi.object({
    type: Joi.string().valid("percentage", "fixed").required(),
    value: Joi.number().min(0).required(),
  }),
  allocation: Joi.object({
    type: Joi.string().valid("percentage", "fixed").required(),
    value: Joi.number().min(0).required(),
  }),
  maxCashback: Joi.number().min(0).required(),
  expiryPeriod: Joi.number().min(0).required(),
  extension:{
    enable: Joi.boolean().required(),
    period: Joi.number().min(1)
  }
});

export default settingsValidationSchema;
