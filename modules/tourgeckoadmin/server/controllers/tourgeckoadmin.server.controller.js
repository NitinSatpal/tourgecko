'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
  require('./add-rich-data/addrichdata.server.controller'),
  require('./browse-and-modify/browseandmodify.server.controller'),
  require('./pinboard/pinboardAdmin.server.controller'),
  require('./cron-jobs/cronjobs.server.controller')
);
