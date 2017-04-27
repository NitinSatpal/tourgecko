'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Booking = mongoose.model('Booking'),
  Notification = mongoose.model('Notification'),
  ProductSession = mongoose.model('ProductSession'),
  moment = require('moment'),
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
    booking.bookingDate = moment(Date.now());
    booking.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        sendNotification(req.body.bookingDetails, req.body.productData.productTitle, booking._id);
        if(!booking.isOpenDateTour)
          updateSession(booking);
        else
          createSession(booking, req.body.productData);
        res.json(booking);
      }
    });
  });
};

function sendNotification(bookingObject, productTitle, bookingId) {
  var notification = new Notification();
  notification.notificationFrom = bookingObject.providedGuestDetails.firstName + ' ' + bookingObject.providedGuestDetails.lastName;
  notification.notificationTypeLogo = 'modules/chat/client/images/booking-request.png';
  notification.bookingId = bookingId;
  notification.notificationToId = bookingObject.hostOfThisBooking;
  notification.notificationType = "Booking Request";
  notification.notificationBody = "You have a booking request for '" + productTitle + "'.";
  notification.notificationStatus = "Action Pending by Host";
  notification.notificationRead = false;
  notification.notificationTimestamp = moment(Date.now());
  var splitTimestamp = notification.notificationTimestamp.split(' ');
  notification.notificationTimestampToDisplay = splitTimestamp.slice(0, splitTimestamp.length - 1).join(' ');
  notification.created = Date.now();

  notification.save(function (err) {
    if (err) {
      // notification sending failed
    } else {
      // notification successfully sent
    }
  });
}

function updateSession(booking) {
  if (booking.productSession) {
    ProductSession.findOne({_id: booking.productSession}).exec(function (err, session) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      
      if (!session.numberOfBookings) {
        var key = booking.actualSessionDate;
        session.numberOfBookings = {
          [key] : 1
        }
      } else {
        if(session.numberOfBookings[booking.actualSessionDate]) {
          var key = booking.actualSessionDate;
          var value = parseInt(session.numberOfBookings[key]) + 1;
          session.numberOfBookings[key] = value;
        } else {
          var key = booking.actualSessionDate;
          session.numberOfBookings[key] = 1;
        }
      }
      
      if (!session.numberOfSeats) {
        var key = booking.actualSessionDate;
        var value = parseInt(booking.numberOfSeats);
        session.numberOfSeats = {
          [key] : value
        }
      } else {
        if (session.numberOfSeats[booking.actualSessionDate]) {
          var key = booking.actualSessionDate;
          var value = parseInt(session.numberOfSeats[key]) + parseInt(booking.numberOfSeats);
          session.numberOfSeats[key] = value;
        } else {
          var key = booking.actualSessionDate;
          session.numberOfSeats[key] = parseInt(booking.numberOfSeats);
        }
      }

      session.markModified('numberOfBookings');
      session.markModified('numberOfSeats');
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

// create session for open dated tour booking
function createSession (booking, product) {
  var productSession = new ProductSession();
  var departureDetails = {
    startTime: "",
    startDate: booking.openDatedTourDepartureDate,
    repeatBehavior : "Do not repeat"
  };
  productSession.sessionDepartureDetails = departureDetails;
  productSession.isSessionPricingValid = true;
  productSession.sessionPricingDetails = product.productPricingOptions;
  var keyBooking = booking.actualSessionDate;
  productSession.numberOfBookings[keyBooking] = 1;
  var keySeats = booking.actualSessionDate;
  productSession.numberOfSeats[keySeats] = parseInt(booking.numberOfSeats);
  productSession.markModified('numberOfBookings');
  productSession.markModified('numberOfSeats');
  var eventDate = new Date(booking.openDatedTourDepartureDate);
  var uniqueString = eventDate.getMonth().toString() + eventDate.getUTCFullYear().toString();
  productSession.monthsThisSessionCovering = uniqueString;
  productSession.hostCompany = product.hostCompany;
  productSession.product = product._id;
  productSession.save(function (err) {
    if (err) {
      // session saving failed
    } else {
      // session successfully saved
    }
  });
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

// Fetch all bookings
exports.fetchAllBookingDetailsOfCompany = function (req, res) {
  if (req.user) {
    if(req.params.itemsPerPage !== undefined && req.params.itemsPerPage !== null && req.params.itemsPerPage !== '') {
      Booking.count({hostOfThisBooking: req.user._id}, function(error, count) {
        Booking.find({hostOfThisBooking: req.user._id}).limit(req.params.itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.json({bookingArray: bookings, bookingsCount: count});
        });
      });
    } else {
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

// Fetch all bookings for current page
exports.fetchSessionBookingDetailsForCurrentPage = function (req, res) {
  if (req.user) {
    var pageNumber = req.params.pageNumber;
    var itemsPerPage = req.params.itemsPerPage;
    var sessionId = req.params.productSessionId;
    Booking.find({productSession: sessionId}).skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(bookings);
    });
  }
};

// Fetch categorized bookings for company
exports.fetchCategorizedBookings = function (req, res) {
  var pageNumber = req.body.pageNumber;
  var itemsPerPage = req.body.itemsPerPage;
  console.log(req.body.categoryKeys);
  Booking.count({bookingStatus: {$in: req.body.categoryKeys}}, function(error, count) {
    if (count <= itemsPerPage * (pageNumber - 1))
      pageNumber = 1;
    if (pageNumber == 0)
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
};

// Fetch categorized bookings for session
exports.fetchCategorizedBookingsForASession = function (req, res) {
  var pageNumber = req.body.pageNumber;
  var itemsPerPage = req.body.itemsPerPage;
  var sessionId = req.body.productSessionId;
  if (pageNumber == 0)
      pageNumber = 1;
  Booking.count({productSession: sessionId, bookingStatus: {$in: req.body.categoryKeys}}, function(error, count) {
    if (count <= itemsPerPage * (pageNumber - 1))
      pageNumber = 1;
    Booking.find({productSession: sessionId, bookingStatus: {$in: req.body.categoryKeys}}).skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json({bookingArray: bookings, bookingsCount: count});
    });
  });
};

// Fetch product session booking details
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

// Fetch product session booking details
exports.fetchProductSessionBookingDetailsForGuestData = function (req, res) {
  if (req.user) {
    var skipIndex = req.params.skipIndex;
    Booking.count({productSession: req.params.productSessionId}, function(error, count) {
      Booking.find({productSession: req.params.productSessionId}).skip(skipIndex * 20).limit(20).sort('-created').exec(function (err, bookings) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        res.json({guestData: bookings, guestDataCount: count});
      });
    });
  }
};


// Fetch all bookings of product session
exports.fetchAllBookingsOfProductSession = function (req, res) {
  if (req.user) {
    if(req.params.itemsPerPage !== undefined && req.params.itemsPerPage !== null && req.params.itemsPerPage !== '') {
      Booking.count({productSession: req.params.productSessionId}, function(error, count) {
        Booking.find({productSession: req.params.productSessionId}).limit(req.params.itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.json({bookingArray: bookings, bookingsCount: count});
        });
      });
    } else {
      Booking.count({productSession: req.params.productSessionId}, function(error, count) {
        Booking.find({productSession: req.params.productSessionId}).limit(10).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.json({bookingArray: bookings, bookingsCount: count});
        });
      });
    }
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

