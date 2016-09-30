(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$scope', '$state', '$http', '$location', '$stateParams'];

  function HomeController($scope, $state, $http, $location, $stateParams) {
    var vm = this;
    var hostURL = $location.host();
    var tourHostToursite = hostURL.split('.')[0];

    if (tourHostToursite !== 'tourgecko' && tourHostToursite !== 'test') {
      $http.get('/api/host/toursite', { params: { 'toursite': tourHostToursite } }).success(function (response) {
        if (response === null || response === '' || response === undefined) {
          console.log('Toursite not found');
        } else {
          $state.go('abstractHome.toursite', { id: { userId: response._id }});
        }
      }).error(function (response) {
        vm.error = response.message;
      });
    } else {
      $state.go('abstractHome.home');
    }

  }
}());
