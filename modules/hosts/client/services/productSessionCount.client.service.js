(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('ProductSessionCountService', ProductSessionCountService);

  ProductSessionCountService.$inject = ['$resource'];

  function ProductSessionCountService($resource) {
    return $resource('/api/host/companyproductsessioncount/', {
    }, {
      update: {
        method: 'PUT'
      },
      query: {
        isArray: false
      }
    });
  }
}());
