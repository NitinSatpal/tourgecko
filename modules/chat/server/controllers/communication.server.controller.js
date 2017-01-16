'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
  require('./messages/message.server.controller'),
  require('./notifications/notification.server.controller')
);
