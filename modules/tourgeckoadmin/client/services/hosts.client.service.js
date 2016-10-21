(function () {
  'use strict';

  // Users service used for communicating with the users REST endpoint
  angular
    .module('tourgeckoadmin.services')
    .factory('HostService', HostService);

  HostService.$inject = ['$resource'];

  function HostService($resource) {
    return $resource('api/admin/hosts', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
