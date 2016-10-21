'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Theme = mongoose.model('Theme'),
  Activity = mongoose.model('Activity'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Get Hosts.
exports.getHosts = function (req, res) {
  User.find({ 'userType': 'host' }, '-salt -password -providerData').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};

// Get themes
exports.getThemes = function (req, res) {
  Theme.find().sort('-created').populate('').exec(function (err, themes) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(themes);
  });
};

// Get Activities
exports.getActivities = function (req, res) {
  Activity.find().sort('-created').populate('').exec(function (err, activities) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(activities);
  });
};

