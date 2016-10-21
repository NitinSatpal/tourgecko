'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Themes Schema
 */
var ActivitySchema = new Schema({
  activityName: {
    type: String,
    default: '',
    trim: true
  }
});

mongoose.model('Activity', ActivitySchema);
