'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var InstaomojoPaymentRequestSchema = new Schema({
	instamojo_id : {
	  	type: String
	},
	instamojo_user: {
		type: String
	},
	instamojo_phone: {
		type: String
	},
	instamojo_email: {
		type: String
	},
	instamojo_buyer_name: {
		type: String
	},
	instamojo_amount: {
		type: String
	},
	instamojo_purpose: {
		type: String
	},
	instamojo_status: {
		type: String
	},
	instamojo_payments: {
		type: Array
	},
	instamojo_send_sms: {
		type: Boolean
	},
	instamojo_send_email: {
		type: Boolean
	},
	instamojo_sms_status: {
		type: String
	},
	instamojo_email_status: {
		type: String
	},
	instamojo_shorturl: {
		type: String
	},
	instamojo_longurl: {
		type: String
	},
	instamojo_redirect_url: {
		type: String
	},
	instamojo_webhook: {
		type: String
	},
	instamojo_created_at: {
		type: String
	},
	instamojo_modified_at: {
		type: String
	},
	instamojo_resource_uri: {
		type: String
	},
	instamojo_allow_repeated_payments: {
		type: Boolean
	},
	instamojo_mark_fulfilled: {
		type: Boolean
	},
	isRefundApplied: {
		type: Boolean,
		default: false
	},
	bookingId: {
		type: Schema.ObjectId,
		ref: 'Booking'
	},
	refundAmount: {
		type: String,
	}
});

mongoose.model('InstamojoPaymentRequest', InstaomojoPaymentRequestSchema);

