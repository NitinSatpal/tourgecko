'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  mongoose = require('mongoose'),
  Booking = mongoose.model('Booking'),
  Notification = mongoose.model('Notification'),
  ProductSession = mongoose.model('ProductSession'),
  InstamojoPaymentRequestRecord = mongoose.model('InstamojoPaymentRequest'),
  RazorpayPaymentRecord = mongoose.model('razorpayPayment'),
  Razorpay = require('razorpay'),
  moment = require('moment'),
  momentTimezone = require('moment-timezone'),
  tracelog = require(path.resolve('./modules/core/server/controllers/tracelog.server.controller')),
  mailAndMessage = require(path.resolve('./modules/mailsAndMessages/server/controllers/mailsAndMessages.server.controller')),
  randomstring = require("randomstring"),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/* Payment gateway account signup */
var Insta = require('instamojo-nodejs');
Insta.setKeys(config.paymentGateWayInstamojo.instamojoKey, config.paymentGateWayInstamojo.instamojoSecret);

// This line will be removed later. Setting sandbox mode for now
Insta.isSandboxMode(true);

var instance = new Razorpay({
  key_id: config.paymentGateWayRazorpay.razorpaykey_id,
  key_secret: config.paymentGateWayRazorpay.razorpaykey_secret
});

// Creating product here.
exports.createBooking = function (data, user, paymentURL, paymentRequestId, paymentId, paymentMethod) {
  var booking = new Booking(data.bookingDetails);
  booking.user = user;
  booking.hostCompany = data.productData.hostCompany._id;
  var bookingReference = randomstring.generate({
    length: 6,
    charset: 'alphanumeric',
    capitalization: 'uppercase'
  });
  booking.bookingReference = bookingReference;
  if (paymentMethod == 'instamojo') {
    booking.paymentRequestId = paymentRequestId;
    booking.isPaymentFulfilled = false;
  } else if (paymentMethod == 'razorpay') {
    booking.paymentId = paymentId;
    booking.isPaymentDone = true;
  }
  
  booking.created = Date.now();
  // var tz = momentTimezone.tz.guess();
  // For now hardcoding the time zone to Indian timezone. Need to find a good way to detect the timezone.
  // Above commented line always giving UTC or may be the server of Zure is in UTC timezone.
  booking.bookingDate = momentTimezone.utc(new Date()).tz('Asia/Calcutta').format('ddd Do MMMM YYYY h:mma');
  booking.save(function (err) {
    if (err) {
      return 'error';
    } else {
      return 'success';
    }
  });
};

/*function updateSession(booking, paymentURL, paymentRequestId) {
  if (booking.productSession) {
    ProductSession.findOne({_id: booking.productSession}).exec(function (err, session) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      session.paymentRequestId = paymentRequestId;
      session.paymentURL = paymentURL;
      session.save(function (err) {
        if (err) {
          return 'error';
        } else {
          return 'success';
        }
      });
    });
  }
}; */

exports.searchBooking = function (req, res) {
  // var reference = req.params.bookingReference.charAt(0).toUpperCase() + req.params.bookingReference.slice(1);
  var reference = req.params.bookingReference;
  if (req.user) {
    Booking.find({bookingReference: reference}).sort('-created').populate('').exec(function (err, bookings) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(bookings);
    });
  }
}

// Fetch all bookings
exports.fetchCompanyBookingDetails = function (req, res) {
  var itemsPerPage = 10;
  Booking.count({hostOfThisBooking: req.user._id, isPaymentDone: true}, function(error, count) {
    Booking.find({hostOfThisBooking: req.user._id, isPaymentDone: true}).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
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
      var itemsPerPage = parseInt(req.params.itemsPerPage);
      Booking.count({hostOfThisBooking: req.user._id, isPaymentDone: true}, function(error, count) {
        Booking.find({hostOfThisBooking: req.user._id, isPaymentDone: true}).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.json({bookingArray: bookings, bookingsCount: count});
        });
      });
    } else {
      var itemsPerPage = 10;
      Booking.count({hostOfThisBooking: req.user._id, isPaymentDone: true}, function(error, count) {
        Booking.find({hostOfThisBooking: req.user._id, isPaymentDone: true}).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
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
    var pageNumber = parseInt(req.params.pageNumber);
    var itemsPerPage = parseInt(req.params.itemsPerPage);
    Booking.find({hostOfThisBooking: req.user._id, isPaymentDone: true}).skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
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
    var pageNumber = parseInt(req.params.pageNumber);
    var itemsPerPage = parseInt(req.params.itemsPerPage);
    var sessionId = req.params.productSessionId;
    Booking.find({productSession: sessionId, isPaymentDone: true}).skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
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
exports.fetchAllBookingsForAParticularSession = function (req, res) {
  if (req.user) {
    var actualSessionDate = req.params.sessionStartDate;
    console.log('bhagra ' + req.params.productSessionId);
    Booking.find({productSession: req.params.productSessionId, isPaymentDone: true, actualSessionDate: actualSessionDate }).sort('-created').exec(function (err, bookings) {
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
  var pageNumber = parseInt(req.body.pageNumber);
  var itemsPerPage = parseInt(req.body.itemsPerPage);
  Booking.count({bookingStatus: {$in: req.body.categoryKeys}}, function(error, count) {
    if (count <= itemsPerPage * (pageNumber - 1))
      pageNumber = 1;
    if (pageNumber == 0)
      pageNumber = 1;

    Booking.find({hostOfThisBooking: req.user._id, bookingStatus: {$in: req.body.categoryKeys}, isPaymentDone: true}).skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
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
  var pageNumber = parseInt(req.body.pageNumber);
  var itemsPerPage = parseInt(req.body.itemsPerPage);
  var sessionId = req.body.productSessionId;
  var actualSessionDate = req.body.sessionStartDate;
  if (pageNumber == 0)
      pageNumber = 1;
  Booking.count({productSession: sessionId, actualSessionDate: actualSessionDate, bookingStatus: {$in: req.body.categoryKeys}}, function(error, count) {
    if (count <= itemsPerPage * (pageNumber - 1))
      pageNumber = 1;
    Booking.find({productSession: sessionId, actualSessionDate: actualSessionDate, bookingStatus: {$in: req.body.categoryKeys}, isPaymentDone: true}).skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
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
    Booking.find({productSession: req.params.productSessionId, isPaymentDone: true}).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
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
    var skipIndex = parseInt(req.params.skipIndex);
    var itemsPerPage = 20;
    Booking.count({productSession: req.params.productSessionId, isPaymentDone: true}, function(error, count) {
      Booking.find({productSession: req.params.productSessionId, isPaymentDone: true}).skip(skipIndex * itemsPerPage).limit(itemsPerPage).sort('-created').exec(function (err, bookings) {
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
    var itemsPerPage = parseInt(req.params.itemsPerPage);
    var actualSessionDate = req.params.sessionStartDate;
    if(req.params.itemsPerPage !== undefined && req.params.itemsPerPage !== null && req.params.itemsPerPage !== '') {
      Booking.count({productSession: req.params.productSessionId, isPaymentDone: true, actualSessionDate: actualSessionDate}, function(error, count) {
        Booking.find({productSession: req.params.productSessionId, isPaymentDone: true, actualSessionDate: actualSessionDate}).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.json({bookingArray: bookings, bookingsCount: count});
        });
      });
    } else {
      var itemsPerPage = 10;
      Booking.count({productSession: req.params.productSessionId, isPaymentDone: true, actualSessionDate: actualSessionDate}, function(error, count) {
        Booking.find({productSession: req.params.productSessionId, isPaymentDone: true, actualSessionDate: actualSessionDate}).limit(itemsPerPage).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
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
  Booking.findOne({_id: req.params.bookingId}).populate('user').populate('product').populate('productSession').populate('hostCompany').exec(function (err, booking) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(booking);
  });
};

exports.fetchSingleBookingDetailsFromPaymentRequestId = function (req, res) {
   Booking.findOne({paymentRequestId: req.params.paymentRequestId}).populate('user').populate('product').populate('productSession').populate('hostCompany').exec(function (err, booking) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(booking);
  });
}

// Confirm the booking
exports.modifyBooking = function (req, res) {
  Booking.findOne({_id: req.body.bookingId}).populate('product').populate('productSession').populate('hostCompany').exec(function (err, booking) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    var tracelogMessage = req.user.displayName + ' ' + req.body.bookingStatus + ' this booking.';
    if (req.body.bookingStatus == 'Confirmed') {
      // If the payment gateway behavior is internal, there is no need to check the paymentGateway variable as it will be constant.
      // For now, as I am integrating both to check the behavior, temporarily i will check the other variable also
      if(booking.hostCompany.paymentGatewayBehavior == 'internal') {
        // This if and it's respective else if block will get removed one the internal gateway is fixed.
        if(booking.hostCompany.paymentGateway == 'instamojo') {
          var data = new Insta.ApplicationBasedAuthenticationData();
              data.client_id = config.paymentGateWayInstamojo.instamojoKey;
              data.client_secret = config.paymentGateWayInstamojo.instamojoSecret;
          /* App based authentication to get access token */
          Insta.getAuthenticationAccessToken(data, function(appTokenError, appTokenResponse) {
            if (appTokenError) {
              res.json('Something went wrong. Please try again or contact tourgecko support');
            } else {
              Insta.setToken(config.paymentGateWayInstamojo.instamojoKey,
                            config.paymentGateWayInstamojo.instamojoSecret,
                            'Bearer' + ' ' + appTokenResponse.access_token);

              Insta.fulfilPayment(booking.paymentId, function(fulfilPaymentError, fulfilPaymentResponse) {
                if (fulfilPaymentError) {
                  res.json('Something went wrong. Please try again or contact tourgecko support');
                } else {
                  InstamojoPaymentRequestRecord.findOne({instamojo_id: booking.paymentRequestId}).exec(function (err, paymentRecord) {
                    paymentRecord.instamojo_mark_fulfilled = true;
                    paymentRecord.save(function (paymentEditError, paymentEditResponse) {
                      if (paymentEditError)
                        res.json('error');
                      booking.bookingStatus = req.body.bookingStatus;
                      booking.bookingComments = req.body.bookingComments;
                      booking.isPaymentFulfilled = true;
                      booking.save(function(bookingEditError, bookingEditResponse) {
                        if (bookingEditError) {
                          res.json(bookingEditError);
                        }
                        tracelog.createTraceLog('Booking', booking._id, tracelogMessage);
                        mailAndMessage.sendBookingEmailsToGuestAndHost(booking, req, res, req.body.bookingStatus);
                        updateSessionPositiveForConfirmedStatus(booking);
                        res.json('success')
                      });
                    })
                  });
                }
              });
            }
          });
        } else if (booking.hostCompany.paymentGateway == 'razorpay') {
          var amountToTransfer = parseInt(booking.totalAmountPaid) - 0.05 * parseInt(booking.totalAmountPaid);
          instance.payments.transfer(booking.paymentId, {
            transfers: [
              {
                account: 'acc_80Q5zypUj0Iycb',
                amount: amountToTransfer,
                currency: 'INR'
              }
            ]
          }).then((transferResponse) => {
            RazorpayPaymentRecord.findOne({razorpay_id: booking.paymentId}).exec(function(err, razorpayPaymentRecord) {
              if (err) {
                res.json('Something went wrong while saving the transferred payment. Please contact tourgecko support');
              }
              razorpayPaymentRecord.markTransferred = true;
              razorpayPaymentRecord.save(function(localPayemntSaveErr) {
                if (localPayemntSaveErr)
                  res.json('Something went wrong while saving the transferred payment. Please contact tourgecko support');
                booking.bookingStatus = req.body.bookingStatus;
                booking.bookingComments = req.body.bookingComments;
                booking.isPaymentTransferred = true;
                booking.save(function(bookingEditError, bookingEditResponse) {
                  if (bookingEditError) {
                    res.json(bookingEditError);
                  }
                  updateSessionPositiveForConfirmedStatus(booking);
                  res.json(transferResponse);
                });
              });
            });
          }).catch((transferError) => {
            // handle error
            res.json('Something went wrong. Please try again or contact tourgecko support');
          });
        }
      }
    } else {
      booking.bookingStatus = req.body.bookingStatus;
      booking.bookingComments = req.body.bookingComments;
      booking.save(function(err, success) {
        if (err)
          res.json('Something went wrong. Please try again or contact tourgecko support')
        tracelog.createTraceLog('Booking', booking._id, tracelogMessage);
        mailAndMessage.sendBookingEmailsToGuestAndHost(booking, req, res, req.body.bookingStatus);
        if (req.body.bookingStatus != 'Pending')
          updateSessionNegativeForNonConfirmedAndNonCancelledStatus(booking);
        res.json('success')
      });
    }
  });
};

function updateSessionPositiveForConfirmedStatus (booking) {
  if (booking.productSession) {
    ProductSession.findOne({_id: booking.productSession}).exec(function (err, session) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      var key = booking.actualSessionDate + booking.actualSessionTime;
      if (!session.numberOfConfirmedBookings) {
        session.numberOfConfirmedBookings = {
          [key] : 1
        }
      } else {
        if(session.numberOfConfirmedBookings[key]) {
          var value = parseInt(session.numberOfConfirmedBookings[key]) + 1;
          session.numberOfConfirmedBookings[key] = value;
        } else {
          session.numberOfConfirmedBookings[key] = 1;
        }
      }
      
      if (!session.numberOfConfirmedSeats) {
        var value = parseInt(booking.numberOfSeats);
        session.numberOfConfirmedSeats = {
          [key] : value
        }
      } else {
        if (session.numberOfConfirmedSeats[key]) {
          var value = parseInt(session.numberOfConfirmedSeats[key]) + parseInt(booking.numberOfSeats);
          session.numberOfConfirmedSeats[key] = value;
        } else {
          session.numberOfConfirmedSeats[key] = parseInt(booking.numberOfSeats);
        }
      }

      session.markModified('numberOfConfirmedBookings');
      session.markModified('numberOfConfirmedSeats');

      var sessionKey = booking.actualSessionDate;

      if (!session.numberOfConfirmedBookingsSession) {
        session.numberOfConfirmedBookingsSession = {
          [sessionKey] : 1
        }
      } else {
        if(session.numberOfConfirmedBookingsSession[sessionKey]) {
          var value = parseInt(session.numberOfConfirmedBookingsSession[key]) + 1;
          session.numberOfConfirmedBookingsSession[sessionKey] = value;
        } else {
          session.numberOfConfirmedBookingsSession[sessionKey] = 1;
        }
      }
      
      if (!session.numberOfConfirmedSeatsSession) {
        var value = parseInt(booking.numberOfSeats);
        session.numberOfConfirmedSeatsSession = {
          [sessionKey] : value
        }
      } else {
        if (session.numberOfConfirmedSeatsSession[sessionKey]) {
          var value = parseInt(session.numberOfConfirmedSeatsSession[sessionKey]) + parseInt(booking.numberOfSeats);
          session.numberOfConfirmedSeatsSession[sessionKey] = value;
        } else {
          session.numberOfConfirmedSeatsSession[sessionKey] = parseInt(booking.numberOfSeats);
        }
      }

      session.markModified('numberOfConfirmedBookingsSession');
      session.markModified('numberOfConfirmedSeatsSession');

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

function updateSessionNegativeForNonConfirmedAndNonCancelledStatus (booking) {
  if (booking.productSession) {
    ProductSession.findOne({_id: booking.productSession}).exec(function (err, session) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      var key = booking.actualSessionDate + booking.actualSessionTime;
      if (session.numberOfBookings) {
        if(session.numberOfBookings[key]) {
          var value = parseInt(session.numberOfBookings[key]) - 1;
          session.numberOfBookings[key] = value;
        }
      } 
      
      if (session.numberOfSeats) {
        if (session.numberOfSeats[key]) {
          var value = parseInt(session.numberOfSeats[key]) - parseInt(booking.numberOfSeats);
          session.numberOfSeats[key] = value;
        }
      }

      session.markModified('numberOfBookings');
      session.markModified('numberOfSeats');

      var sessionKey = booking.actualSessionDate;

      if (session.numberOfBookingsSession) {
        if(session.numberOfBookingsSession[sessionKey]) {
          var value = parseInt(session.numberOfBookingsSession[sessionKey]) - 1;
          session.numberOfBookingsSession[sessionKey] = value;
        }
      }
      
      if (session.numberOfSeatsSession) {
        if (session.numberOfSeatsSession[sessionKey]) {
          var value = parseInt(session.numberOfSeatsSession[sessionKey]) - parseInt(booking.numberOfSeats);
          session.numberOfSeatsSession[sessionKey] = value;
        }
      }

      session.markModified('numberOfBookingsSession');
      session.markModified('numberOfSeatsSession');
      
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


exports.getBookingCountForParticularStatus = function (req, res) {
  if (req.params.bookingStatus == 'All') {
    Booking.count({hostOfThisBooking: req.user._id, isPaymentDone: true}, function(error, count) {
      if (error) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(error)
        });
      }
      res.json(count);
    });
  } else {
    Booking.count({hostOfThisBooking: req.user._id, bookingStatus: req.params.bookingStatus, isPaymentDone: true}, function(error, count) {
      if (error) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(error)
        });
      }
      res.json(count);
    });
  }
}
