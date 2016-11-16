(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('LanguageService', LanguageService);

  LanguageService.$inject = ['$resource'];

  function LanguageService($resource) {
    return $resource('/api/host/language/', {
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
