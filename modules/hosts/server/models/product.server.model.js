'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Tour Schema
 */
var ProductSchema = new Schema({
  productTitle: {
    type: String,
    default: '',
    trim: true
  },
  productType: {
    type: String,
    default: '',
    trim: true
  },
  destination: {
    type: String,
    default: ''
  },
  productSummary: {
    type: String,
    default: '',
    trim: true
  },
  productAdvertisedprice: {
    type: Number,
    default: 0
  },
  productDurationType: {
    type: String,
    default: ''
  },
  productDuration: {
    type: Number,
    default: 0
  },
  productPricingOptions: {
    type: Schema.Types.Mixed,
    default: []
  },
  productAvailabilityType: {
    type: String,
    default: '',
    trim: true
  },
  productTimeSlotsAvailability: {
    type: String,
    default: ''
  },
  productTimeSlots: {
    type: Array,
    default: []
  },
  isProductScheduled: {
    type: Boolean,
    default: false
  },
  productSheduleDates: {
    type: Array,
    default: []
  },
  productSeatsLimitType: {
    type: String,
    default: ''
  },
  produSeatLimit: {
    type:Number
  },
  productBookingAvailabilityType: {
    type: String,
    default: '',
    trim: true
  },
  minBookingRequired: {
    type: Number,
    default: 0
  },
  maxBookingAllowed: {
    type: Number,
    default: 0
  },
  productconfirmMode: {
    type: String,
    default: '',
    trim: true
  },
  productItineraryDescription: {
    type: Array,
    default: []
  },
  isDepositNeeded: {
    type: Boolean,
    default: false
  },
  depositAmount: {
    type: Number,
    default: 0
  },
  productTheme: {
    type: Array,
    default: []
  },
  productActivities: {
    type: Array,
    default: []
  },
  productGrade: {
    type: String,
    default: '',
    trim: true
  },
  serviceLevel: {
    type: String,
    default: '',
    trim: true
  },
  productMinAgeRequired: {
    type: Number,
    default: 0
  },
  productMaxAgeRequired: {
    type: Number,
    default: 0
  },
  pickupLocation: {
    type: String,
    default: '',
    trim: true
  },
  dropLocation: {
    type: String,
    default: '',
    trim: true
  },
  productAddons: {
    type: Array,
    default: []
  },
  productDiscount: {
    type: Number,
    default: 0
  },
  isCancellationAllowed: {
    type: Boolean
  },
  productCancellationPolicy: {
    type: String,
    default: '',
    trim: true
  },
  productBestSeason: {
    type: Array,
    default: '',
    trim: true
  },
  productMonthsAvailableForBoking: {
    type: Array,
    default: []
  },
  productMinNoticeDays: {
    type: Number,
    default: 15
  },
  productGuidelines: {
    type: String,
    default: '',
    trim: true
  },
  productFacilitiesIncluded: {
    type: String,
    default: '',
    trim: true
  },
  productFacilitiesExcluded: {
    type: String,
    default: '',
    trim: true
  },
  prodcutGuideLanguages: {
    type: Array,
    default: []
  },
  productGeneralNote: {
    type: String,
    default: '',
    trim: true
  },
  productPictureURLs: {
    type: Array,
    default: []
  },
  productMapURLs: {
    type: Array,
    default: []
  },
  // this boolean also handles isVisible condition on tourlist page
  /*isDraft: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },*/
  isPublished: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  } /* ,
  expireAt: {
  	type: Date,
  	default: new Date('August 26, 2016 19:30:00')
  }
  createdAt: { type: Date, expires: 15, default: Date.now } */
});

// TourSchema.index( { "expireAt": 1 }, { expireAfterSeconds: 0 } );
mongoose.model('Product', ProductSchema);
