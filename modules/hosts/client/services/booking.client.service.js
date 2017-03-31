(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('CalendarBookingService', CalendarBookingService);

  CalendarBookingService.$inject = ['$resource'];

  function CalendarBookingService($resource) {
    return $resource('/api/host/bookingDetailsForCalendar/', {
    }, {
      update: {
        method: 'PUT'
      },
      isArray: false
    });
  }
}());
