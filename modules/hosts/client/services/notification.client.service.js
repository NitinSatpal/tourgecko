(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('NotificationService', NotificationService);

  NotificationService.$inject = ['$resource'];

  function NotificationService($resource) {
    return $resource('/api/notification/', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
