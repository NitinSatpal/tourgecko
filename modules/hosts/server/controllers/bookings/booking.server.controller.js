'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Booking = mongoose.model('Booking'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Creating product here.
exports.createBooking = function (req, res) {
  var booking = new Booking(req.body);
  booking.user = req.user;
  booking.product = req.product;
  booking.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(booking);
    }
  });
};

// Fetch all bookings
exports.fetchCompanyBookingDetails = function (req, res) {
  Booking.find({user: req.user._id}).sort('-created').populate('').exec(function (err, bookings) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(bookings);
  });
};
