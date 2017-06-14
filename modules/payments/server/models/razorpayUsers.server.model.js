'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var RazorpayUsersSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  razorpay_Account_Id: {
    type: String
  }
});

mongoose.model('RazorpayUsers', RazorpayUsersSchema);

