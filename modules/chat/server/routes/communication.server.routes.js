'use strict';

/**
 * Module dependencies
 */
var comm = require('../controllers/communication.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/message/')
    .get(comm.fetchMessageDetails)
    .post(comm.saveMessageDetails);

  app.route('/api/notification/')
  	.get(comm.fetchNotificationDetails);
};
