'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.getToursite = function (req, res) {
  var userName = req.query.username;
  var tourSite = req.query.toursite;
  if (userName === undefined) {
    User.findOne({ toursite: tourSite }, '-salt -password').sort('-created').exec(function (err, user) {
      if (err) {
        res.status(500).render('modules/core/server/views/500', {
          error: 'Oops! Something went wrong...'
        });
      }
      res.json(user);
    });
  } else {
    User.findOne({ username: userName }, '-salt -password').sort('-created').exec(function (err, user) {
      if (err) {
        res.status(500).render('modules/core/server/views/500', {
          error: 'Oops! Something went wrong...'
        });
      }
      res.json(user);
    });
  }
};

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
