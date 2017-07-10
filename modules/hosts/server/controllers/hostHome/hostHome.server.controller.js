'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),  
  Pin = mongoose.model('PinboardPins'),
  Goal = mongoose.model('PinboardGoals'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));





