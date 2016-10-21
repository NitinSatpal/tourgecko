'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var MessageSchema = new Schema({
  messageFrom: {
    type: String,
    default: '',
    trim: true
  },
  messageTo: {
    type: String,
    default: '',
    trim: true
  },
  messageType: {
    type: String,
    default: '',
    trim: true
  },
  messageBody: {
    type: String,
    default: '',
    trim: true
  },
  messageStatus: {
    type: String,
    default: '',
    trim: true
  }
});

mongoose.model('Message', MessageSchema);
