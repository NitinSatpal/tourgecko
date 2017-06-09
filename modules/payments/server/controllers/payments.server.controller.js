'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
  //require('./capturePayments/capturePayments.server.controller'),
  require('./instamojo/instamojo-payments.server.controller')
);
