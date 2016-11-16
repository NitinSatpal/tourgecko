'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var I18NLanguageSchema = new Schema({
  supportedLanguages: {
    type: Array,
    default: '[]'
  },
  
});

mongoose.model('I18NLanguage', I18NLanguageSchema);
