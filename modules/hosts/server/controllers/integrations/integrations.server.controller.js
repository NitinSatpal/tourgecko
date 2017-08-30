
'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  cors = require('cors'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Product = mongoose.model('Product'),
  Company = mongoose.model('HostCompany'),
  multer = require('multer'),
  fs = require('fs'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Finding if toursite exists or not.
exports.fetchToursForBookButtonIntegrations = function (req, res) {
  var tourSite = req.body.toursite;
  var tourIds = req.body.tourIds;
  Company.findOne({ toursite: tourSite }, '-salt -password').exec(function (err, company) {
    if (err) {
      res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong...'
      });
    }
    if (company) {
      Product.count({user: company.user, isPublished: true, _id: {$in: tourIds}}, function(error, count) {
        Product.find({user: company.user, isPublished: true, _id: {$in: tourIds}}).limit(10).sort('-created').populate('user').exec(function (err, products) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.json({productArray: products, productCount: count, companyData: company});
        });
      });
    } else {
      res.json('noToursite')
    }
  });
};

