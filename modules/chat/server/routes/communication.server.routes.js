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

  app.route('/api/notification/initialfetch/')
  	.get(comm.fetcInitialhNotificationDetails);

   app.route('/api/notification/fetchAllNotifications/:lastMonthFetched/:lastYearFetched')
    .get(comm.fetcAllNotificationDetailsForGivenMonth);

  app.route('/api/notification/markAsRead/:notificationId')
  	.post(comm.markAsRead);

  app.route('/api/notification/unreadCount')
  	.get(comm.getUnreadNotificationsCount);
};
