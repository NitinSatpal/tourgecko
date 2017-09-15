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
  mailAndMessage = require(path.resolve('./modules/mailsAndMessages/server/controllers/mailsAndMessages.server.controller')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/* Payment gateway account signup */
var Insta = require('instamojo-nodejs');
Insta.setKeys(config.paymentGateWayInstamojo.instamojoKey, config.paymentGateWayInstamojo.instamojoSecret);

// This line will be removed later. Setting sandbox mode for now
// Insta.isSandboxMode(true);

exports.postPaymentEventsAndProcess = function (req, res) {
  Booking.findOne({paymentRequestId: req.body.paymentRequestId, isPaymentDone: false}).populate('product').populate('productSession').populate('hostCompany').populate('hostOfThisBooking').exec(function (err, booking) {
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
        logCapturedPayment(booking._id, req.body.paymentRequestId, req.body.paymentId, booking.hostOfThisBooking, booking.hostCompany);
        traceLogForThisEvent(booking._id, booking.bookedVia);
        sendNotification(booking, booking.product.productTitle, booking._id);
        var smsBody = getBookingDoneSms(booking);
        mailAndMessage.sendBookingDoneSms(smsBody, booking.providedGuestDetails.mobile);
        mailAndMessage.sendBookingEmailsToGuestAndHost(booking, req, res, 'bookingDone');
        if(!booking.isOpenDateTour)
          updateSession(booking);
        else
          createSession(booking, booking.product, req.body.paymentRequestId, req.body.paymentId);

        res.json('done');
      }
    });
  });
}

function logCapturedPayment (bookingId, paymentRequestId, paymentId, host, hostCompany) {
  InstamojoUser.findOne({user: host}).exec(function (err, instaUser) {
    var userDetails = Insta.UserBasedAuthenticationData();
    userDetails.client_id = config.paymentGateWayInstamojo.instamojoKey;
    userDetails.client_secret = config.paymentGateWayInstamojo.instamojoSecret;
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
            instamojoPayment.hostCompany = hostCompany._id;
            instamojoPayment.save(function (paymentSaveErr) {
              if (paymentSaveErr) {

              }
              Booking.findOne({_id: bookingId}).exec(function (err, booking) {
                var instamojoCut = parseFloat(instamojoPayment.instamojo_fees) + parseFloat(instamojoPayment.instamojo_total_taxes);
                var tourgeckoCut;
                if (hostCompany.tourgeckoFeeType == 'fixed')
                  tourgeckoCut = parseFloat(hostCompany.tourgeckoFee);
                else
                  tourgeckoCut = parseFloat(hostCompany.tourgeckoFee) * parseFloat(instamojoPayment.instamojo_amount) / 100;
                booking.instamojoCut = instamojoCut;
                booking.tourgeckoCut = tourgeckoCut;
                booking.hostCut = parseFloat(instamojoPayment.instamojo_amount) - (instamojoCut + tourgeckoCut);
                booking.refundTopLimit = parseFloat(instamojoPayment.instamojo_amount) - (instamojoCut + tourgeckoCut);
                booking.save();
              });
            }); 
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
  // Above commented line always giving UTC or may be the server of Azure is in UTC timezone.
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
      var key = booking.actualSessionDate + booking.actualSessionTime;
      if (!session.numberOfBookings) {
        session.numberOfBookings = {
          [key] : 1
        }
      } else {
        if(session.numberOfBookings[key]) {
          var value = parseInt(session.numberOfBookings[key]) + 1;
          session.numberOfBookings[key] = value;
        } else {
          session.numberOfBookings[key] = 1;
        }
      }
      
      if (!session.numberOfSeats) {
        var value = parseInt(booking.numberOfSeats);
        session.numberOfSeats = {
          [key] : value
        }
      } else {
        if (session.numberOfSeats[key]) {
          var value = parseInt(session.numberOfSeats[key]) + parseInt(booking.numberOfSeats);
          session.numberOfSeats[key] = value;
        } else {
          session.numberOfSeats[key] = parseInt(booking.numberOfSeats);
        }
      }

      session.markModified('numberOfBookings');
      session.markModified('numberOfSeats');

      var sessionKey = booking.actualSessionDate;
      if (!session.numberOfBookingsSession) {
        session.numberOfBookingsSession = {
          [sessionKey] : 1
        }
      } else {
        if(session.numberOfBookingsSession[sessionKey]) {
          var value = parseInt(session.numberOfBookingsSession[sessionKey]) + 1;
          session.numberOfBookingsSession[sessionKey] = value;
        } else {
          session.numberOfBookingsSession[sessionKey] = 1;
        }
      }
      
      if (!session.numberOfSeatsSession) {
        var value = parseInt(booking.numberOfSeats);
        session.numberOfSeatsSession = {
          [sessionKey] : value
        }
      } else {
        if (session.numberOfSeatsSession[sessionKey]) {
          var value = parseInt(session.numberOfSeatsSession[sessionKey]) + parseInt(booking.numberOfSeats);
          session.numberOfSeatsSession[sessionKey] = value;
        } else {
          session.numberOfSeatsSession[sessionKey] = parseInt(booking.numberOfSeats);
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

// create session for open dated tour booking
function createSession (booking, product, paymentRequestId, paymentId) {
  var productSession = new ProductSession();
  var departureDetails = {
    // Just add this to display at different screens of host side
    startTime: booking.actualSessionTime == 'Select Time' ? '' : booking.actualSessionTime,
    startDate: booking.openDatedTourDepartureDate,
    repeatBehavior : "Do not repeat"
  };
  productSession.sessionDepartureDetails = departureDetails;
  productSession.isSessionPricingValid = true;
  productSession.sessionPricingDetails = product.productPricingOptions;
  var keySeatsBooking = booking.actualSessionDate + booking.actualSessionTime;
  productSession.numberOfBookings[keySeatsBooking] = 1;
  productSession.numberOfSeats[keySeatsBooking] = parseInt(booking.numberOfSeats);
  productSession.markModified('numberOfBookings');
  productSession.markModified('numberOfSeats');
  var keySession = booking.actualSessionDate;
  productSession.numberOfBookingsSession[keySession] = 1
  productSession.numberOfSeatsSession[keySession] = parseInt(booking.numberOfSeats);
  productSession.markModified('numberOfBookingsSession');
  productSession.markModified('numberOfSeatsSession');
  var eventDate = new Date(booking.openDatedTourDepartureDate);
  var uniqueString = eventDate.getMonth().toString() + eventDate.getUTCFullYear().toString();
  productSession.monthsThisSessionCovering = uniqueString;
  productSession.hostCompany = product.hostCompany;
  productSession.product = product._id;
  productSession.sessionInternalName = undefined;
  productSession.sessionDepartureDate = new Date(booking.openDatedTourDepartureDate).toISOString();
  productSession.save(function (err, res) {
    if (err) {
      // session saving failed
    } else {
      Booking.findOne({_id: booking._id}).exec(function (err, bookingInstance) {
        bookingInstance.productSession = res._id;
        bookingInstance.save();
      });
      
      // session successfully saved
    }
  });
}

function getBookingDoneSms (booking) {
  var customerName = booking.providedGuestDetails.firstName;
  var tourName = booking.product.productTitle;
  var bookingId = booking.bookingReference;
  var hostCompanyName = booking.hostCompany.companyName;

  var smsBody = 'Thank you ' + customerName + ' for booking ' + tourName + ' with us! Your booking id is ' + bookingId + 
  ' and is awaiting confirmation from us. You will hear from us soon.' + '%n-Team ' + hostCompanyName;

  return smsBody;
}