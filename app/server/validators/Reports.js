import Joi from "joi";

const reportValidationSchema = Joi.object({
  type: Joi.string().lowercase().required().valid("utilisation"),
  dateRange: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required(),
  }).required(),
  recipients: Joi.array().items(Joi.string().email().required()).min(1),
  user: Joi.object({
    email: Joi.string(),
    name: Joi.string(),
  }),
});

export default reportValidationSchema;
