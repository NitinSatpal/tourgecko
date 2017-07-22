'use strict';

/**
 * Module dependencies
 */
var mailAndMessage = require('../controllers/mailsAndMessages.server.controller');

module.exports = function (app) {
  // mails and messages collection routes
  app.route('/api/host/verify/mobile')
    .post(mailAndMessage.sendMobileVerificationCode);
 
};
