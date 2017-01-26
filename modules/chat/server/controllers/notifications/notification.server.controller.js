'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Notification = mongoose.model('Notification'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


exports.fetchNotificationDetails = function (req, res) {
  if (req.user) {
    Notification.find({'notificationToId': req.user._id}).sort('-created').exec(function (err, notifications) {
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

exports.fetchUnreadNotifications = function (req, res) {
  if (req.user) {
    Notification.find({'notificationToId': req.user._id, notificationRead: false}).sort('-created').exec(function (err, notifications) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(notifications);
    });
  }
};

