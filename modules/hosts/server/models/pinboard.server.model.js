'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var PinboardSchema = new Schema({
  to: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  type : {
    type: String
  },
  message: {
    type: String
  },
  timeRequired: {
    type: String
  },
  linkRequired: {
    type: Boolean,
    default: false
  },
  linkURL: {
    type: String
  },
  linkButtonLabel: {
    type: String
  },
  dismissedBy: [{
    type : Schema.ObjectId,
    ref: 'User' 
  }],
  created: {
    type: Date
  }
});

mongoose.model('Pinboard', PinboardSchema);
