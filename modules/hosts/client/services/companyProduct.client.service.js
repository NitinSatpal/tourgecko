(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('CompanyProductService', CompanyProductService);

  CompanyProductService.$inject = ['$resource'];

  function CompanyProductService($resource) {
    return $resource('/api/host/companyproducts/', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
