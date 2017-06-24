(function () {
  'use strict';

  angular
    .module('core')
    .controller('AbstractHomeController', AbstractHomeController);

  AbstractHomeController.$inject = ['$scope', '$rootScope', '$state', '$http', '$location', '$stateParams'];

  function AbstractHomeController($scope, $rootScope, $state, $http, $location, $stateParams) {
    var vm = this;
    var hostURL = $location.host();
    var tourHostToursite = hostURL.split('.')[0];
    if (tourHostToursite !== 'tourgecko' && tourHostToursite !== 'test' && tourHostToursite !== 'localhost') {
      $http.get('/api/host/toursite', { params: { 'toursite': tourHostToursite } }).success(function (response) {
        if (response === null || response === '' || response === undefined) {
          $location.path('/not-found');
        } else {
          $state.go('abstractHome.toursite', { toursite:  tourHostToursite});
        }
      }).error(function (response) {
        vm.error = response.message;
      });
    } else {
      $state.go('abstractHome.home');
    }
  }
}());
