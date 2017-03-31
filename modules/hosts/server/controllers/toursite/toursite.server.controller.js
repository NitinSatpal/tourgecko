
'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Product = mongoose.model('Product'),
  Company = mongoose.model('HostCompany'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Finding if toursite exists or not.
exports.getToursite = function (req, res) {
  var userId;
  if (req.user !== undefined)
    userId = req.user._id;
  var tourSite = req.query.toursite;
  if (userId === undefined) {
    Company.findOne({ toursite: tourSite }, '-salt -password').sort('-created').populate('user').exec(function (err, company) {
      if (err) {
        res.status(500).render('modules/core/server/views/500', {
          error: 'Oops! Something went wrong...'
        });
      }
      res.json(company);
    });
  } else {
    if (req.user) {
      Company.findOne({ user: req.user._id }, '-salt -password').sort('-created').populate('user').exec(function (err, company) {
        if (err) {
          res.status(500).render('modules/core/server/views/500', {
            error: 'Oops! Something went wrong...'
          });
        }
        res.json(company);
      });
    }
  }
};

// Fetch toursite data i.e. data of the toursite for a specific user.
exports.getToursiteData = function (req, res) {
  var tourSite = req.params.toursite;

  Company.findOne({ toursite: tourSite }, '-salt -password').exec(function (err, company) {
    if (err) {
      res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong...'
      });
    }
    Product.count({hostCompany: company._id}, function(error, count){
      Product.find({hostCompany: company._id}).limit(20).sort('-created').populate('user').populate('hostCompany').exec(function (err, products) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        res.json({productArray: products, productCount: count});
      });
    });
  });
};


// Fetch toursite data i.e. data of the toursite for a specific user.
exports.getToursiteDataForCurrentPage = function (req, res) {
  var tourSite = req.params.toursite;
  var pageNumber = req.params.pageNumber;
  var itemsPerPage = req.params.itemsPerPage;
  
  Company.findOne({ toursite: tourSite }, '-salt -password').exec(function (err, company) {
    if (err) {
      res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong...'
      });
    }
    
    Product.find({hostCompany: company._id}).sort('-created').skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).populate('user').populate('hostCompany').exec(function (err, products) {
      if (err) {
        console.log('the error is ' + err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(products);
    });
  });
};
