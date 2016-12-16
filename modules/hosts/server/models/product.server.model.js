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
    type: Number
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
    type: Array,
    default: []
  },
  /* Fixed or Open Date */
  productAvailabilityType: {
    type: String,
    default: '',
    trim: true
  },

 /* In case of fixed tours, if host create the departure session, this value will become true. In open dates when guest book, this will becom true*/
  isProductScheduled: {
    type: Boolean,
    default: false
  },

/* In case of open date products, time-slot and schedule dates once guest book it */
  productTimeSlotsAvailability: {
    type: String,
    default: ''
  },
  productTimeSlots: {
    type: Array,
    default: []
  },
  /* Open date tour ends here */

  /* For fixed date tours */
  productSeatsLimitType: {
    type: String,
    default: ''
  },
  productSeatLimit: {
    type:Number
  },
  isAvailabilityVisibleToGuests: {
    type: Boolean,
    default: false
  },
  /* Fixed date tour ends here */

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
    type: Number
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
    type: Number
  },
  productMaxAgeRequired: {
    type: Number
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
  productInclusions: {
    type: String,
    default: '',
    trim: true
  },
  productExclusions: {
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
    type: Date
  },
  lastUpdated: {
    type: Date,
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  hostCompany: {
    type:Schema.ObjectId,
    ref: 'HostCompany'
  } /* ,
  expireAt: {
  	type: Date,
  	default: new Date('August 26, 2016 19:30:00')
  }
  createdAt: { type: Date, expires: 15, default: Date.now } */
});

// TourSchema.index( { "expireAt": 1 }, { expireAfterSeconds: 0 } );
mongoose.model('Product', ProductSchema);
