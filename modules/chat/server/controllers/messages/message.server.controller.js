'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Message = mongoose.model('Message'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Creating product here.
exports.saveMessageDetails = function (req, res) {
  var message = new Message(req.body);
  message.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      console.log('message saved successfully');
    }
  });
};

exports.fetchMessageDetails = function (req, res) {
  Message.find({'messageToId': req.user._id}).sort('-created').exec(function (err, messages) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(messages);
  });
};

