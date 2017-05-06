'use strict';

/**
 * Module dependencies
 */
var admin = require('../controllers/tourgeckoadmin.server.controller'),
  path = require('path'),
  adminPolicy = require(path.resolve('./modules/users/server/policies/admin.server.policy'));

module.exports = function (app) {
  // require(path.resolve('./modules/users/server/routes/users.server.routes.js'))(app);
  // Theme collection routes
  app.route('/api/admin/themes')
    .post(adminPolicy.isAllowed, admin.saveThemes)
    .get(adminPolicy.isAllowed, admin.getThemes);

  app.route('/api/admin/activities')
    .post(adminPolicy.isAllowed, admin.saveActivities)
    .get(adminPolicy.isAllowed, admin.getActivities);

  app.route('/api/admin/hosts')
    .get(adminPolicy.isAllowed, admin.getHosts);

  app.route('/api/admin/languages')
    .post(adminPolicy.isAllowed, admin.saveLanguages);

  app.route('/api/admin/pinboardPins')
    .post(adminPolicy.isAllowed, admin.savePinBoardPins);
};
