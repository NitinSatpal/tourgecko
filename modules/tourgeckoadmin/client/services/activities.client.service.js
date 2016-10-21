(function () {
  'use strict';

  // Users service used for communicating with the users REST endpoint
  angular
    .module('tourgeckoadmin.services')
    .factory('ActivityService', ActivityService);

  ActivityService.$inject = ['$resource'];

  function ActivityService($resource) {
    return $resource('api/admin/activities', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
