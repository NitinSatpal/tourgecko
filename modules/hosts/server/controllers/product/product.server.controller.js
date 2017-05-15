'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  ProductSession = mongoose.model('ProductSession'),
  Pinboard = mongoose.model('Pinboard'),
  // cron = require('cron'),
  async = require('async'),
  multer = require('multer'),
  fs = require('fs'),
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
      createDepartureSessions(req.body.toursessions, req.body.sessionPricings, req.body.monthsCovered, product, true);

    editPinBoardPinsForThisHost(req.user._id, 'tourAdd');
    res.json(product);
  });
};

function editPinBoardPinsForThisHost (userId, code) {
  Pinboard.findOneAndUpdate({ initialPinUniqueCode: code, todoCompletedBy: {$not: { $in: [userId.toString()]}}}, {$push: {todoCompletedBy:  userId.toString()}}).exec(function (err, pinboardData) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
  });
}

function createDepartureSessions (departureSessions, departureSessionPricings, sessionMonthsCovering, product, sessionPricingValid) {
  var productSessions = [];
  for(var index = 0; index < departureSessions.length; index++) {
    var productSession = new ProductSession();
    productSession.product = product._id;
    productSession.hostCompany = product.hostCompany;
    productSession.sessionDepartureDetails = departureSessions[index];
    productSession.sessionPricingDetails = departureSessionPricings[index];
    productSession.monthsThisSessionCovering = sessionMonthsCovering[index];
    productSession.isSessionPricingValid = sessionPricingValid;
    productSessions.push(productSession.toObject());
  }
  ProductSession.collection.insert(productSessions, onInsert);
}

function editOldDepartureSessionPricing (request, product) {
  ProductSession.update({}, {isSessionPricingValid: false}, {multi: true}, 
    function(err, num) {
      if(err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      if (request !== undefined)
        createDepartureSessions(request.body.toursessions, request.body.sessionPricings, request.body.monthsCovered, product, true);
    }
  );
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
      if(req.body.changePreviouslyCreatedSessionPricing == true) {
        if(req.body.toursessions.length == 0)
          editOldDepartureSessionPricing(undefined);
        else {
          if(req.body.changeNewlyCreatedSessionPricing == true) {
            createDepartureSessions(req.body.toursessions, req.body.sessionPricings, req.body.monthsCovered, product, false);
            editOldDepartureSessionPricing(undefined);
          } else {
            editOldDepartureSessionPricing(req, product);
          }
        }
      } else {
        if(req.body.toursessions.length > 0) {
          if(req.body.changeNewlyCreatedSessionPricing == true) {
            createDepartureSessions(req.body.toursessions, req.body.sessionPricings, req.body.monthsCovered, product, false);
          } else {
            createDepartureSessions(req.body.toursessions, req.body.sessionPricings, req.body.monthsCovered, product, true);
          }
        }
      }
      res.json(product);
    }
  });
};

// Change product visibility
exports.changeProductVisibility = function (req, res) {
  var productArray = req.body.changedStatus;
  var productIdToStatus = new Map();
  productArray.forEach(function(item) {
    var key = Object.keys(item)[0];
    productIdToStatus.set(key, item[key]);
  });
  Product.find({ '_id': {$in : req.body.changedIds} }).exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    var productStore = []
    products.forEach(function(product) {
      product.isPublished = productIdToStatus.get(product._id.toString());
      product.save();
    });
  });
}

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

// Fetch Company product details
exports.fetchCompanyProductDetails = function (req, res) {
  if (req.user) {
    Product.count({ 'hostCompany': req.user.company }, function(error, count) {
      Product.find({ 'hostCompany': req.user.company }).limit(10).sort('-created').populate('').exec(function (err, products) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        res.json({productArray: products, productCount: count});
      });
    });
  }
};


// Fetch Company product details
exports.fetchAllProductDetailsOfCompany = function (req, res) {
  if (req.user) {
    if(req.params.itemsPerPage !== undefined && req.params.itemsPerPage !== null && req.params.itemsPerPage !== '') {
      Product.count({ 'hostCompany': req.user.company }, function(error, count) {
        Product.find({ 'hostCompany': req.user.company }).limit(req.params.itemsPerPage).sort('-created').populate('').exec(function (err, products) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.json({productArray: products, productCount: count});
        });
      });
    } else {
      Product.count({ 'hostCompany': req.user.company }, function(error, count) {
        Product.find({ 'hostCompany': req.user.company }).limit(10).sort('-created').populate('').exec(function (err, products) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.json({productArray: products, productCount: count});
        });
      });
    }
  }
};

// Fetch Company product details for current page
exports.fetchCompanyProductDetailsForCurrentPage = function (req, res) {
  if (req.user) {
    var pageNumber = req.params.pageNumber;
    var itemsPerPage = req.params.itemsPerPage;
    Product.find({ 'hostCompany': req.user.company }).skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).sort('-created').populate('').exec(function (err, products) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(products);
    });
  }
};

// Fetch Company product details for current page after product edit
exports.fetchCompanyProductDetailsForCurrentPageAfterEdit = function (req, res) {
  if (req.user) {
    var pageNumber = req.params.pageNumber;
    var itemsPerPage = req.params.itemsPerPage;
    Product.count({ 'hostCompany': req.user.company }, function(error, count) {
      Product.find({ 'hostCompany': req.user.company }).skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).sort('-created').populate('').exec(function (err, products) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        res.json({productArray: products, productCount: count});
      });
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
    ProductSession.find({'hostCompany': req.user.company}).sort('-created').populate('product').exec(function (err, productSessions) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(productSessions);
    });
  }
};

exports.countCompanyProductSessions =function (req, res) {
  if(req.user) {
    ProductSession.count({ 'hostCompany': req.user.company }, function(error, count) {
      if (error) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(error)
        });
      }
      res.json({counterValue : count});
    });
  }
}

exports.fetchCompanyProductSessionDetailsForGivenMonth = function (req, res) {
  if(req.user) {
    var uniqueString = req.params.uniqueMonthYearString;
    ProductSession.find({'hostCompany': req.user.company, 'monthsThisSessionCovering': uniqueString}).sort('-created').populate('product').exec(function (err, productSessions) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(productSessions);
    });
  }
}

exports.uploadProductPicture = function (req, res) {
  var upload = multer(config.uploads.productPictureUploads).array('productPictures');
  var newUUID = '';
  var user = req.user;
  if (user) {
    uploadImage()
      .then(onUploadSuccess)
      .catch(function (err) {
        res.json('error');
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
          newUUID = req.files[0].filename;
          resolve();
        }
      });
    });
  }

  function onUploadSuccess () {
    res.json({success: true, newUuid: newUUID});
    return true;
  }
};

exports.deleteProductPicture = function (req, res) {
  fs.unlink(config.uploads.productPictureUploads.dest + req.body.qquuid)
  res.json({success: true, deletedUuid: req.body.qquuid});
}

exports.uploadProductMap = function (req, res) {
  var upload = multer(config.uploads.productMapUploads).array('productMaps');
  var newUUID = '';
  var user = req.user;
  if (user) {
    uploadMap()
      .then(onUploadSuccess)
      .catch(function (err) {
        res.json('error');
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
          // Send error code as we are customising the error messages.
          // reject(errorHandler.getErrorMessage(uploadError));
          reject(uploadError.code);
        } else {
          newUUID = req.files[0].filename;
          resolve();
        }
      });
    });
  }

  function onUploadSuccess () {
    res.json({success: true, newUuid: newUUID});
    return true;
  }
};

exports.deleteProductMap = function (req, res) {
  fs.unlink(config.uploads.productMapUploads.dest + req.body.qquuid)
  res.json({success: true, deletedUuid: req.body.qquuid});
}

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
