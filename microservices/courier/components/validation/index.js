const Joi = require('joi');
const utils = require("../utils");
const logger = require("../logger").logger;
 
const getCourierRatesSchema = Joi.object({
    domestic: Joi.string().required(),

    from_country: Joi.string().required(), 
    from_state: Joi.string().required(),
    from_postcode: Joi.string().required(),

    to_country:Joi.string().required(),
    to_state: Joi.string().required(),
    to_postcode: Joi.string().required(),

    length: Joi.string().required(),
    width: Joi.string().required(),
    height: Joi.string().required(),
    type: Joi.string().required(),
    parcel_weight: Joi.string().required(),
    doc_weight: Joi.string().optional()
});

module.exports.getCourierRates = function getCourierRates(req, res, next) {
  const isValid = getCourierRatesSchema.validate(req.body);
  return validateSchema(req, res, next, isValid, 'filteSchema')
};

const validateSchema = function validateSchema(req, res, next, isValid, schema_name) {
  if (isValid.error){
  	logger.error({
		path: schema_name+'/error',
		info: schema_name+' failed',
		err: isValid.error.details[0].message,
	});
    return res.status(200).send(utils.prepareResponse(200, isValid.error.details[0].message, []))
  }
  return next();
};