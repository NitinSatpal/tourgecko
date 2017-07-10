'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Pin = mongoose.model('PinboardPins'),
  Goal = mongoose.model('PinboardGoals'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

//adding goals
exports.savePinBoardGoals = function (req, res) {
  var Pinboard_Goal = new Goal(req.body);
  Pinboard_Goal.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        // pin saved successfully
        res.json('goal saved');
      }
    });
};

// fetching goals
exports.fetchPinBoardGoals = function (req, res) {
  Goal.find().sort('-created').exec(function (err, goals) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(goals);
    });
};

// Adding pins.
exports.savePinBoardPins = function (req, res) {
	console.log(req.body.goal);
  if (req.body.goal) {
    Goal.findOne({_id: req.body.goal}).exec(function (err, goal) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      goal.pinsForthisGoal.push(req.body.pinData);
      goal.save();
      res.json(goal);
    });
  } else {
    var Pinboard_Pin = new Pin(req.body.pinData);
    Pinboard_Pin.save(function (err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          // pin saved successfully
          res.json('pin saved');
        }
      });
    }
};

