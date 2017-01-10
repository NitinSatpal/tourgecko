'use strict';

/**
 * Module dependencies
 */
var guests = require('../controllers/guests.server.controller');

module.exports = function (app) {

  app.route('/api/guest/product/:productId')
    .get(guests.fetchProductDetails);

 app.route('/api/guest/company/:productId')
   // .get(guests.fetchCompanyDetails)

 app.route('/api/guest/productSessions/:productId')
 	.get(guests.fethcProductSessionsOfProduct);

};
