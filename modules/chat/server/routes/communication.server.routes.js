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

  app.route('/api/notifications/markAsRead/:notificationId')
  	.post(comm.markAsRead);

  app.route('/api/notification/notRead')
  	.get(comm.fetchUnreadNotifications);
};
