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
      .state('hostHome', {
        url: '/host/admin',
        templateUrl: 'modules/hosts/client/views/hostHome.client.view.html',
        controller: 'HostHomeController',
        controllerAs: 'vm',
        data: {
          roles: ['user'],
          pageTitle: 'Admin - Home'
        }
      });
  }
}());
