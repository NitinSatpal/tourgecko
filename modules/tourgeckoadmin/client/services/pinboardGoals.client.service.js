(function () {
  'use strict';

  // Users service used for communicating with the users REST endpoint
  angular
    .module('tourgeckoadmin.services')
    .factory('PinboardGoalAdminService', PinboardGoalAdminService);

  PinboardGoalAdminService.$inject = ['$resource'];

  function PinboardGoalAdminService($resource) {
    return $resource('api/admin/pinboardGoals', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
