'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var BookingSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  hostOfThisBooking : {
    type: Schema.ObjectId,
    ref: 'User'
  },
  hostCompany: {
    type: Schema.ObjectId,
    ref: 'HostCompany'
  },
  product: {
    type: Schema.ObjectId,
    ref: 'Product'
  },
  productSession: {
    type: Schema.ObjectId,
    ref: 'ProductSession'
  },
  actualSessionDate: {
    type: String,
    default: ''
  },
  isOpenDateTour: {
    type: Boolean
  },
  openDatedTourDepartureDate: {
    type: String,
    default: ''
  },
  bookingReference: {
    type: String
  },
  bookingStatus: {
    type: String,
    default: 'Pending'
  },
  bookingComments: {
    type: String
  },
  providedGuestDetails: {},
  numberOfSeats: {
    type: Number,
    default: 0
  },
  numberOfAddons: {
    type: Number,
    default: 0
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  depositPaid: {
    type: Number,
    default: 0
  },
  totalAmountPaid: {
    type: Number,
    default: 0
  },
  totalAmountPaidForProduct: {
    type: Number,
    default: 0
  },
  totalAmountPaidForAddons: {
    type: Number,
    default: 0
  },
  paymentMode: {
    type: String,
    default: 'tourgecko Wallet',
    trim: true
  },
  paymentURL: {
    type: String
  },
  paymentRequestId: {
    type: String
  },
  paymentId: {
    type: String
  },
  /* instamojo attribute equivalent */
  isPaymentFulfilled: {
    type: Boolean,
    default: false
  },
  /* razorpay attribute equivalent */
  isPaymentTransferred: {
    type: Boolean,
    default: false
  },
  isPaymentDone: {
    type: Boolean,
    default: false
  },
  isRefundApplied: {
    type: Boolean,
    default: false
  },
  refundAmount: {
    type: String
  },
  bookingDate: {
    type: String,
    default: ''
  },
  created: {
    type: Date
  }
});

BookingSchema.index({bookingReference: 'text'});
mongoose.model('Booking', BookingSchema);

