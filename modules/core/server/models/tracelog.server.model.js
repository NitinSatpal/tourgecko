'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var TraceLogSchema = new Schema({
  objectType: {
    type: String
  },
  objectId: {
    type: String
  },
  traceDate: {
    type: String
  },
  tracelogMessage: {
    type: String
  },
  created: {
    type: Date
  }
});
mongoose.model('TraceLog', TraceLogSchema);

