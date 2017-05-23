'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Notification = mongoose.model('Notification'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


exports.fetcInitialhNotificationDetails = function (req, res) {
  if (req.user) {
    Notification.find({'notificationToId': req.user._id}).limit(5).sort('-created').exec(function (err, notifications) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(notifications);
    });
  }
};

exports.fetcAllNotificationDetailsForGivenMonth = function (req, res) {
  if (req.user) {
    var year = req.params.lastYearFetched;
    var month = parseInt(req.params.lastMonthFetched);
    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);

    Notification.find({'notificationToId': req.user._id, notificationTimestamp: { $lte:  lastDay, $gte:  firstDay}}).sort('-notificationTimestamp').exec(function (err, notifications) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(notifications);
    });
  }
};


exports.markAsRead = function (req, res) {
  Notification.findOne({_id: req.params.notificationId}).exec(function (err, notification) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    notification.notificationRead = true;
    notification.save();
    res.json(notification);
  });
};

exports.getUnreadNotificationsCount = function (req, res) {
  if(req.user) {
    Notification.count({ 'notificationToId': req.user._id, notificationRead: false }, function(error, count) {
      if (error) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(error)
        });
      }
      res.json({counterValue : count});
    });
  }
};

