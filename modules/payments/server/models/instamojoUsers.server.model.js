'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var InstamojoUsersSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  hostCompany: {
    type: Schema.ObjectId,
    ref: 'HostCompany'
  },
  instamojo_id: {
    type: String
  },
  instamojo_username: {
    type: String
  },
  instamojo_first_name: {
    type: String
  },
  instamojo_last_name: {
    type: String
  },
  instamojo_phone: {
    type: String
  },
  instamojo_email: {
    type: String
  },
  instamojo_date_joined: {
    type: String
  },
  instamojo_is_email_verified: {
    type: Boolean
  },
  instamojo_is_phone_verified: {
    type: Boolean
  },
  instamojo_bio: {
    type: String
  },
  instamojo_location: {
    type: String
  },
  instamojo_public_phone: {
    type: String
  },
  instamojo_public_email: {
    type: String
  },
  instamojo_public_website: {
    type: String
  },
  instamojo_avatar_image_url: {
    type: String
  },
  instamojo_profile_image_url: {
    type: String
  },
  instamojo_tags: {
    type: Array
  },
  instamojo_kyc: {},
  instamojo_resource_uri: {
    type: String
  },
  instamojo_promo_code: {
    type: String
  },
  instamojo_password: {
    type: String
  },
  instamojo_user: {
    type: String
  },
  instamojo_account_number: {
    type: String
  },
  instamojo_account_holder_name: {
    type: String
  },
  instamojo_bank_name: {
    type: String
  },
  instamojo_ifsc_code: {
    type: String
  },
  instamojo_updated_at: {
    type: String
  },
  created: {
    type: Date
  }
});

mongoose.model('InstamojoUsers', InstamojoUsersSchema);

