import Joi from "joi";

const discountValidationSchema = Joi.object({
  id: Joi.string().optional(),
  title: Joi.string().required().min(1),
  status: Joi.string().valid("active", "draft").required(),
  type: Joi.string().valid("percentage", "fixed").required(),
  value: Joi.number().min(0).required(),
  orderAboveApplication: Joi.boolean().required(),
});

export default discountValidationSchema;
