(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('PinboardPinService', PinboardPinService);

  PinboardPinService.$inject = ['$resource'];

  function PinboardPinService($resource) {
    return $resource('/api/host/pinboardpins/', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
