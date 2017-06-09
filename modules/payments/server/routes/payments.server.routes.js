'use strict';

/**
 * Module dependencies
 */
var payment = require('../controllers/payments.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/payment/instamojo/')
    .post(payment.createInstamojoPayment);

  app.route('/api/payment/instamojo/refund/')
    .post(payment.refundInstamojoPayment);
};
