'use strict';

/**
 * Module dependencies
 */
var message = require('../controllers/message.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/message/')
    .get(message.fetchMessageDetails)
    .post(message.saveMessageDetails);
};
