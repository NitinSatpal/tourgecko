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
  sessionCapacityDetails: {},
  /* There cannot be more than one session of the same product with same timestamp.
   * There can be sessions of the product, with same date but different time. These
   * will be the independent sessions of the same product. But when we iterate over bookings,
   * we cannot find the actual instance only with date, as we have no knowledge of session
   * but only have access on booking object.
   * E.g. If product - 1 has session - 1 on 1st Jan 2017 12:00 and session - 2 on 1st Jan 2017
   * at 2:00. If user books 10 seats for session - 2 on 1st Jan at 2:00. We will save number of seats
   * in the record of the actual session (note there can be actual session [no repeat], or there can be
   * virtual sessions, with one parent session [repeat daily or weekly]). If user is booking virtual
   * session, we need to save its info in the parent (Actual) session but we cannot find which session
   * user has booked only by date, as there can be two different sessions on the same date with different time.
   * The actual session instance can only be find with date and time. Hence we have to keep track of time also.
   * Then for fetching also, at side, on booking screens, again we will need both date and time to find out
   * remaining seats of that day.
   * The followig four field will take care of that
  */
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
  /* When we iterate over session, we already have access to the session and we do not need to know,
   * which session we are talking about.
   * E.g. If product - 1 has session - 1 on 1st Jan 2017 12:00 and session - 2 on 1st Jan 2017
   * at 2:00. If user books 10 seats for session - 2 on 1st Jan at 2:00. With the help of bove tracking,
   * we already found out the actual session, now in this actual or parent session, there cannot be any other
   * virtual session with same date and time. So when we iterate on sessions, the date only can be primary key,
   * as time can be safely ignore with the help of the validation. No same date and time. So we can find remaining
   * seats of the virtual session of a actuall session for a particular day with that day as primary key.
   */
  numberOfBookingsSession: {
    type: Schema.Types.Mixed,
    default: {}
  },
  numberOfConfirmedBookingsSession: {
    type: Schema.Types.Mixed,
    default: {}
  },
  numberOfSeatsSession: {
    type: Schema.Types.Mixed,
    default: {}
  },
  numberOfConfirmedSeatsSession: {
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
  },
  created: {
    type: Date,
    default: Date.now
  },
  sessionDepartureDate: {
    type: Date,
    default: Date.now
  },
  sessionInternalName: {
    type: String
  }
});

mongoose.model('ProductSession', ProductSessionSchema);
