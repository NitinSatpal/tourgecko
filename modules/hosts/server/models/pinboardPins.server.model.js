'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var PinboardPinsSchema = new Schema({
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
  uniquePinName: {
    type: String
  },
  isInitialPin: {
    type: Boolean,
    default: false
  },
  isPinCompleted: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date
  }
});

mongoose.model('PinboardPins', PinboardPinsSchema);
