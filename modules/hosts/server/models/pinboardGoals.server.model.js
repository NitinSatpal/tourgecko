'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var PinboardGoalsSchema = new Schema({
  to: {
    type: [String],
  },
  goalText: {
    type: String
  },
  pinsForthisGoal: {
  	type: Array,
  	default: []
  }

});

mongoose.model('PinboardGoals', PinboardGoalsSchema);
