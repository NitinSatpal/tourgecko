
(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('sidenavController', sidenavController);

  sidenavController.$inject = ['$scope', '$state', '$rootScope', '$window', '$http', '$location', 'Authentication'];

  function sidenavController($scope, $state, $rootScope, $window, $http, $location, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
    
    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    // This is safe side addition. Actually not required here as use will be redirected by url change and not state change
    $('#tourgeckoBody').removeClass('disableBody');

    function stateChangeSuccess() {
        if ($location.path().split('/')[2] != 'settings') {
          if ($("#parentMenu").hasClass("toggle"))
            $("#parentMenu").removeClass("toggle");
        } else {
            $("#parentMenu .sub-menu").find(".active").removeClass("active");
            $('#' + $location.path().split('/')[3] + 'Setting').addClass('active');
        }
    }

    $http.get('/api/host/booking/status/count/' + 'All').success(function (response) {
      vm.pendingBookingCount = response;
    }).error(function (response) {
      vm.error = response.message;
    });

    setInterval(function () {
      $http.get('/api/host/booking/status/count/' + 'All').success(function (response) {
        vm.pendingBookingCount = response;
      }).error(function (response) {
        vm.error = response.message;
      });
    }, 60000);
    

    vm.goToHostWebsite = function() {
      $http.get('/api/host/toursite').success(function (response) {
        if (response.toursite === null || response.toursite === '' || response.toursite === undefined) {
          alert('You have not provided touriste name at the time of registration. Please update the same in your settings.');
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        } else if(response.isToursiteInactive == true) {
          alert('your toursite is inactive. Please make it active in your settings');
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        } else if(response.user.isActive == false) {
          alert('your account is inactive. Tourgecko will verify and activate your account.');
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        } else {
          $window.location.href = $window.location.protocol + '//' + response.toursite + '.' + $window.location.host;
        }
      }).error(function (response) {
        vm.error = response.message;
      });
    };
  }
}());
