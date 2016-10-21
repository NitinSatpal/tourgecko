'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  ProductSession = mongoose.model('ProductSession'),
  cron = require('cron'),
  async = require('async'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Creating product here.
exports.createProduct = function (req, res) {
  var product = new Product(req.body);
  product.user = req.user;

  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(product);
  });
};

// Fetching products details here.
exports.fetchAllProductDetails = function (req, res) {
  Product.find().sort('-created').populate('').exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(products);
  });
};

// Fetch Single product details
// Fetching product details here.
exports.fetchSingleProductDetails = function (req, res) {
  Product.find({ '_id': req.params.productId }).sort('-created').populate('').exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(products);
  });
};

var cronJob = cron.job('00 30 00 * * *', function() {
  async.waterfall([
    function (done) {
      var productSessions = [];
      Product.find({ 'isProductScheduled': true }).sort('-created').populate('').exec(function (err, products) {
        if (err) {
          console.log('error occurred in finding the required documents');
        } else {
          products.forEach(function(product) {
            var productSession = new ProductSession();
            productSession.product = product;
            productSessions.push(productSession.toObject());
          });
        }
        done(err, productSessions);
      });
    },
    function (productSessions, done) {
      // All cluster worker threads tries to enter this data into collection. For now, I kept the model field as unique. But going forward
      // we should find some good solution
      ProductSession.collection.insert(productSessions, onInsert);
      function onInsert(err, success) {
        if (err) {
          console.log('productsessions not added ');
        } else {
          console.log('successfully saved');
        }
      }
    }
  ], function (error, success) {
    if (error) {
      console.log('Something is wrong!');
    }
    console.log('Done!');
  });
  console.info('cron job completed 5');
});
cronJob.start();
