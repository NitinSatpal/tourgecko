'use strict';

/**
 * Module dependencies
 */
var hosts = require('../controllers/hosts.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/host/toursite/')
    .get(hosts.getToursite);

  app.route('/api/host/toursitedata')
    .get(hosts.getToursiteData);
};
