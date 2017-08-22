'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  config = require(path.resolve('./config/config')),
  momentTimezone = require('moment-timezone'),
  InstamojoUser = mongoose.model('InstamojoUsers'),
  InstamojoPaymentRequestRecord = mongoose.model('InstamojoPaymentRequest'),
  InstamojoPaymentRecord = mongoose.model('InstamojoPayment'),
  Booking = mongoose.model('Booking'),
  ProductSession = mongoose.model('ProductSession'),
  tracelog = require(path.resolve('./modules/core/server/controllers/tracelog.server.controller')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mailAndMessage = require(path.resolve('./modules/mailsAndMessages/server/controllers/mailsAndMessages.server.controller')),
  bookingRecordCreation = require(path.resolve('./modules/hosts/server/controllers/bookings/booking.server.controller'));


/* Payment gateway account signup */
var Insta = require('instamojo-nodejs');
//Insta.setKeys(config.paymentGateWayInstamojo.instamojoKey, config.paymentGateWayInstamojo.instamojoSecret);

// This line will be removed later. Setting sandbox mode for now
Insta.isSandboxMode(true);


// Capture the payment.
exports.createInstamojoPayment = function (req, res) {
  var requestBodyData = req.body.bookingData;
  var sessionId = mongoose.Types.ObjectId(req.body.sessionId);
  if (req.body.sessionId != null) {
    ProductSession.findOne({_id: sessionId}).exec(function (err, productSession) {
      if (err) {
        console.log('the error is ' + err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      if (productSession.sessionCapacityDetails.sessionSeatsLimitType == 'limited') {
        var key = requestBodyData.bookingDetails.actualSessionDate;
        var seatsRemaining
        if (productSession.numberOfSeatsSession && productSession.numberOfSeatsSession[key])
          seatsRemaining = parseInt(productSession.sessionCapacityDetails.sessionSeatLimit) - parseInt(productSession.numberOfSeatsSession[key])
        else
          seatsRemaining = parseInt(productSession.sessionCapacityDetails.sessionSeatLimit);


        if (seatsRemaining >= parseInt(booking.numberOfSeats)) {
          InstamojoUser.findOne({user: requestBodyData.bookingDetails.hostOfThisBooking}).populate('hostCompany').exec(function (err, instaUser) {
            var userDetails = Insta.UserBasedAuthenticationData();
            userDetails.client_id = config.paymentGateWayInstamojo.instamojoKey;
            userDetails.client_secret = config.paymentGateWayInstamojo.instamojoSecret;
            userDetails.username = instaUser.instamojo_email;
            userDetails.password = instaUser.instamojo_password;
            Insta.getAuthenticationAccessToken(userDetails, function(userTokenError, userTokenResponse) {
              if (userTokenError) {
                console.log(userTokenError);
              } else {
                Insta.setToken(config.paymentGateWayInstamojo.instamojoKey,
                            config.paymentGateWayInstamojo.instamojoSecret,
                            'Bearer' + ' ' + userTokenResponse.access_token);
                var purpose = requestBodyData.productData.productTitle.length > 25 ? requestBodyData.productData.productTitle.slice(0,25) + '...' : requestBodyData.productData.productTitle;
                var paymentData = new Insta.PaymentData();
                paymentData.amount = requestBodyData.bookingDetails.totalAmountPaid;
                paymentData.partner_fee_type = instaUser.hostCompany.tourgeckoFeeType;
                paymentData.partner_fee = instaUser.hostCompany.tourgeckoFee;
                paymentData.purpose = purpose;//,
                var redirectURL = 'http://' + req.get('host');
                redirectURL = redirectURL + '/tour/booking/done';
                paymentData.setRedirectUrl(redirectURL);
                paymentData.email = requestBodyData.bookingDetails.providedGuestDetails.email;
                paymentData.phone = requestBodyData.bookingDetails.providedGuestDetails.mobile;
                paymentData.buyer_name = requestBodyData.bookingDetails.providedGuestDetails.firstName + ' ' + requestBodyData.bookingDetails.providedGuestDetails.lastName;

                Insta.createPayment(paymentData, function(paymentError, paymentReqResponse) {
                  if (paymentError) {
                    res.json(paymentError);
                    // some error
                  } else {
                    var userId = null;
                    if (req.user)
                      userId = req.user._id;
                    bookingRecordCreation.createBooking(requestBodyData, userId, paymentReqResponse.longurl, paymentReqResponse.id, null, 'instamojo');
                    var instamojoPaymentRequest = new InstamojoPaymentRequestRecord();
                    var commonPrefix = 'instamojo_';
                    for (var key in paymentReqResponse) {
                      if (paymentReqResponse.hasOwnProperty(key)) {
                        var val = paymentReqResponse[key];
                        instamojoPaymentRequest[commonPrefix + key] = val;
                      }
                    }
                    instamojoPaymentRequest.save(); 
                    res.json(paymentReqResponse.longurl);
                  }
                });
              }
            });
          });
        } else
          res.json({error: true, message: 'It seems more seats are booked and ' + seatsRemaining + ' are remaining now.'})
      } else {
          InstamojoUser.findOne({user: requestBodyData.bookingDetails.hostOfThisBooking}).populate('hostCompany').exec(function (err, instaUser) {
          var userDetails = Insta.UserBasedAuthenticationData();
          userDetails.client_id = config.paymentGateWayInstamojo.instamojoKey;
          userDetails.client_secret = config.paymentGateWayInstamojo.instamojoSecret;
          userDetails.username = instaUser.instamojo_email;
          userDetails.password = instaUser.instamojo_password;
          Insta.getAuthenticationAccessToken(userDetails, function(userTokenError, userTokenResponse) {
            if (userTokenError) {
              console.log(userTokenError);
            } else {
              Insta.setToken(config.paymentGateWayInstamojo.instamojoKey,
                          config.paymentGateWayInstamojo.instamojoSecret,
                          'Bearer' + ' ' + userTokenResponse.access_token);
              var purpose = requestBodyData.productData.productTitle.length > 25 ? requestBodyData.productData.productTitle.slice(0,25) + '...' : requestBodyData.productData.productTitle;
              var paymentData = new Insta.PaymentData();
              paymentData.amount = requestBodyData.bookingDetails.totalAmountPaid;
              paymentData.partner_fee_type = instaUser.hostCompany.tourgeckoFeeType;
              paymentData.partner_fee = instaUser.hostCompany.tourgeckoFee;
              paymentData.purpose = purpose;//,
              var redirectURL = 'http://' + req.get('host');
              redirectURL = redirectURL + '/tour/booking/done';
              paymentData.setRedirectUrl(redirectURL);
              paymentData.email = requestBodyData.bookingDetails.providedGuestDetails.email;
              paymentData.phone = requestBodyData.bookingDetails.providedGuestDetails.mobile;
              paymentData.buyer_name = requestBodyData.bookingDetails.providedGuestDetails.firstName + ' ' + requestBodyData.bookingDetails.providedGuestDetails.lastName;

              Insta.createPayment(paymentData, function(paymentError, paymentReqResponse) {
                if (paymentError) {
                  res.json(paymentError);
                  // some error
                } else {
                  var userId = null;
                  if (req.user)
                    userId = req.user._id;
                  bookingRecordCreation.createBooking(requestBodyData, userId, paymentReqResponse.longurl, paymentReqResponse.id, null, 'instamojo');
                  var instamojoPaymentRequest = new InstamojoPaymentRequestRecord();
                  var commonPrefix = 'instamojo_';
                  for (var key in paymentReqResponse) {
                    if (paymentReqResponse.hasOwnProperty(key)) {
                      var val = paymentReqResponse[key];
                      instamojoPaymentRequest[commonPrefix + key] = val;
                    }
                  }
                  instamojoPaymentRequest.save(); 
                  res.json(paymentReqResponse.longurl);
                }
              });
            }
          });
        });
      }
    });
  } else {
    InstamojoUser.findOne({user: requestBodyData.bookingDetails.hostOfThisBooking}).populate('hostCompany').exec(function (err, instaUser) {
      var userDetails = Insta.UserBasedAuthenticationData();
      userDetails.client_id = config.paymentGateWayInstamojo.instamojoKey;
      userDetails.client_secret = config.paymentGateWayInstamojo.instamojoSecret;
      userDetails.username = instaUser.instamojo_email;
      userDetails.password = instaUser.instamojo_password;
      Insta.getAuthenticationAccessToken(userDetails, function(userTokenError, userTokenResponse) {
        if (userTokenError) {
          console.log(userTokenError);
        } else {
          Insta.setToken(config.paymentGateWayInstamojo.instamojoKey,
                      config.paymentGateWayInstamojo.instamojoSecret,
                      'Bearer' + ' ' + userTokenResponse.access_token);
          var purpose = requestBodyData.productData.productTitle.length > 25 ? requestBodyData.productData.productTitle.slice(0,25) + '...' : requestBodyData.productData.productTitle;
          var paymentData = new Insta.PaymentData();
          paymentData.amount = requestBodyData.bookingDetails.totalAmountPaid;
          paymentData.partner_fee_type = instaUser.hostCompany.tourgeckoFeeType;
          paymentData.partner_fee = instaUser.hostCompany.tourgeckoFee;
          paymentData.purpose = purpose;//,
          var redirectURL = 'http://' + req.get('host');
          redirectURL = redirectURL + '/tour/booking/done';
          paymentData.setRedirectUrl(redirectURL);
          paymentData.email = requestBodyData.bookingDetails.providedGuestDetails.email;
          paymentData.phone = requestBodyData.bookingDetails.providedGuestDetails.mobile;
          paymentData.buyer_name = requestBodyData.bookingDetails.providedGuestDetails.firstName + ' ' + requestBodyData.bookingDetails.providedGuestDetails.lastName;

          Insta.createPayment(paymentData, function(paymentError, paymentReqResponse) {
            if (paymentError) {
              res.json(paymentError);
              // some error
            } else {
              var userId = null;
              if (req.user)
                userId = req.user._id;
              bookingRecordCreation.createBooking(requestBodyData, userId, paymentReqResponse.longurl, paymentReqResponse.id, null, 'instamojo');
              var instamojoPaymentRequest = new InstamojoPaymentRequestRecord();
              var commonPrefix = 'instamojo_';
              for (var key in paymentReqResponse) {
                if (paymentReqResponse.hasOwnProperty(key)) {
                  var val = paymentReqResponse[key];
                  instamojoPaymentRequest[commonPrefix + key] = val;
                }
              }
              instamojoPaymentRequest.save(); 
              res.json(paymentReqResponse.longurl);
            }
          });
        }
      });
    });
  }

}

function createPaymentRequest (requestBodyData) {
    
}

exports.refundInstamojoPayment = function (req, res) {
  InstamojoUser.findOne({user: req.body.host}).exec(function (err, instaUser) {
    var userDetails = Insta.UserBasedAuthenticationData();
    userDetails.client_id = config.paymentGateWayInstamojo.instamojoKey;
    userDetails.client_secret = config.paymentGateWayInstamojo.instamojoSecret;
    userDetails.username = instaUser.instamojo_email;
    userDetails.password = instaUser.instamojo_password;
    Insta.getAuthenticationAccessToken(userDetails, function(userTokenError, userTokenResponse) {
      if (userTokenError) {
        res.json('error');
      } else {
        Insta.setToken(config.paymentGateWayInstamojo.instamojoKey,
          config.paymentGateWayInstamojo.instamojoSecret,
          'Bearer' + ' ' + userTokenResponse.access_token);
        var refundAmount = parseInt(req.body.refundAmount);
        var refundData = {
          'type': 'TNR',
          'body': 'Need to refund to the buyer.',
          'refund_amount': refundAmount
        }        
        Insta.refundAPayment(refundData, req.body.paymentId, function(refundPaymentError, refundPaymentResponse) {
          if (refundPaymentError) {
            res.json('Something went wrong. Please contact tourgecko support');
          } else {
            InstamojoPaymentRequestRecord.findOne({instamojo_id: req.body.paymentRequestId}).exec(function (paymentRequestFinderr, paymentRequestRecord) {
              if (paymentRequestFinderr)
                res.json('Something went wrong. Please contact tourgecko support');
              paymentRequestRecord.isRefundApplied = true;
              paymentRequestRecord.refundAmount = refundAmount;
              paymentRequestRecord.save(function (paymentRequestEditError, paymentRequestEditResponse) {
                if (paymentRequestEditError)
                  res.json('Something went wrong. Please contact tourgecko support');

                InstamojoPaymentRecord.findOne({instamojo_id: req.body.paymentId}).exec(function (paymentFinderr, paymentRecord) {
                  if (paymentFinderr)
                    res.json('Something went wrong. Please contact tourgecko support');
                  paymentRecord.instamojo_refund = refundPaymentResponse.refund;
                  paymentRecord.save(function (paymentEditError, paymentEditResponse) {
                    if (paymentEditError)
                      res.json('Something went wrong. Please contact tourgecko support');
                    Booking.findOne({paymentId: req.body.paymentId}).populate('product').populate('productSession').populate('hostCompany').populate('hostOfThisBooking').exec(function (error, booking) {
                      if (error)
                        res.json('error')
                      booking.isRefundApplied = true;
                      booking.refundAmount = refundAmount;
                      booking.bookingStatus = 'Cancelled';
                      booking.save(function(bookingEditError, bookingEditSuccess) {
                        if (bookingEditError) {
                          res.json('error');
                        }
                        var tracelogMessage = req.user.displayName + ' Cancelled this booking.';
                        tracelog.createTraceLog('Booking', booking._id, tracelogMessage);
                        mailAndMessage.sendBookingEmailsToGuestAndHost(booking, req, res, req.body.bookingStatus);
                        updateSessionNegativeForCancelledStatus(booking, req, res);
                        res.json('success')
                      });
                    });
                  });
                });
              });
            });
          }
        });
      }
    });
  });
}

function updateSessionNegativeForCancelledStatus (booking, req, res) {
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

      if (session.numberOfConfirmedBookings) {
        if(session.numberOfConfirmedBookings[key]) {
          var value = parseInt(session.numberOfConfirmedBookings[key]) - 1;
          session.numberOfConfirmedBookings[key] = value;
        }
      }
      
      if (session.numberOfSeats) {
        if (session.numberOfSeats[key]) {
          var value = parseInt(session.numberOfSeats[key]) - parseInt(booking.numberOfSeats);
          session.numberOfSeats[key] = value;
        }
      }

      if (session.numberOfConfirmedSeats) {
        if (session.numberOfConfirmedSeats[key]) {
          var value = parseInt(session.numberOfConfirmedSeats[key]) - parseInt(booking.numberOfSeats);
          session.numberOfConfirmedSeats[key] = value;
        }
      }

      session.markModified('numberOfBookings');
      session.markModified('numberOfConfirmedBookings');
      session.markModified('numberOfSeats');
      session.markModified('numberOfConfirmedSeats');

      var sessionKey = booking.actualSessionDate;
      if (session.numberOfBookingsSession) {
        if(session.numberOfBookingsSession[sessionKey]) {
          var value = parseInt(session.numberOfBookingsSession[sessionKey]) - 1;
          session.numberOfBookingsSession[sessionKey] = value;
        }
      }

      if (session.numberOfConfirmedBookingsSession) {
        if(session.numberOfConfirmedBookingsSession[sessionKey]) {
          var value = parseInt(session.numberOfConfirmedBookingsSession[key]) - 1;
          session.numberOfConfirmedBookingsSession[sessionKey] = value;
        }
      }
      
      if (session.numberOfSeatsSession) {
        if (session.numberOfSeatsSession[sessionKey]) {
          var value = parseInt(session.numberOfSeatsSession[sessionKey]) - parseInt(booking.numberOfSeats);
          session.numberOfSeatsSession[sessionKey] = value;
        }
      }

      if (session.numberOfConfirmedSeatsSession) {
        if (session.numberOfConfirmedSeatsSession[sessionKey]) {
          var value = parseInt(session.numberOfConfirmedSeatsSession[sessionKey]) - parseInt(booking.numberOfSeats);
          session.numberOfConfirmedSeatsSession[sessionKey] = value;
        }
      }


      session.markModified('numberOfBookingsSession');
      session.markModified('numberOfConfirmedBookingsSession');
      session.markModified('numberOfSeatsSession');
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

exports.fetchPaymentsForThisBooking = function (req, res) {
  // For now it will always return one payment. Even if fulfilled or cancelled, everything is being modified in the
  // same payment record and hence one booking will have one such payment record.
  InstamojoPaymentRecord.find({bookingId: req.params.bookingId}).populate('hostCompany').exec(function (err, instaPayments) {
    if (err) {
      res.json('Something went wrong. Please contact tourgecko support');
    }
    res.json(instaPayments);
  });
}