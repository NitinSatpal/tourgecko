'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var InstaomojoPaymentSchema = new Schema({
	instamojo_id : {
	  	type: String
	},
	instamojo_title: {
		type: String
	},
	instamojo_status: {
		type: Boolean
	},
	instamojo_link: {
		type: String
	},
	instamojo_product: {
		type: String
	},
	instamojo_seller: {
		type: String
	},
	instamojo_currency: {
		type: String
	},
	instamojo_unit_price: {
		type: Number
	},
	instamojo_quantity: {
		type: Number
	},
	instamojo_amount: {
		type: Number
	},
	instamojo_name: {
		type: String
	},
	instamojo_email: {
		type: String
	},
	instamojo_phone: {
		type: String
	},
	instamojo_shipping_address: {
		type: String
	},
	instamojo_shipping_city: {
		type: String
	},
	instamojo_shipping_state: {
		type: String
	},
	instamojo_shipping_zip: {
		type: String
	},
	instamojo_variants: {
		type: String
	},
	instamojo_discount: {
		type: String
	},
	instamojo_custom_fields: {
	},
	instamojo_payout: {
		type: Boolean
	},
	instamojo_fees: {
		type: String
	},
	instamojo_service_tax_fees: {
		type: String
	},
	instamojo_cases: {
		type: Array
	},
	instamojo_affiliate: {
		type: String
	},
	instamojo_affiliate_cut: {
		type: Number
	},
	instamojo_instrument_type: {
		type: String
	},
	instamojo_failure: {
		type: String
	},
	instamojo_created_at: {
		type: String
	},
	instamojo_updated_at: {
		type: String
	},
	instamojo_resource_uri: {
		type: String
	},
	bookingId: {
		type: Schema.ObjectId,
		ref: 'Booking'
	}
});

mongoose.model('InstamojoPayment', InstaomojoPaymentSchema);

