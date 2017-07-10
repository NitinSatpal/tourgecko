'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
  require('./sms/sms.server.controller'),
  require('./mails/mail.server.controller')
);
