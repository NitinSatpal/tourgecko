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
    type: [String],
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
  isInitialPin: {
    type: Boolean,
    default: false
  },
  initialPinUniqueCode: {
    type: String,
  },
  islinkRequired: {
    type: Boolean,
    default: false
  },
  linkURL: {
    type: String
  },
  isclickeventRequired: {
    type: Boolean,
    default: false
  },
  clickableElementId: {
    type: String
  },
  linkButtonLabel: {
    type: String
  },
  todoCompletedBy: {
    type : [String],
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
