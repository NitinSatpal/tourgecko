(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('MessageService', MessageService);

  MessageService.$inject = ['$resource'];

  function MessageService($resource) {
    return $resource('/api/message/', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
