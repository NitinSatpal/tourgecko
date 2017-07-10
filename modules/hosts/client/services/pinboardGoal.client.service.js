(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('PinboardGoalService', PinboardGoalService);

  PinboardGoalService.$inject = ['$resource'];

  function PinboardGoalService($resource) {
    return $resource('/api/host/pinboardgoals/', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
