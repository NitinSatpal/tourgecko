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
  InstamojoUser = mongoose.model('InstamojoUsers'),
  InstamojoPaymentRequestRecord = mongoose.model('InstamojoPaymentRequest'),
  instamojoPaymentRecord = mongoose.model('InstamojoPayment'),
  moment = require('moment'),
  momentTimezone = require('moment-timezone'),
  tracelog = require(path.resolve('./modules/core/server/controllers/tracelog.server.controller')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/* Payment gateway account signup */
var Insta = require('instamojo-nodejs');
Insta.setKeys(config.paymentGateWayInstamojo.instamojoKey, config.paymentGateWayInstamojo.instamojoSecret);

// This line will be removed later. Setting sandbox mode for now
Insta.isSandboxMode(true);

exports.postPaymentEventsAndProcess = function (req, res) {
  Booking.findOne({paymentRequestId: req.body.paymentRequestId, isPaymentDone: false}).populate('product').populate('productSession').exec(function (err, booking) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    booking.paymentId = req.body.paymentId;
    booking.isPaymentDone = true;
    booking.save(function(err) {
      if (err) {

      } else {
        logCapturedPayment(booking._id, req.body.paymentRequestId, req.body.paymentId, booking.hostOfThisBooking);
        traceLogForThisEvent(booking._id, booking.bookedVia);
        sendNotification(booking, booking.product.productTitle, booking._id);
        if(!booking.isOpenDateTour)
          updateSession(booking);
        else
          createSession(booking, booking.product, req.body.paymentRequestId, req.body.paymentId);

        res.json('done');
      }
    });
  });
}

function logCapturedPayment (bookingId, paymentRequestId, paymentId, host) {
  InstamojoUser.findOne({user: host}).exec(function (err, instaUser) {
    var userDetails = Insta.UserBasedAuthenticationData();
    userDetails.client_id = config.paymentGateWayInstamojo.clientId;
    userDetails.client_secret = config.paymentGateWayInstamojo.clientSecret;
    userDetails.username = instaUser.instamojo_email;
    userDetails.password = instaUser.instamojo_password;
    Insta.getAuthenticationAccessToken(userDetails, function(userTokenError, userTokenResponse) {
      if (userTokenError) {

      } else {
        /* Use user based authentication token to edit the user. First set the token in the header and then call the edit api */
        Insta.setToken(config.paymentGateWayInstamojo.instamojoKey,
                      config.paymentGateWayInstamojo.instamojoSecret,
                      'Bearer' + ' ' + userTokenResponse.access_token);

        Insta.getPaymentRequest(paymentRequestId, function(paymentReqError, paymentReqResponse) {
          if (paymentReqError) {
            // some error
          } else {
            InstamojoPaymentRequestRecord.findOne({instamojo_id: paymentRequestId}).exec(function (err, instaPayment) {
              instaPayment.instamojo_payments = paymentReqResponse.payments;
              instaPayment.save();
            })
          }
        });

        Insta.getPayment(paymentId, function(paymentError, paymentResponse) {
          if (paymentError) {
            // some error
          } else {
            var instamojoPayment = new instamojoPaymentRecord();
            var commonPrefix = 'instamojo_';
            for (var key in paymentResponse) {
              if (paymentResponse.hasOwnProperty(key)) {
                var val = paymentResponse[key];
                instamojoPayment[commonPrefix + key] = val;
              }
            }
            instamojoPayment.bookingId = bookingId;
            instamojoPayment.save(); 
          }
        });
      }
    });
  });
}

function sendNotification (bookingObject, productTitle, bookingId) {
  var notification = new Notification();
  notification.notificationFrom = bookingObject.providedGuestDetails.firstName + ' ' + bookingObject.providedGuestDetails.lastName;
  notification.notificationTypeLogo = 'modules/chat/client/images/booking-request.png';
  notification.bookingId = bookingId;
  notification.notificationToId = bookingObject.hostOfThisBooking;
  notification.notificationType = "Booking Request";
  notification.notificationBody = "You have a booking request for '" + productTitle + "'.";
  notification.notificationStatus = "Action Pending by Host";
  notification.notificationRead = false;
  notification.notificationTimestamp = new Date();
  // var tz = momentTimezone.tz.guess();
  // For now hardcoding the time zone to Indian timezone. Need to find a good way to detect the timezone.
  // Above commented line always giving UTC or may be the server of Zure is in UTC timezone.
  notification.notificationTimestampToDisplay = momentTimezone.utc(new Date()).tz('Asia/Calcutta').format('ddd Do MMMM YYYY h:mma');
  notification.created = Date.now();

  notification.save(function (err) {
    if (err) {
      // notification sending failed
    } else {
      // notification successfully sent
    }
  });
}

function traceLogForThisEvent (bookingId, via) {
  var tracelogMessage = 'Booking created via ' + via  + '.';
  tracelog.createTraceLog('Booking', bookingId, tracelogMessage);
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
function createSession (booking, product, paymentRequestId, paymentId) {
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
      booking.productSession = productSession._id;
      booking.save();
      // session successfully saved
    }
  });
}


