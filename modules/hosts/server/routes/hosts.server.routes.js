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

  app.route('/api/host/product/')
    .post(hosts.createProduct)
    .get(hosts.fetchAllProductDetails);

  app.route('/api/host/productsessions/')
    .get(hosts.fetchAllProductSessionDetails);

  app.route('/api/host/product/:productId')
    .get(hosts.fetchSingleProductDetails);

  app.route('/api/host/booking')
    .post(hosts.createBooking)
    .get(hosts.fetchAllBookingDetails);

  app.route('/api/product/productPicture')
    .post(hosts.uploadProductPicture);

  app.route('/api/product/productMap')
    .post(hosts.uploadProductMap);
};
