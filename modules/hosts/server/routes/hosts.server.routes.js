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

  app.route('/api/host/toursitedata/:toursite')
    .get(hosts.getToursiteData);

  app.route('/api/host/product/')
    .post(hosts.createProduct)
    .get(hosts.fetchAllProductDetails);

  app.route('/api/host/editproduct/')
    .post(hosts.editProduct);

  app.route('/api/host/companyproducts/')
    .get(hosts.fetchCompanyProductDetails);

  app.route('/api/host/productsessions/')
    .get(hosts.fetchAllProductSessionDetails);

  app.route('/api/host/companyproductsessions/')
    .get(hosts.fetchCompanyProductSessionDetails);

  app.route('/api/host/productsession/:productSessionId')
    .get(hosts.fetchSingleProductSessionDetails);

  app.route('/api/host/product/productsession/:productId')
    .get(hosts.fetchSessionDetailsOfGivenProduct);

  app.route('/api/host/product/:productId')
    .get(hosts.fetchSingleProductDetails);

  app.route('/api/host/booking')
    .post(hosts.createBooking)
    .get(hosts.fetchCompanyBookingDetails);

  app.route('/api/host/productsession/bookings/:productSessionId')
    .get(hosts.fetchProductSessionBookingDetails);

  app.route('/api/host/categorizedBooking/')
    .post(hosts.fetchCategorizedBookings);

  app.route('/api/host/modifyBooking/')
    .post(hosts.modifyBooking);

  app.route('/api/host/booking/:bookingId')
    .get(hosts.fetchSingleBookingDetails);

  app.route('/api/product/productPictureUploads/')
    .post(hosts.uploadProductPicture);

  app.route('/api/product/productMap/:productId')
    .post(hosts.uploadProductMap);

  app.route('/api/social/host/facebook/pages')
    //.post(hosts.postOnFB),
    .get(hosts.getFBPages);

  app.route('/api/host/company')
    .get(hosts.fetchCompanyDetails)
    .post(hosts.saveCompanyDetails);

  app.route('/api/host/company/logo')
    .post(hosts.uploadCompanyLogo);

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

  app.route('/api/social/host/shortenURL')
    .get(hosts.shortenTheURL);

  app.route('/api/host/pinboard')
    .get(hosts.fetchPinboardData);

  app.route('/api/host/pinboard/dismiss')
    .post(hosts.setDismissedMessageIds);
};
