'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Tour Schema
 */
var ProductSessionSchema = new Schema({
  sessionDepartureDetails: {},
  isSessionPricingValid: {
    type: Boolean,
    default: true
  },
  sessionPricingDetails: {
    type: Array,
    default: []
  },
  numberOfBookings: {},
  numberOfConfirmedBookings: {},
  numberOfSeats: {},

  // This will be removed. For now just putting this so that no undefined shud come here and there.
  // Undefined is coming as i was suing this value as number of seats, going forward above ovject will be having ky - value pair
  // with key as start date of the session and value as number of bookings for that session
  // Once that code is done, I have to change calendar.js with those values
  numberOfBookings: {
    type: Number,
    default: 0
  },
  /*numberOfConfirmedBookings: {
    type: Number,
    default: 0
  },
  numberOfSeats: {
    type: Number,
    default: 0
  },*/
  amountReceived: {},
  monthsThisSessionCovering: {
    type: Array,
    default: []
  },
  hostCompany: {
  	type:Schema.ObjectId,
    ref: 'HostCompany'
  },
  product: {
    type: Schema.ObjectId,
    ref: 'Product'
  }
});

// TourSchema.index( { "expireAt": 1 }, { expireAfterSeconds: 0 } );
mongoose.model('ProductSession', ProductSessionSchema);
