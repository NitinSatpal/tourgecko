'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  mongoose = require('mongoose'),
  TraceLog = mongoose.model('TraceLog'),
  moment = require('moment'),
  momentTimezone = require('moment-timezone'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// create tracelog
exports.createTraceLog = function (objectType, objectId, tracelogMessage) {
  var tracelog = new TraceLog();
  tracelog.objectType = objectType;
  tracelog.objectId = objectId;
  tracelog.traceDate = momentTimezone.utc(new Date()).tz('Asia/Calcutta').format('ddd Do MMMM YYYY h:mm a');
  tracelog.tracelogMessage = tracelogMessage;
  tracelog.created = Date.now();
  tracelog.save(function (err) {
    if (err) {
      // tracelog save failed
    } else {
      // tracelog successfully saved
    }
  });
};

// fetch tracelogs
exports.fetchTraceLog = function (req, res) {
  TraceLog.find({objectId: req.params.objectId}).sort('created').populate('').exec(function (err, tracelogs) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(tracelogs);
    });
};