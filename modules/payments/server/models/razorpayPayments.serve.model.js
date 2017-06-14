'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var razorpayPaymentSchema = new Schema({
  razorpay_created_at: {
  	type: String
  },
  razorpay_error_description: {
  	type: String
  },
  razorpay_error_code: {
  	type: String
  },
  razorpay_service_tax: {
  	type: String
  },
  razorpay_fee: {
  	type: String
  },
  razorpay_notes: {

  },
  razorpay_contact: {
  	type: String
  },
  razorpay_email: {
  	type: String
  },
  razorpay_vpa: {
  	type: String
  },
  razorpay_wallet: {
  	type: String
  },
  razorpay_bank: {
  	type: String
  },
  razorpay_card_id: {
  	type: String
  },
  razorpay_description: {
  	type: String
  },
  razorpay_captured: {
  	type: Boolean
  },
  refundId: {
    type: String
  },
  razorpay_refund_status: {
  	type: String
  },
  razorpay_amount_refunded: {
  	type: String
  },
  razorpay_method: {
  	type: String
  },
  razorpay_international: {
  	type: Boolean
  },
  razorpay_invoice_id: {
  	type: String
  },
  razorpay_order_id: {
  	type: String
  },
  razorpay_status: {
  	type: String
  },
  razorpay_currency: {
  	type: String
  },
  razorpay_amount: {
  	type: String
  },
  razorpay_entity: {
  	type: String
  },
  razorpay_id: {
  	type: String
  },
  markTransferred: {
    type: Boolean,
    default: false
  }
});

mongoose.model('razorpayPayment', razorpayPaymentSchema);
