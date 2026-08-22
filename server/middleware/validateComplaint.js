const Joi = require('joi');

const complaintValidationSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 100 characters',
  }),
  description: Joi.string().trim().min(10).max(1000).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 1000 characters',
  }),
  category: Joi.string()
    .valid('Safety', 'Environment', 'Production', 'Labour', 'Equipment', 'General')
    .default('General'),
  mineSite: Joi.string().trim().allow('', null).optional(),
  priority: Joi.string()
    .valid('Low', 'Medium', 'High', 'Critical')
    .default('Medium'),
  location: Joi.alternatives().try(
    Joi.string().allow('', null),
    Joi.object().unknown(true)
  ).optional(),
  latitude: Joi.number().allow(null, '').optional(),
  longitude: Joi.number().allow(null, '').optional(),
  address: Joi.string().allow(null, '').optional(),
}).unknown(true);

const validateComplaint = (req, res, next) => {
  const { error } = complaintValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ message: 'Validation failed', errors: errorMessages });
  }

  next();
};

module.exports = validateComplaint;