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
  actualSessionTime: {
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
  selectedpricingoptionindexandquantity: {
    type: Array,
    default: []
  },
  selectedpricingoptionindexandprice: {
    type: Array,
    default: []
  },
  selectedaddonoptionsindexandquantity: {
    type: Array,
    default: []
  },
  selectedaddonoptionsindexandprice: {
    type: Array,
    default: []
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  depositPaid: {
    type: Number,
    default: 0
  },
  totalAmountToBePaid: {
    type: Number,
    default: 0
  },
  totalAmountPaid: {
    type: Number,
    default: 0
  },
  totalAmountForProduct: {
    type: Number,
    default: 0
  },
  totalAmountForAddons: {
    type: Number,
    default: 0
  },
  instamojoCut: {
    type: Number,
    default: 0
  },
  tourgeckoCut: {
    type: Number,
    default: 0
  },
  hostCut: {
    type: Number,
    default: 0
  },
  totalAmountPaidToHost: {
    type: Number,
    default: 0
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
  /* instamojo close */
  /* razorpay attribute equivalent */
  isPaymentTransferred: {
    type: Boolean,
    default: false
  },
  /* razorpay close*/
  
  isPaymentDone: {
    type: Boolean,
    default: false
  },
  refundTopLimit: {
    type: Number
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
  bookedVia: {
    type: String,
    default: 'toursite'
  },
  created: {
    type: Date
  }
});

BookingSchema.index({bookingReference: 'text'});
mongoose.model('Booking', BookingSchema);

