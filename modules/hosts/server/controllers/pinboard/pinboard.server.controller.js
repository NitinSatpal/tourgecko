'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),  
  Pin = mongoose.model('PinboardPins'),
  Goal = mongoose.model('PinboardGoals'),
  Company = mongoose.model('HostCompany'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


// fetch pinboard goals
exports.fetchPinboardGoals = function (req, res) {
  if(req.user) {
    Goal.find({ $or: [{to : 'all'}, {to : req.user._id}]}).sort('-created').exec(function (err, goals) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(goals);
    });
  }
};

// Fetch pinboard pins
exports.fetchPinboardPins = function (req, res) {
  if(req.user) {
    Company.findOne({user: req.user._id}).exec(function (err, company) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      var dismissedPinsIds = company.pinboardPinsDismissed;
      Pin.find({ $or: [{to : 'all'}, {to : req.user._id}], _id : {$nin: dismissedPinsIds} }).sort('-created').exec(function (err, pins) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        res.json(pins);
      });
    });
  }
};

// Set dissmiss messages ids
exports.setDismissedMessageIds = function (req, res) {
  if (req.user) {
    Company.findOne({user: req.user._id}).exec(function (err, company) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      company.pinboardPinsDismissed.push(req.body.pinId);
      company.save();
      res.json(company);
    });
  }
}
