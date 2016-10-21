'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Themes Schema
 */
var ThemeSchema = new Schema({
  themeName: {
    type: String,
    default: '',
    trim: true
  }
});

mongoose.model('Theme', ThemeSchema);
