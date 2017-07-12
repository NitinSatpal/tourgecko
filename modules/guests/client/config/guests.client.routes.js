(function () {
  'use strict';

  // Setting up route
  angular
    .module('guests.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
  	$stateProvider
      .state('guest', {
        abstract: true,
        url: '',
        templateUrl: 'modules/guests/client/views/guest.client.view.html',
        controller: '',
        controllerAs: '',
      })
      .state('guest.guestHome', {
        url: '/home',
        templateUrl: 'modules/guests/client/views/guestHome.client.view.html',
        controller: 'GuestHomeController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Guest | Home',
          roles: ['user']
        }
      })
      .state('guest.tourDetails', {
        url: '/tour/:productId',
        templateUrl: 'modules/guests/client/views/tours/tourDetails.client.view.html',
        controller: 'TourDetailsController',
        controllerAs: 'vm',
        params: {
        	productId: null
        },
        data: {
          pageTitle: 'Tour | Details',
          roles: ['user', 'guest']
        }
      })
      .state('guest.booking', {
        url: '/tour/book/:productId?via',
        templateUrl: 'modules/guests/client/views/booking/tourBooking.client.view.html',
        controller: 'TourBookingController',
        controllerAs: 'vm',
        params: {
        	productId: null,
          via: null
        },
        data: {
          pageTitle: 'Tour | Booking'
        }
      })
      .state('guest.bookingDone', {
        url: '/tour/booking/done?payment_id&payment_request_id',
        templateUrl: 'modules/guests/client/views/booking/tourBookingDone.client.view.html',
        controller: 'TourBookingDoneController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Tour | Booking Done'
        },
        params: {
          payment_id: null,
          payment_request_id: null
        }
      });
  }

}());
