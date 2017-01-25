'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var NotificationSchema = new Schema({
  notificationFrom: {
    type: String,
    default: '',
    trim: true
  },
  notificationFromProfileURL: {
    type: String
  },
  notificationTo: {
    type: String,
    default: '',
    trim: true
  },
  notificationToId: {
    type:Schema.ObjectId,
    ref: 'User'
  },
  notificationType: {
    type: String,
    default: '',
    trim: true
  },
  bookingId: {
    type: Schema.ObjectId,
    ref: 'Booking'
  },
  notificationBody: {
    type: String,
    default: '',
    trim: true
  },
  notificationStatus: {
    type: String,
    default: '',
    trim: true
  },
  notificationRead: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date
  }
});

mongoose.model('Notification', NotificationSchema);
