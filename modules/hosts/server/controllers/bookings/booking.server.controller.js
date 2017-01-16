'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Booking = mongoose.model('Booking'),
  Notification = mongoose.model('Notification'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Creating product here.
exports.createBooking = function (req, res) {
  var booking = new Booking(req.body.bookingDetails);
  booking.user = req.user; 
  booking.created = Date.now();
  booking.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      console.log('the booking created is ' + booking);
      sendNotification(req.body.bookingDetails, req.user, req.body.productTitle);
      res.json(booking);
    }
  });
};

function sendNotification(bookingObject, user, productTitle) {
  var notification = new Notification();
  notification.notificationFrom = user.displayName;
  // notification.notificationTo = hostName;
  notification.notificationToId = bookingObject.hostOfThisBooking;
  notification.notificationFromProfileURL = user.profileImageURL;
  notification.notificationType = 'Booking Request';
  notification.notificationBody = 'You have a booking request for ' + productTitle + '.';
  notification.notificationStatus = 'Action Pending by Host';
  notification.notificationRead = false;

  notification.save(function (err) {
    if (err) {
      // notification sending failed
    } else {
      // notification successfully sent
    }
  });
}

// Fetch all bookings
exports.fetchCompanyBookingDetails = function (req, res) {
  Booking.find({hostOfThisBooking: req.user._id}).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(bookings);
  });
};

// Fetch single booking details
exports.fetchSingleBookingDetails = function (req, res) {
  Booking.findOne({_id: req.params.bookingId}).populate('user').populate('product').populate('productSession').exec(function (err, booking) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(booking);
  });
};

// Confirm the booking
exports.confirmTheBooking = function (req, res) {
  var query = { _id: req.params.bookingId };
  var update = { bookingStatus: 'Confirmed' };
  var options = { new: false, upsert: true };
  Booking.findOneAndUpdate(query, update, options, function (err, booking) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json();
  });
};
