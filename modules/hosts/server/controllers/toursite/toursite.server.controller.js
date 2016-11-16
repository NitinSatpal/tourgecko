
'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
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
    Company.findOne({ user: req.user._id }, '-salt -password').sort('-created').populate('user').exec(function (err, company) {
      if (err) {
        res.status(500).render('modules/core/server/views/500', {
          error: 'Oops! Something went wrong...'
        });
      }
      res.json(company);
    });
  }
};

// Fetch toursite data i.e. data of the toursite for a specific user.
exports.getToursiteData = function (req, res) {
  var tourSite = req.query.toursite;
  User.find({ toursite: tourSite }, '-salt -password').sort('-created').exec(function (err, users) {
    if (err) {
      res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong...'
      });
    }
    res.json(users);
  });
};
