(function () {
  'use strict';

  // Setting up route
  angular
    .module('hosts.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Users state routing
    $stateProvider
      .state('host', {
        abstract: true,
        url: '/host',
        templateUrl: 'modules/hosts/client/views/host.client.view.html',
        controller: '',
        controllerAs: '',
        data: {
          roles: ['hostAdmin']
        }
      })
      .state('host.hostHome', {
        url: '/admin',
        templateUrl: 'modules/hosts/client/views/hostHome.client.view.html',
        controller: 'HostHomeController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Admin | Home'
        }
      })
      .state('host.addProduct', {
        url: '/product/add',
        templateUrl: 'modules/hosts/client/views/add-product/add-product.client.view.html',
        controller: 'AddProductController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Admin | Add Product'
        }
      })
      .state('host.editProduct', {
        url: '/product/edit/:productId',
        templateUrl: 'modules/hosts/client/views/add-product/add-product.client.view.html',
        controller: 'AddProductController',
        controllerAs: 'vm',
        params: {
          productId: null
        },
        data: {
          pageTitle: 'Admin | Edit Product'
        }
      })
      .state('host.tours', {
        url: '/tours',
        templateUrl: 'modules/hosts/client/views/tours/tourlist.client.view.html',
        controller: 'TourListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Admin | Tours'
        }
      })
      .state('host.allMessages', {
        url: '/messages',
        templateUrl: 'modules/hosts/client/views/host/messages.client.view.html',
        controller: '',
        controllerAs: '',
        data: {
          pageTitle: 'Admin | Messages'
        }
      })
      .state('host.allBookings', {
        url: '/bookings',
        templateUrl: 'modules/hosts/client/views/host/bookings.client.view.html',
        controller: 'ProductBookingController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Admin | Bookings'
        }
      })
      .state('host.bookingdetails', {
        url: '/booking/:bookingId',
        templateUrl: 'modules/hosts/client/views/host/bookingDetails.client.view.html',
        controller: 'ProductBookingController',
        controllerAs: 'vm',
        params: {
          bookingId: null
        },
        data: {
          pageTitle: 'Admin | Booking Details'
        }
      })
      .state('host.sessionBookingDetails', {
        url: '/tour/:productSessionId/bookings',
        templateUrl: 'modules/hosts/client/views/tour-booking-details/tourBookingDetails.client.view.html',
        controller: 'TourBookingDetailsController',
        controllerAs: 'vm',
        params: {
          productSessionId: null
        },
        data: {
          pageTitle: 'Admin | Tour Bookings'
        }
      })
      .state('host.calendar', {
        url: '/calendar',
        templateUrl: 'modules/hosts/client/views/host/calendar.client.view.html',
        controller: 'TourCalendarController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Admin | Calendar'
        }
      })
      .state('host.companyProfile', {
        url: '/settings/companyprofile',
        templateUrl: 'modules/hosts/client/views/settings/companyProfile-settings.client.view.html',
        controller: 'HostSettingsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Company Profile'
        }
      })
      .state('host.contacts', {
        url: '/settings/contacts',
        templateUrl: 'modules/hosts/client/views/settings/contacts-settings.client.view.html',
        controller: 'HostSettingsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Contacts'
        }
      })
      .state('host.payments', {
        url: '/settings/payments',
        templateUrl: 'modules/hosts/client/views/settings/payments-settings.client.view.html',
        controller: 'HostSettingsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Payments'
        }
      })
      .state('host.toursite', {
        url: '/settings/toursite',
        templateUrl: 'modules/hosts/client/views/settings/toursite-settings.client.view.html',
        controller: 'HostSettingsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Toursite'
        }
      })
      .state('host.account', {
        url: '/settings/account',
        templateUrl: 'modules/hosts/client/views/settings/account-settings.client.view.html',
        controller: 'HostSettingsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Account'
        }
      })
      .state('host.region', {
        url: '/settings/region',
        templateUrl: 'modules/hosts/client/views/settings/region-settings.client.view.html',
        controller: 'HostSettingsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Region'
        }
      })
      .state('hostAndGuest', {
        abstract: true,
        url: '',
        templateUrl: 'modules/core/client/views/previewAndDetails.client.view.html',
        controller: '',
        controllerAs: '',
        data: {
          pageTitle: 'Admin | Tour'
        }
      })
      .state('hostAndGuest.tourPreview', {
        url: '/host/tour/preview/:productId',
        templateUrl: 'modules/hosts/client/views/tours/tourpreview.client.view.html',
        controller: 'TourPreviewController',
        controllerAs: 'vm',
        params: {
          productId: null
        },
        data: {
          pageTitle: 'Admin | Tour'
        }
      })
      .state('hostAndGuest.previewBeforeSave', {
        url: '/host/tour/preview',
        templateUrl: 'modules/hosts/client/views/tours/tourpreview.client.view.html',
        controller: 'TourPreviewController',
        controllerAs: 'vm',
        params: {
          tourObject: null
        },
        data: {
          pageTitle: 'Admin | Tour'
        }
      });
  }

}());
