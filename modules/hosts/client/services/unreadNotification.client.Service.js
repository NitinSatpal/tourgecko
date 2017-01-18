(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('UnreadNotificationService', UnreadNotificationService);

  UnreadNotificationService.$inject = ['$resource'];

  function UnreadNotificationService($resource) {
    return $resource('/api/notification/notRead', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
