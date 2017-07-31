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
  productTags: {
    type: Array,
    default: []
  },
  productAdvertisedprice: {
    type: Number
  },
  productDurationType: {
    type: String,
    default: ''
  },
  productDuration: {
    type: Number
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
  productScheduledTimestamps: {
    type: Array,
    default: []
  },
  productScheduledDates: {
    type: Array,
    default: []
  },
  isRepeatingProduct:{
    type: Boolean,
    default: false
  },
  productRepeatStartDate: {
    type: String
  },
  productRepeatEndDate: {
    type: String
  },
  productRepeatType: {
    type: String
  },
  productRepeatDays: {
    type: String
  },
  productNonRepeatDays: {
    type: String
  },

/* In case of open date products, time-slot and schedule dates once guest book it */
  productTimeSlotsAvailability: {
    type: String
  },
  productTimeSlots: {
    type: Array,
    default: []
  },
  /* Open date tour ends here */

  productBookingAvailabilityType: {
    type: String,
    default: '',
    trim: true
  },
  minSeatsPerBookingRequired: {
    type: Number
  },
  maxSeatsPerBookingAllowed: {
    type: Number
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
  areAddonsAvailable: {
    type: Boolean,
    default: false
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
  isProductAvailabileAllTime: {
    type: Boolean,
    default: true
  },
  productUnavailableMonths: {
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
  productPictureNames: {
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
