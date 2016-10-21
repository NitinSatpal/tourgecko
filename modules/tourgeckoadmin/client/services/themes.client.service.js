(function () {
  'use strict';

  // Users service used for communicating with the users REST endpoint
  angular
    .module('tourgeckoadmin.services')
    .factory('ThemeService', ThemeService);

  ThemeService.$inject = ['$resource'];

  function ThemeService($resource) {
    return $resource('api/admin/themes', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
