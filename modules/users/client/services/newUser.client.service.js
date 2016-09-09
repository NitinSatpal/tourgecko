(function () {
  'use strict';

  angular
    .module('users.services')
    .factory('newUsersService', newUsersService);

  newUsersService.$inject = ['$resource'];

  function newUsersService($resource) {
    return $resource('/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
