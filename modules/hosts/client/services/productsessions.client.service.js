(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('ProductSessionService', ProductSessionService);

  ProductSessionService.$inject = ['$resource'];

  function ProductSessionService($resource) {
    return $resource('/api/host/productsessions/', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
