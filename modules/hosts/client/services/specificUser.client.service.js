(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('SpecificUserService', SpecificUserService);

  SpecificUserService.$inject = ['$resource'];

  function SpecificUserService($resource) {
    return $resource('/api/users/me/', {
    }, {
      update: {
        method: 'PUT'
      },
      query: {method:'GET',isArray:false}
    });
  }
}());
