'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Pinboard = mongoose.model('Pinboard'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Adding themes.
exports.savePinBoardPins = function (req, res) {
	var Pinboard_Pin = new Pinboard(req.body);
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
};

