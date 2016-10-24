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
          roles: ['user']
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
        resolve: {
          tourResolve: newTour
        },
        data: {
          pageTitle: 'Add Product'
        }
      })
      .state('host.tours', {
        url: '/tours',
        templateUrl: 'modules/hosts/client/views/tours/tourlist.client.view.html',
        controller: '',
        controllerAs: '',
        data: {
          pageTitle: 'tours'
        }
      })
      .state('host.notifications', {
        url: '/notifications',
        templateUrl: 'modules/hosts/client/views/host/notifications.client.view.html',
        controller: '',
        controllerAs: '',
        data: {
          pageTitle: 'tours'
        }
      });
  }

  newTour.$inject = ['ProductService'];

  function newTour(ProductService) {
    return new ProductService();
  }

}());
