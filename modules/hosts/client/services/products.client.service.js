(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('ProductService', ProductService);

  ProductService.$inject = ['$resource'];

  function ProductService($resource) {
    return $resource('/api/host/product/', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
