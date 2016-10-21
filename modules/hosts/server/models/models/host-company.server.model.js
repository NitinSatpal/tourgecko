'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  validator = require('validator'),
  Schema = mongoose.Schema;

var validateLocalStrategyEmail = function (email) {
  return ((validator.isEmail(email, { require_tld: false })));
};
/**
 * Host Company Schema
 */
var HostCompanySchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  companyName: {
    type: String,
    default: '',
    trim: true
  },
  toursite: {
    type: String,
    default: '',
    trim: true
  },
  aboutHost: {
    type: String,
    default: '',
    trim: true
  },
  notoficationEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: 'example@example.com',
    validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
  },
  notificationMobile: {
    type: Number,
    default: 0
  },
  enquiryEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: 'example@example.com',
    validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
  },
  enquiryMobileNos: {
    type: Array,
    default: []
  },
  blogLink: {
    type: String,
    default: '',
    trim: true
  },
  companyWebsite: {
    type: String,
    default: '',
    trim: true
  },
  defaultCurrency: {
    type: Array,
    default: []
  },
  paymentOption: {
    type: Array,
    default: []
  },
  isToursiteActive: {
    type: Boolean,
    default: false
  },
  memberSince: {
    type: Date
  },
  hostType: {
    type: String,
    default: '',
    trim: true
  },
  hostPackage: {
    type: String,
    default: '',
    trim: true
  },
  hostCompanyAddress: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isAccountActive: {
    type: Boolean,
    default: false
  }
});

mongoose.model('HostCompany', HostCompanySchema);
