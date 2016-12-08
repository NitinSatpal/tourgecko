(function () {
  'use strict';

  angular
    .module('core')
    .controller('FooterController', FooterController);

  FooterController.$inject = ['$scope', '$state', '$location', 'Authentication', 'menuService'];

  function FooterController($scope, $state, $location, Authentication, menuService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.hideSideNav = false;
    var hideSideNavHere = new Set();
    hideSideNavHere.add('/host/login');
    hideSideNavHere.add('/host/signup');
    hideSideNavHere.add('/host/tourdetails');
    
    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      	if(hideSideNavHere.has($location.path()))
           	vm.hideSideNav = true;
        else
        	vm.hideSideNav = false;
    }


  }
}());