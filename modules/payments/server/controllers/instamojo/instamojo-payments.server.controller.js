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
  InstamojoPaymentRecord = mongoose.model('InstamojoPayments'),
  Booking = mongoose.model('Booking'),
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
    	} else {
    		Insta.setToken(config.paymentGateWayInstamojo.instamojoKey,
                  	config.paymentGateWayInstamojo.instamojoSecret,
                  	'Bearer' + ' ' + userTokenResponse.access_token);
      	var paymentData = new Insta.PaymentData();
      	paymentData.amount = req.body.bookingDetails.totalAmountPaid;
      	paymentData.partner_fee = 10;
      	paymentData.purpose = 'Booking Amount';//req.body.productData.productTitle,
        console.log(req.get('host'));
		    paymentData.setRedirectUrl(req.get('host')+'/guest/tour/booking/done');

		    Insta.createPayment(paymentData, function(paymentError, paymentReqResponse) {
			    if (paymentError) {
            res.json(paymentError);
			      // some error
			    } else {
            var userId = null;
            if (req.user)
              userId = req.user._id;
            bookingRecordCreation.createBooking(requestBodyData, userId, paymentReqResponse.longurl, paymentReqResponse.id);
            var instamojoPayment = new InstamojoPaymentRecord();
            var commonPrefix = 'instamojo_';
              for (var key in paymentReqResponse) {
                if (paymentReqResponse.hasOwnProperty(key)) {
                  var val = paymentReqResponse[key];
                  instamojoPayment[commonPrefix + key] = val;
                }
              }
            instamojoPayment.save();  
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
            InstamojoPaymentRecord.findOne({instamojo_id: req.body.paymentRequestId}).exec(function (err, paymentRecord) {
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