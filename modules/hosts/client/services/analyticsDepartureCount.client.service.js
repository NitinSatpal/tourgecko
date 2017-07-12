(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('AnalyticsDepartureCountService', AnalyticsDepartureCountService);

  AnalyticsDepartureCountService.$inject = ['$resource'];

  function AnalyticsDepartureCountService($resource) {
    return $resource('/api/host/companyproductsessioncount/', {
    }, {
      update: {
        method: 'PUT'
      },
      query: {
        isArray: false
      }
    });
  }
}());
