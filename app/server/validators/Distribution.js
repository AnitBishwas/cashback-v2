import Joi from "joi";

const distributionValidationSchema = Joi.array().items(
    Joi.object({
        id: Joi.string().required(),
        amount: Joi.number().min(0).required(),
        expiryDate: Joi.date().min('now').required(),
        note: Joi.string().optional()
    }).unknown(true)
).min(1);

export default distributionValidationSchema;