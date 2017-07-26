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
  },
  uniqueGoalName: {
    type: String
  },
  isInitialGoal: {
    type: Boolean,
    default: false
  },
  completedPinsCounter: {
    type: Number,
    default: 0
  },
  isGoalCompleted: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date
  }

});

mongoose.model('PinboardGoals', PinboardGoalsSchema);
