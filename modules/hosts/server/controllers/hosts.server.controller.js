'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
  require('./toursite/toursite.server.controller'),
  require('./product/product.server.controller'),
  require('./bookings/booking.server.controller'),
  require('./socialAccounts/socialPost.server.controller'),
  require('./hostHome/hostHome.server.controller'),
  require('./hostSettings/hostSettings.server.controller'),  
  require('./postPayments/postPayment.server.controller'),
  require('./pinboard/pinboard.server.controller'),
  require('./integrations/integrations.server.controller')
);
