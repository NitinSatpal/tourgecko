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
  numberOfBookings: {
    type: Schema.Types.Mixed,
    default: {}
  },
  numberOfConfirmedBookings: {
    type: Schema.Types.Mixed,
    default: {}
  },
  numberOfSeats: {
    type: Schema.Types.Mixed,
    default: {}
  },
  numberOfConfirmedSeats: {
    type: Schema.Types.Mixed,
    default: {}
  },
  amountReceived: {
    type: Schema.Types.Mixed,
    default: {}
  },
  monthsThisSessionCovering: {
    type: Array,
    default: []
  },
  paymentRequestId: {
    type: String
  },
  paymentId: {
    type: String
  },
  paymentURL: {
    type: String
  },
  hostCompany: {
  	type:Schema.ObjectId,
    ref: 'HostCompany'
  },
  product: {
    type: Schema.ObjectId,
    ref: 'Product'
  },
  utcDate: {
    type: String
  }
});

mongoose.model('ProductSession', ProductSessionSchema);
