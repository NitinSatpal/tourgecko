'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  ProductSession = mongoose.model('ProductSession'),
  //cron = require('cron'),
  async = require('async'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
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

// Fetching products details here.
exports.fetchAllProductSessionDetails = function (req, res) {
  ProductSession.find().sort('-created').populate('').exec(function (err, productSessions) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(productSessions);
  });
};

exports.uploadProductPicture = function (req, res) {
  var user = req.user;
  var upload = multer(config.uploads.productPictureUploads).single('newProductPicture');
  var imageUploadFileFilter = require(path.resolve('./config/lib/multer')).imageUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = imageUploadFileFilter;
  if (user) {
    uploadImage()
      .then(function () {
        res.json(config.uploads.productPictureUploads.dest + req.file.filename);
      })
      .catch(function (err) {
        res.status(400).send(err);
      });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }

  function uploadImage () {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }
};

exports.uploadProductMap = function (req, res) {
  var user = req.user;
  var upload = multer(config.uploads.productMapUploads).single('newProductMap');
  var imageUploadFileFilter = require(path.resolve('./config/lib/multer')).imageUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = imageUploadFileFilter;
  if (user) {
    uploadImage()
      .then(function () {
        res.json(config.uploads.productMapUploads.dest + req.file.filename);
      })
      .catch(function (err) {
        res.status(400).send(err);
      });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }

  function uploadImage () {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }
};

//var cronJob = cron.job('01 48 00 * * *', function() {
//  async.waterfall([
//    function (done) {
//      var productSessions = [];
//      Product.find({ 'isProductScheduled': true }).sort('-created').populate('').exec(function (err, products) {
//        if (err) {
//          console.log('error occurred in finding the required documents');
//        } else {
//          products.forEach(function(product) {
//            var productSession = new ProductSession();
//            productSession.product = product;
//            productSessions.push(productSession.toObject());
//          });
//        }
//        done(err, productSessions);
//      });
//    },
//    function (productSessions, done) {
//      // All cluster worker threads tries to enter this data into collection. For now, I kept the model field as unique. But going forward
//      // we should find some good solution
//      ProductSession.collection.insert(productSessions, onInsert);
//      function onInsert(err, success) {
//        if (err) {
//          console.log('productsessions not added');
//        } else {
//          console.log('successfully saved');
//        }
//      }
//    }
//  ], function (error, success) {
//    if (error) {
//      console.log('Something is wrong!');
//    }
//    console.log('Done!');
//  });
//  console.info('cron job completed');
//});
//cronJob.start();
