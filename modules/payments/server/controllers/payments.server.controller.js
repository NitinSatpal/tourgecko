'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
  require('./razorpay/razorpay-payments.server.controller'),
  require('./instamojo/instamojo-payments.server.controller')
);
