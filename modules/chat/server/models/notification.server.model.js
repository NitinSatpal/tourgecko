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
    ref: 'user'
  },
  notificationType: {
    type: String,
    default: '',
    trim: true
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
  }
});

mongoose.model('Notification', NotificationSchema);
