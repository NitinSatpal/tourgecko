'use strict';

/**
 * Module dependencies
 */
var hosts = require('../controllers/hosts.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/host/toursite/')
    .get(hosts.getToursite)
    .post(hosts.saveToursiteDetails)

  app.route('/api/host/toursitedata')
    .get(hosts.getToursiteData);

  app.route('/api/host/product/')
    .post(hosts.createProduct)
    .get(hosts.fetchAllProductDetails);

  app.route('/api/host/companyproducts/')
    .get(hosts.fetchCompanyProductDetails);

  app.route('/api/host/productsessions/')
    .get(hosts.fetchAllProductSessionDetails);

  app.route('/api/host/product/:productId')
    .get(hosts.fetchSingleProductDetails);

  app.route('/api/host/booking')
    .post(hosts.createBooking)
    .get(hosts.fetchCompanyBookingDetails);

 /* app.route('/api/product/productPicture')
    .post(hosts.uploadProductPicture);

  app.route('/api/product/productMap')
    .post(hosts.uploadProductMap); */

  /*app.route('/api/social/host/twitter')
    .post(hosts.postOnTwitter);*/

  /*app.route('/api/social/host/facebook')
    .post(hosts.postOnFB);*/

  app.route('/api/host/company')
    .get(hosts.fetchCompanyDetails)
    .post(hosts.saveCompanyDetails);

  app.route('/api/host/contact')
    .post(hosts.saveContactDetails);

  app.route('/api/host/payment')
    .post(hosts.savePaymentDetails);

 /* app.route('/api/host/account')
    .post(hosts.saveAccountDetails); */

  app.route('/api/host/language')
    .get(hosts.getSupportedLanguages);

  app.route('/api/host/region')
    .post(hosts.saveRegionalDetails);

};
