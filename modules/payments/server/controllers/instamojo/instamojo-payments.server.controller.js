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
  tracelog = require(path.resolve('./modules/core/server/controllers/tracelog.server.controller')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  bookingRecordCreation = require(path.resolve('./modules/hosts/server/controllers/bookings/booking.server.controller'));


/* Payment gateway account signup */
var Insta = require('instamojo-nodejs');
//Insta.setKeys(config.paymentGateWayInstamojo.instamojoKey, config.paymentGateWayInstamojo.instamojoSecret);

// This line will be removed later. Setting sandbox mode for now
Insta.isSandboxMode(true);


// Capture the payment.
exports.createInstamojoPayment = function (req, res) {
  var requestBodyData = req.body;
	InstamojoUser.findOne({user: req.body.bookingDetails.hostOfThisBooking}).exec(function (err, instaUser) {
  	var userDetails = Insta.UserBasedAuthenticationData();
  	userDetails.client_id = config.paymentGateWayInstamojo.clientId;
  	userDetails.client_secret = config.paymentGateWayInstamojo.clientSecret;
  	userDetails.username = instaUser.instamojo_email;
  	userDetails.password = instaUser.instamojo_password;
  	Insta.getAuthenticationAccessToken(userDetails, function(userTokenError, userTokenResponse) {
    	if (userTokenError) {
        console.log(userTokenError);
    	} else {
        console.log(userTokenResponse);
    		Insta.setToken(config.paymentGateWayInstamojo.instamojoKey,
                  	config.paymentGateWayInstamojo.instamojoSecret,
                  	'Bearer' + ' ' + userTokenResponse.access_token);
        var purpose = req.body.productData.productTitle.length > 25 ? req.body.productData.productTitle.slice(0,25) + '...' : req.body.productData.productTitle;
      	var paymentData = new Insta.PaymentData();
      	paymentData.amount = req.body.bookingDetails.totalAmountPaid;
      	paymentData.partner_fee = 10;
      	paymentData.purpose = purpose;//,
        var redirectURL = 'http://' + req.get('host');
        redirectURL = redirectURL + '/guest/tour/booking/done';
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

exports.refundInstamojoPayment = function (req, res) {
  InstamojoUser.findOne({user: req.body.host}).exec(function (err, instaUser) {
    var userDetails = Insta.UserBasedAuthenticationData();
    userDetails.client_id = config.paymentGateWayInstamojo.clientId;
    userDetails.client_secret = config.paymentGateWayInstamojo.clientSecret;
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
            res.json('Something went wrong. Please try again or contact tourgecko support');
          } else {
            InstamojoPaymentRequestRecord.findOne({instamojo_id: req.body.paymentRequestId}).exec(function (err, paymentRecord) {
              paymentRecord.isRefundApplied = true;
              paymentRecord.refundAmount = refundAmount;
              paymentRecord.save(function (paymentEditError, success) {
                if (paymentEditError)
                  res.json('error');               
                Booking.findOne({paymentId: req.body.paymentId}).exec(function (error, booking) {
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
                    res.json('success')
                  });
                });
              })
            });
          }
        });
      }
    });
  });
}

exports.fetchPaymentsForThisBooking = function (req, res) {
  InstamojoPaymentRecord.find({bookingId: req.params.bookingId}).exec(function (err, instaPayments) {
    if (err) {
      res.json('Something went wrong. Please contact tourgecko support');
    }
    res.json(instaPayments);
  });
}