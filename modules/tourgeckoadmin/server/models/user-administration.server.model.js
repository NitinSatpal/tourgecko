'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserAdministrationSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  hostRatingFromTourgecko: {
    type: Number,
    default: ''
  },
  hostReviewFromTourgecko: {
    type: String,
    default: '',
    trim: true
  }
});

mongoose.model('UserAdministration', UserAdministrationSchema);
