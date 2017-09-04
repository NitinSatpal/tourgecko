(function () {
  'use strict';

  angular
    .module('core')
    .controller('AbstractHomeController', AbstractHomeController);

  AbstractHomeController.$inject = ['$scope', '$rootScope', '$state', '$http', '$location', '$stateParams', '$window'];

  function AbstractHomeController($scope, $rootScope, $state, $http, $location, $stateParams, $window) {
    var vm = this;
    var hostURL = $location.host();
    var tourHostToursite = hostURL.split('.')[0];
    if (tourHostToursite !== 'tourgecko' && tourHostToursite !== 'test' && tourHostToursite !== 'localhost' && tourHostToursite !== 'www'){ 
      $http.get('/api/host/toursite', { params: { 'toursite': tourHostToursite } }).success(function (response) {
        if (response === null || response === '' || response === undefined) {
          $location.path('/not-found');
        } else {
          $("#tourgeckoBody").addClass(tourHostToursite);
          $state.go('abstractHome.toursite', { toursite:  tourHostToursite});
        }
      }).error(function (response) {
        vm.error = response.message;
      });
    } else {
      // using nginx we are redirecting from http to https
      // using nginx only we were redirecting from www to non www, but in that case, subdomains were poinint to main
      // domain. Hence this is the workaround for forwarding all traffic from www to non www.
      // going forward we need to find how to achieve it using nginx
      if (tourHostToursite == 'www') {
        var targetURL = '';
        for (var index = 1; index < hostURL.split('.').length; index++) {
          targetURL = targetURL + hostURL.split('.')[index];
          if (index < hostURL.split('.').length - 1)
            targetURL = targetURL + '.';
        }
        $window.location.href = $window.location.protocol + '//' + targetURL;
      } else {
        $state.go('abstractHome.home');
      }
    }
  }
}());
