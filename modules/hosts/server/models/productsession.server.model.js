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
  isSpecialPricingAvailable: {
    type: Boolean,
  },
  sessionPricingDetails: {
    type: Array,
    default: []
  },
  hostCompany: {
  	type:Schema.ObjectId,
    ref: 'HostCompany'
  },
  product: {
    type: Schema.ObjectId,
    unique: true,
    ref: 'Product'
  }
});

// TourSchema.index( { "expireAt": 1 }, { expireAfterSeconds: 0 } );
mongoose.model('ProductSession', ProductSessionSchema);
