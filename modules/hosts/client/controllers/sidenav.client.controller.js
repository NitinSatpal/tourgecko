
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
    hideSideNavHere.add('/forbidden');
    hideSideNavHere.add('/security/privacypolicy');
    hideSideNavHere.add('/not-found');
    
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
        if(hideSideNavHere.has($location.path()) || $location.path().split('/')[3] == 'preview' || $location.path().split('/')[1] == 'guest')
          vm.hideSideNav = true;
        else
          vm.hideSideNav = false;
    }

    vm.goToHostWebsite = function() {
      var loaderElement = '<span class="loader-spinner-goToToursite" id="loaderForToursite"><i class="fa fa-refresh fa-spin"></i></span>';
      $('#host-section-Pages').append(loaderElement);
      $('#tourgeckoBody').addClass('disableBody');
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
