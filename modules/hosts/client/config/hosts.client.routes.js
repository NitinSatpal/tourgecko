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
          roles: ['user', 'hostAdmin']
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
        url: '/product/edit',
        templateUrl: 'modules/hosts/client/views/add-product/add-product.client.view.html',
        controller: 'AddProductController',
        controllerAs: 'vm',
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
      .state('host.tourDetails', {
        url: '/tours/details',
        templateUrl: 'modules/hosts/client/views/tours/tourdetails.client.view.html',
        controller: 'TourDetailsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Admin | Tour'
        }
      })
      .state('host.notifications', {
        url: '/notifications',
        templateUrl: 'modules/hosts/client/views/host/notifications.client.view.html',
        controller: '',
        controllerAs: '',
        data: {
          pageTitle: 'Admin | Notifications'
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
        controller: '',
        controllerAs: '',
        data: {
          pageTitle: 'Admin | Bookings'
        }
      })
      .state('host.calendar', {
        url: '/calendar',
        templateUrl: 'modules/hosts/client/views/host/calendar.client.view.html',
        controller: '',
        controllerAs: '',
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
      .state('host.accountEdit', {
        url: '/settings/account/edit',
        templateUrl: 'modules/hosts/client/views/settings/account-edit-settings.client.view.html',
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
      .state('host.testing', {
        url: '/testing',
        templateUrl: 'modules/hosts/client/views/testing.client.view.html',
        controller: '',
        controllerAs: '',
        data: {
          pageTitle: 'Admin | Bookings'
        }
      });
  }

}());
