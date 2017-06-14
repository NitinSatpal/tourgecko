'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  RazorpayPaymentRecord = mongoose.model('razorpayPayment'),
  config = require(path.resolve('./config/config')),
  momentTimezone = require('moment-timezone'),
  Razorpay = require('razorpay'),
  Booking = mongoose.model('Booking'),
  bookingRecordCreation = require(path.resolve('./modules/hosts/server/controllers/bookings/booking.server.controller')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var instance = new Razorpay({
  key_id: config.paymentGateWayRazorpay.razorpaykey_id,
  key_secret: config.paymentGateWayRazorpay.razorpaykey_secret
});

// Capture the payment.
exports.captureRazorpayPayment = function (req, res) {
  var requestBodyData = req.body.bookingObject;
  var userId = null;
    if (req.user)
      userId = req.user._id;
	instance.payments.fetch(req.body.paymentId).then((paymentResponse) => {
	  // handle success
	  return instance.payments.capture(paymentResponse.id, paymentResponse.amount).then((capturedPaymentResponse) => {
		  // handle success
      bookingRecordCreation.createBooking(requestBodyData, userId, null, null, capturedPaymentResponse.id, 'razorpay');
		  var razorpayPayment = new RazorpayPaymentRecord();
		  var commonPrefix = 'razorpay_';
      for (var key in capturedPaymentResponse) {
        if (capturedPaymentResponse.hasOwnProperty(key)) {
          var val = capturedPaymentResponse[key];
          razorpayPayment[commonPrefix + key] = val;
        }
      }
      razorpayPayment.save();
		  res.json(capturedPaymentResponse);
		}).catch((capturedPaymentError) => {
		  // handle error
      res.json('Something went wrong while saving the payment record. Please contact tourgecko support');
		  console.log(capturedPaymentError);
		});
	}).catch((paymentError) => {
	  // handle error
    res.json('Something went wrong while capturing the payment. Please contact tourgecko support');
	  console.log(paymentError);
	});
}

exports.refundRazorpayPayment = function (req, res) {
  var refundAmount = parseInt(req.body.refundAmount * 100);
  instance.payments.refund(req.body.paymentId, {
    amount: refundAmount,
    notes: {
      note1: 'This is a test refund',
      note2: 'This is a test note'
    }
  }).then((refundPaymentResponse) => {
    return instance.payments.fetch(req.body.paymentId).then((fetchedPaymentResponse) => {
      RazorpayPaymentRecord.findOne({razorpay_id: fetchedPaymentResponse.id}).exec(function(err, razorpayPaymentRecord) {
        if (err) {
          res.json('Something went wrong while saving the refunded payment. Please contact tourgecko support');
        }
        razorpayPaymentRecord.razorpay_refund_status = fetchedPaymentResponse.refund_status;
        razorpayPaymentRecord.razorpay_amount_refunded = fetchedPaymentResponse.amount_refunded;
        razorpayPaymentRecord.refundId = refundPaymentResponse.id;
        razorpayPaymentRecord.save(function(localPayemntSaveErr) {
          if (localPayemntSaveErr)
            res.json('Something went wrong while saving the refunded payment. Please contact tourgecko support');
          Booking.findOne({paymentId: req.body.paymentId}).exec(function (error, booking) {
            if (error)
              res.json('error')
            booking.isRefundApplied = true;
            booking.refundAmount = refundPaymentResponse.amount / 100;
            booking.bookingStatus = 'Cancelled';
            booking.save(function(bookingEditError, bookingEditSuccess) {
              if (bookingEditError) {
                res.json('Something went wrong while saving the booking record. Please contact tourgecko support');
              }
              res.json('success');
            });
          });
        });
      });
    }).catch((fetchedPaymentError) => {
      // handle error
      res.json('Something went wrong while saving the refunded payment. Please contact tourgecko support');
    });
    res.json(refundPaymentResponse);
  }).catch((refundPaymentError) => {
    // handle error
    res.json('Something went wrong while refunding the payment. Please contact tourgecko support');
  });
}
