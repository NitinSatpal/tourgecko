
(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('sidenavController', sidenavController);

  sidenavController.$inject = ['$scope', '$window', '$http', '$location', 'Authentication'];

  function sidenavController($scope, $window, $http, $location, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
    
    vm.hideSideNav = false;
    var hideSideNavHere = new Set();
    hideSideNavHere.add('/');
    hideSideNavHere.add('/host/tourdetails');
    hideSideNavHere.add('/password/reset/success');
    hideSideNavHere.add('/host/tour/preview');
    hideSideNavHere.add('/admin/home');
    
    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
        if(hideSideNavHere.has($location.path()) || $location.path().split('/')[3] == 'preview')
          vm.hideSideNav = true;
        else
          vm.hideSideNav = false;
    }

    vm.goToHostWebsite = function() {
      $http.get('/api/host/toursite').success(function (response) {
        if (response.toursite === null || response.toursite === '' || response.toursite === undefined) {
          alert('You have not provided touriste name at the time of registration. Please update the same in your settings.');
        } else if(response.isToursiteInactive == true) {
          alert('your toursite is inactive. Please make it active in your settings');
        } else if(response.user.isActive == false) {
          alert('your account is inactive. Tourgecko will verify and activate your account.');
        } else {
          $window.location.href = 'http://' + response.toursite + '.tourgecko.com:3000';
        }
      }).error(function (response) {
        vm.error = response.message;
      });
    };
  }
}());
