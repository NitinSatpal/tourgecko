'use strict';

/**
 * Module dependencies
 */
var hosts = require('../controllers/hosts.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/host/toursite/')
    .get(hosts.getToursite)
    .post(hosts.saveToursiteDetails);

  app.route('/api/host/toursitedata/:toursite')
    .get(hosts.getToursiteData);

  app.route('/api/host/toursitedataForCurrentPage/:toursite/:pageNumber/:itemsPerPage')
    .get(hosts.getToursiteDataForCurrentPage);

  app.route('/api/host/product/')
    .post(hosts.createProduct)
    .get(hosts.fetchAllProductDetails);

  app.route('/api/host/editproduct/')
    .post(hosts.editProduct);

  app.route('/api/host/productVisibility/')
    .post(hosts.changeProductVisibility);

  app.route('/api/host/companyproducts/')
    .get(hosts.fetchCompanyProductDetails);

  app.route('/api/host/allCompanyproducts/:itemsPerPage')
    .get(hosts.fetchAllProductDetailsOfCompany);

  app.route('/api/host/companyproductsForCurrentPage/:pageNumber/:itemsPerPage')
    .get(hosts.fetchCompanyProductDetailsForCurrentPage);

  app.route('/api/host/companyproductsForCurrentPageAfterEdit/:pageNumber/:itemsPerPage')
    .get(hosts.fetchCompanyProductDetailsForCurrentPageAfterEdit);

  app.route('/api/host/productsessions/')
    .get(hosts.fetchAllProductSessionDetails);

  app.route('/api/host/productsessions/guestData/:productSessionId/:skipIndex')
    .get(hosts.fetchProductSessionBookingDetailsForGuestData);
  

  app.route('/api/host/companyproductsessions/')
    .get(hosts.fetchCompanyProductSessionDetails);

  app.route('/api/host/companyproductsessioncount/')
    .get(hosts.countCompanyProductSessions);

  app.route('/api/host/companyproductsessionsforgivenmonth/:uniqueMonthYearString')
    .get(hosts.fetchCompanyProductSessionDetailsForGivenMonth);

  app.route('/api/host/productsession/:productSessionId')
    .get(hosts.fetchSingleProductSessionDetails);

  app.route('/api/host/product/productsession/:productId')
    .get(hosts.fetchSessionDetailsOfGivenProduct);

  app.route('/api/host/product/:productId')
    .get(hosts.fetchSingleProductDetails);

  app.route('/api/host/fetchFutureSessionsOfGivenProduct/:productId')
    .get(hosts.fetchFutureSessionDetailsOfGivenProduct);

  app.route('/api/host/booking')
    .post(hosts.createBooking)
    .get(hosts.fetchCompanyBookingDetails);

  app.route('/api/host/allBookings/:itemsPerPage')
    .get(hosts.fetchAllBookingDetailsOfCompany);

  app.route('/api/host/bookingDetailsForCalendar')
    .get(hosts.fetchCompanyBookingDetailsForCalendar);

  app.route('/api/host/bookingsForCurrentPage/:pageNumber/:itemsPerPage')
    .get(hosts.fetchCompanyBookingDetailsForCurrentPage);

  app.route('/api/host/productsession/bookingsForCurrentPage/:productSessionId/:pageNumber/:itemsPerPage')
    .get(hosts.fetchSessionBookingDetailsForCurrentPage);

  app.route('/api/host/productsession/bookings/:productSessionId')
    .get(hosts.fetchProductSessionBookingDetails);

   app.route('/api/host/productsession/allBookings/:productSessionId/:itemsPerPage')
    .get(hosts.fetchAllBookingsOfProductSession);

  app.route('/api/host/categorizedBooking/')
    .post(hosts.fetchCategorizedBookings);

  app.route('/api/host/productsession/categorizedBooking/')
    .post(hosts.fetchCategorizedBookingsForASession);

  app.route('/api/host/modifyBooking/')
    .post(hosts.modifyBooking);

  app.route('/api/host/booking/:bookingId')
    .get(hosts.fetchSingleBookingDetails);

  app.route('/api/product/productPictureUploads/')
    .post(hosts.uploadProductPicture);

   app.route('/api/product/productPictureUploadDelete/')
    .post(hosts.deleteProductPicture);

  app.route('/api/product/productMapUploads/')
    .post(hosts.uploadProductMap);

  app.route('/api/product/productMapUploadDelete/')
    .post(hosts.deleteProductMap);

  app.route('/api/social/host/facebook/pages')
    //.post(hosts.postOnFB),
    .get(hosts.getFBPages);

  app.route('/api/host/company')
    .get(hosts.fetchCompanyDetails)
    .post(hosts.saveCompanyDetails);

  app.route('/api/host/company/logo/')
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

  app.route('/api/host/sessionGuestMassMail/')
    .post(hosts.sendMassMailForTheSession);

  app.route('/api/host/sessionGuestMassMessage/')
    .post(hosts.sendMassMessagesForTheSession);

  app.route('/api/host/sendContentToHostFromContactUs/')
    .post(hosts.sendContactUsContentToHost);
};
