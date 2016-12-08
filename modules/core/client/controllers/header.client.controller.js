(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', 'Authentication', '$location', 'menuService'];

  function HeaderController($scope, $state, Authentication, $location, menuService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.hideSideNav = false;
    var hideSideNavHere = new Set();
    hideSideNavHere.add('/host/login');
    hideSideNavHere.add('/host/signup');
    hideSideNavHere.add('/host/tourdetails');

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');
    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
      if(hideSideNavHere.has($location.path()))
        vm.hideSideNav = true;
      else
        vm.hideSideNav = false;
    }

    vm.goToHomePage = function() {
      if ($state.$current.url.source !== '/')
        $state.go('abstractHome');
    };
  }
}());