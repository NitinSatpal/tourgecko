(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('BookingService', BookingService);

  BookingService.$inject = ['$resource'];

  function BookingService($resource) {
    return $resource('/api/host/booking/', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
