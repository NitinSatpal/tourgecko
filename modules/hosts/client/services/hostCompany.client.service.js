(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('HostCompanyService', HostCompanyService);

  HostCompanyService.$inject = ['$resource'];

  function HostCompanyService($resource) {
    return $resource('/api/host/company/', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
