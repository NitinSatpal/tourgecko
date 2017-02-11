(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('PinboardService', PinboardService);

  PinboardService.$inject = ['$resource'];

  function PinboardService($resource) {
    return $resource('/api/host/pinboard/', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
