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
  messageFromProfileURL: {
    type: String
  },
  messageTo: {
    type: String,
    default: '',
    trim: true
  },
  messageToId: {
    type:Schema.ObjectId,
    ref: 'user'
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
  },
  messageRead: {
    type: Boolean,
    default: false
  }
});

mongoose.model('Message', MessageSchema);
