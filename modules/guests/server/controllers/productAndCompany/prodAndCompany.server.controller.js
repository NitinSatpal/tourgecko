'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  ProductSession = mongoose.model('ProductSession'),
  Company = mongoose.model('HostCompany'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Fetch Single product details
exports.fetchProductDetails = function (req, res) {
  Product.find({ '_id': req.params.productId }).sort('-created').populate('hostCompany').exec(function (err, products) {
    if (err) {
      // here page not found shud be rendered
    } else {
      res.json(products);
    }
  });
};

exports.fethcProductSessionsOfProduct = function (req, res) {
  ProductSession.find({product: req.params.productId}).sort('created').exec(function (err, productSessions) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(productSessions);
  });
};


