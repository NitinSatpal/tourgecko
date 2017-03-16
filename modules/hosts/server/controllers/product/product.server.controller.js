'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  ProductSession = mongoose.model('ProductSession'),
  // cron = require('cron'),
  async = require('async'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Creating product here.
exports.createProduct = function (req, res) {
  var product = new Product(req.body.tour);
  product.user = req.user;
  product.created = Date.now();
  product.lastUpdated = Date.now();
  product.hostCompany = req.user.company;
  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    if(req.body.tour.isProductScheduled == true)
      createDepartureSessions(req.body.toursessions, req.body.sessionPricings, product);
    res.json(product);
  });
  
};

function createDepartureSessions (departureSessions, departureSessionPricings, product) {
  var productSessions = [];
  for(var index = 0; index < departureSessions.length; index++) {
    var productSession = new ProductSession();
    productSession.product = product._id;
    productSession.hostCompany = product.hostCompany;
    productSession.sessionDepartureDetails = departureSessions[index];
    productSession.sessionPricingDetails = departureSessionPricings[index];
    productSessions.push(productSession.toObject());
  }
  ProductSession.collection.insert(productSessions, onInsert);
}

function onInsert(err, docs) {
  // Tour Sessions inserted successfully.
} 

exports.editProduct = function(req, res) {
  Product.findOne({ '_id': req.body.tour._id }).exec(function (err, product) {
    if(err) {
      console.log(err);
    } else {
      for (var field in Product.schema.paths) {
        if ((field !== '_id') && (field !== '__v')) {
          if (req.body.tour[field] !== undefined) {
            product[field] = req.body.tour[field];
          } 
        }
      }
      product.save();
      if(req.body.toursessions.length > 0)
        createDepartureSessions(req.body.toursessions, req.body.sessionPricings, product);
      res.json(product);
    }
  });
};

// Fetching products details here.
exports.fetchAllProductDetails = function (req, res) {
  Product.find().sort({created: -1}).populate('user').exec(function (err, products) {
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
  Product.find({ '_id': req.params.productId }).sort('-created').populate('hostCompany').exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(products);
  });
};

// Fetch Single product details
exports.fetchCompanyProductDetails = function (req, res) {
  if (req.user) {
    Product.find({ 'hostCompany': req.user.company }).sort('-created').populate('').exec(function (err, products) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(products);
    });
  }
};


// Fetching all product session details here.
exports.fetchAllProductSessionDetails = function (req, res) {
  ProductSession.find().sort('-created').populate('product').exec(function (err, productSessions) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(productSessions);
  });
};

// Fetching single product session details here.
exports.fetchSingleProductSessionDetails = function (req, res) {
  ProductSession.findOne({ '_id': req.params.productSessionId }).populate('product').exec(function (err, productSession) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(productSession);
  });
};

// Fetching sessions of given product here.
exports.fetchSessionDetailsOfGivenProduct = function (req, res) {
  ProductSession.find({ 'product': req.params.productId }).populate('product').exec(function (err, productSessions) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(productSessions);
  });
};

// Fetching specific company's product details here.
exports.fetchCompanyProductSessionDetails = function (req, res) {
  if(req.user) {
    ProductSession.find({'hostCompany': req.user.company }).sort('-created').populate('product').exec(function (err, productSessions) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(productSessions);
    });
  }
};

exports.uploadProductPicture = function (req, res) {
  var user = req.user;
  var upload = multer(config.uploads.productPictureUploads).array('files');
  var imageUploadFileFilter = require(path.resolve('./config/lib/multer')).imageUploadFileFilter;
  var productPictureUrlsStore = [];

  // Filtering to upload only images
  upload.fileFilter = imageUploadFileFilter;
  if (user) {
    uploadImage()
      .then(onUploadSuccess)
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
          // Send error code as we are customising the error messages.
          // reject(errorHandler.getErrorMessage(uploadError));
          reject(uploadError.code);
        } else {
          if (req.body.previousFiles) {
            if (typeof req.body.previousFiles == 'string')
              productPictureUrlsStore.push(req.body.previousFiles);
            else
              productPictureUrlsStore = req.body.previousFiles;
          }
          for (var index = 0; index < req.files.length; index++) {
            productPictureUrlsStore.push(config.uploads.productPictureUploads.dest + req.files[index].filename);
          }
          resolve();
        }
      });
    });
  }

  function onUploadSuccess () {
    res.json(productPictureUrlsStore);
    return true;
  }
};

exports.uploadProductMap = function (req, res) {
  var user = req.user;
  var upload = multer(config.uploads.productMapUploads).array('files');
  var imageUploadFileFilter = require(path.resolve('./config/lib/multer')).imageUploadFileFilter;
  var productMapUrlsStore = [];

  // Filtering to upload only images
  upload.fileFilter = imageUploadFileFilter;
  if (user) {
    uploadMap()
      .then(onUploadSuccess)
      .catch(function (err) {
        res.status(400).send(err);
      });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }

  function uploadMap () {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(uploadError.code);
        } else {
          if (req.body.previousFiles) {
            if (typeof req.body.previousFiles == 'string')
              productMapUrlsStore.push(req.body.previousFiles);
            else
              productMapUrlsStore = req.body.previousFiles;
          }
          for (var index = 0; index < req.files.length; index++)
            productMapUrlsStore.push(config.uploads.productMapUploads.dest + req.files[index].filename);
          resolve();
        }
      });
    });
  }

  function onUploadSuccess () {
    res.json(productMapUrlsStore);
    return true;
  }
};

/* var cronJob = cron.job('00 30 00 * * *', function() {
  async.waterfall([
    function (done) {
      var productSessions = [];
      Product.find({ 'isProductScheduled': true }).sort('-created').populate('').exec(function (err, products) {
        if (err) {
          console.log('error occurred in finding the required documents');
        } else {
          products.forEach(function(product) {
            var productSession = new ProductSession();
            productSession.product = product._id;
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
          console.log('productsessions not added due to some error');
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
  console.info('cron job completed');
}); 
cronJob.start();
*/
