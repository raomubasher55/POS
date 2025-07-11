const { body, param, query } = require('express-validator');

// Common validators
const mongoIdValidator = (field) => param(field).isMongoId().withMessage(`Invalid ${field}`);

const paginationValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc'])
];

// Product validators
const productValidators = {
  create: [
    body('name').notEmpty().trim(),
    body('sku').notEmpty().trim(),
    body('categoryId').isMongoId(),
    body('pricing.retailPrice').isFloat({ min: 0 }),
    body('pricing.wholesalePrice').optional().isFloat({ min: 0 }),
    body('pricing.cost').optional().isFloat({ min: 0 })
  ],
  update: [
    mongoIdValidator('id'),
    body('name').optional().notEmpty().trim(),
    body('sku').optional().notEmpty().trim(),
    body('categoryId').optional().isMongoId(),
    body('pricing.retailPrice').optional().isFloat({ min: 0 })
  ]
};

// Sale validators
const saleValidators = {
  create: [
    body('shopId').isMongoId(),
    body('items').isArray({ min: 1 }),
    body('items.*.productId').isMongoId(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('payment.method').isIn(['cash', 'card', 'credit', 'mobile']),
    body('payment.paidAmount').isFloat({ min: 0 })
  ]
};

// Shop validators
const shopValidators = {
  create: [
    body('name').notEmpty().trim(),
    body('phone').notEmpty().trim(),
    body('address.street').notEmpty(),
    body('address.city').notEmpty(),
    body('address.state').notEmpty(),
    body('address.zipCode').notEmpty(),
    body('address.country').notEmpty()
  ]
};

module.exports = {
  mongoIdValidator,
  paginationValidators,
  productValidators,
  saleValidators,
  shopValidators
};