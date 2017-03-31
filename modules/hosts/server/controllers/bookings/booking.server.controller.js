'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Booking = mongoose.model('Booking'),
  Notification = mongoose.model('Notification'),
  ProductSession = mongoose.model('ProductSession'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var alphabetArray = ['A', 'B', 'C', 'D', 'E'];
// Creating product here.
exports.createBooking = function (req, res) {
  Booking.count({hostOfThisBooking: req.body.bookingDetails.hostOfThisBooking}, function(err, count) {
    var booking = new Booking(req.body.bookingDetails);
    booking.user = req.user;
    var referenceNumber = count + 1000;
    booking.bookingReference = alphabetArray[Math.floor(Math.random() * alphabetArray.length)] + referenceNumber;
    booking.created = Date.now();
    booking.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        sendNotification(req.body.bookingDetails, req.user, req.body.productTitle, booking._id);
        updateSession(booking.productSession, booking.numberOfBookings);
        res.json(booking);
      }
    });
  });
};

function sendNotification(bookingObject, user, productTitle, bookingId) {
  var notification = new Notification();
  if (user) {
    notification.notificationFrom = user.displayName;
    notification.notificationFromProfileURL = user.profileImageURL;
  }
    
  notification.bookingId = bookingId;
  notification.notificationToId = bookingObject.hostOfThisBooking;
  notification.notificationType = 'Booking Request';
  notification.notificationBody = 'You have a booking request for ' + productTitle + '.';
  notification.notificationStatus = 'Action Pending by Host';
  notification.notificationRead = false;
  notification.created = Date.now();

  notification.save(function (err) {
    if (err) {
      // notification sending failed
    } else {
      // notification successfully sent
    }
  });
}

function updateSession(productSessionId, numOfBookings) {
  if (productSessionId) {
    ProductSession.findOne({_id: productSessionId}).exec(function (err, session) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      session.numberOfBookings = session.numberOfBookings + numOfBookings;
      session.save(function (err) {
        if (err) {
          // session saving failed
        } else {
          // session successfully saved
        }
      });
    });
  }
}

// Fetch all bookings
exports.fetchCompanyBookingDetailsForCalendar = function (req, res) {
  if (req.user) {
    Booking.find({hostOfThisBooking: req.user._id}).limit(10).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(bookings);
    });
  }
};

// Fetch all bookings
exports.fetchCompanyBookingDetails = function (req, res) {
  if (req.user) {
    Booking.count({hostOfThisBooking: req.user._id}, function(error, count) {
      Booking.find({hostOfThisBooking: req.user._id}).limit(10).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        res.json({bookingArray: bookings, bookingsCount: count});
      });
    });
  }
};

// Fetch all bookings for current page
exports.fetchCompanyBookingDetailsForCurrentPage = function (req, res) {
  if (req.user) {
    var pageNumber = req.params.pageNumber;
    var itemsPerPage = req.params.itemsPerPage;
    Booking.find({hostOfThisBooking: req.user._id}).skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(bookings);
    });
  }
};

// Fetch categorized bookings
exports.fetchCategorizedBookings = function (req, res) {
  var pageNumber = req.body.pageNumber;
  var itemsPerPage = req.body.itemsPerPage;
  var queryAll = req.body.queryAll;

  if (queryAll) {
    Booking.count(function(error, count) {
      if (count <= itemsPerPage * (pageNumber - 1))
        pageNumber = 1;
      Booking.find().skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        res.json({bookingArray: bookings, bookingsCount: count});
      });
    });
  } else {
    Booking.count({bookingStatus: {$in: req.body.categoryKeys}}, function(error, count) {
      if (count <= itemsPerPage * (pageNumber - 1))
        pageNumber = 1;
      Booking.find({bookingStatus: {$in: req.body.categoryKeys}}).skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        res.json({bookingArray: bookings, bookingsCount: count});
      });
    });
  }
};

// Fetch specific product booking details
exports.fetchProductSessionBookingDetails = function (req, res) {
  if (req.user) {
    Booking.find({productSession: req.params.productSessionId}).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(bookings);
    });
  }
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
exports.modifyBooking = function (req, res) {
  var query = { _id: req.body.bookingId };
  var update = { bookingStatus: req.body.bookingStatus, bookingComments: req.body.bookingComments};
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

