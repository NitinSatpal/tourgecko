(function () {
  'use strict';

  angular
    .module('core')
    .controller('AbstractHomeController', AbstractHomeController);

  AbstractHomeController.$inject = ['$scope', '$rootScope', '$state', '$http', '$location', '$stateParams', '$window'];

  function AbstractHomeController($scope, $rootScope, $state, $http, $location, $stateParams, $window) {
    var vm = this;
    console.log('will it help me seriously ' + $window.location.href);
    console.log('did it help ' + window.location.href);
    var hostURL = $location.host();
    var tourHostToursite = hostURL.split('.')[0];
    if (tourHostToursite !== 'tourgecko' && tourHostToursite !== 'test' && tourHostToursite !== 'localhost' && tourHostToursite !== 'www') {
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
      if (tourHostToursite == 'www') {
        console.log ('akakakakakaakak ' + hostURL.split('.'));
        //$window.location.href = $window.location.protocol + '//' + response.toursite + '.' + $window.location.host;
        //$window.location.href = 'https://tourgecko.com';
      } else {
        $state.go('abstractHome.home');
      }
    }
  }
}());
