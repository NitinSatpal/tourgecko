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
      .state('host.showProduct', {
        url: '/product/:productId',
        templateUrl: 'modules/hosts/client/views/add-product/add-product.client.view.html',
        controller: 'AddProductController',
        controllerAs: 'vm',
        params: {
          productId: null,
          showSuccessMsg: null,
          showEditSuccessMsg: null
        },
        data: {
          pageTitle: 'Admin | Product'
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
        controller: 'MessageController',
        controllerAs: 'vm',
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
          bookingId: null,
          // if single booking details page is called from whole session booking list page, then go back should take use to session
          // booking list page and for that we are storing here session id. It will be null if user come on this page via bookings tab
          // In case user is coming from session booking list pageit will be populated by session id and used for rendering back to session
          // booking list
          sessionId: null
        },
        data: {
          pageTitle: 'Admin | Booking Details'
        }
      })
      .state('host.sessionDetails', {
        url: '/tour/session/:productSessionId/:sessionStartDate',
        templateUrl: 'modules/hosts/client/views/tour-booking-details/tourBookingDetails.client.view.html',
        controller: 'TourBookingDetailsController',
        controllerAs: 'vm',
        params: {
          productSessionId: null,
          sessionStartDate: null
        },
        data: {
          pageTitle: 'Admin | Tour Bookings'
        }
      })
      .state('host.calendar', {
        url: '/sessions',
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
      .state('host.toursiteDomain', {
        url: '/toursite/domain',
        templateUrl: 'modules/hosts/client/views/settings/toursite-domain-settings.client.view.html',
        controller: 'HostSettingsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Toursite'
        }
      })
      .state('host.toursiteBanners', {
        url: '/toursite/banners',
        templateUrl: 'modules/hosts/client/views/settings/toursite-banners-settings.client.view.html',
        controller: 'HostSettingsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Toursite'
        }
      })
      .state('host.allNotifications', {
        url: '/notifications',
        templateUrl: 'modules/hosts/client/views/notifications/allnotifications.client.view.html',
        controller: 'NotificationsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'notifications'
        }
      })
      .state('host.bookButton', {
        url: '/book-button',
        templateUrl: 'modules/hosts/client/views/book-button/bookButton.client.view.html',
        controller: 'BookButtonController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'book button'
        }
      })
      .state('host.hostHelp', {
        url: '/help',
        templateUrl: 'modules/hosts/client/views/host/hostHelp.client.view.html',
        controller: '',
        controllerAs: '',
        data: {
          pageTitle: 'help'
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
      })
      .state('integrations', {
        abstract: true,
        url: '/integrations',
        templateUrl: 'modules/hosts/client/views/integrations/integration.client.view.html',
        controller: '',
        controllerAs: '',
      })
      .state('integrations.tours', {
        url: '/tours',
        templateUrl: 'modules/hosts/client/views/integrations/integrationTours.client.view.html',
        controller: 'IntegrationToursController',
        controllerAs: 'vm',
        params: {
          toursite: null
        },
        data: {
          pageTitle: 'tours'
        }
      })
      .state('integrations.tourDetails', {
        url: '/tour/:productId',
        templateUrl: 'modules/hosts/client/views/integrations/integrationTourDetails.client.view.html',
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
      .state('integrations.booking', {
        url: '/tour/book/:productId',
        templateUrl: 'modules/hosts/client/views/integrations/integrationTourBooking.client.view.html',
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
      .state('integrations.lockedCheckout', {
        url: '/chekout/error',
        templateUrl: 'modules/guests/client/views/booking/lockedCheckout.client.view.html',
        controller: '',
        controllerAs: '',
        params: {
          productId: null,
          via: null
        },
        data: {
          pageTitle: 'Tour | Booking'
        }
      })
      .state('integrations.bookingDone', {
        url: '/tour/booking/done?payment_id&payment_request_id',
        templateUrl: 'modules/hosts/client/views/integrations/integrationTourBookingDone.client.view.html',
        controller: 'TourBookingDoneController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Tour | Booking Done'
        },
        params: {
          payment_id: null,
          payment_request_id: null
        }
      })
      .state('host.coming-soon', {
        url: '/coming-soon',
        templateUrl: 'modules/hosts/client/views/coming-soon.client.view.html',
        data: {
          pageTitle: 'coming-soon'
        }
      });
  }

}());
