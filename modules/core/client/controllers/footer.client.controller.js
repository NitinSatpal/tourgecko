(function () {
  'use strict';

  angular
    .module('core')
    .controller('FooterController', FooterController);

  FooterController.$inject = ['$scope', '$state', '$location', 'Authentication', 'menuService'];

  function FooterController($scope, $state, $location, Authentication, menuService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.hideFooter = false;
    var hideFooterHere = new Set();
    hideFooterHere.add('/host/tourdetails');
    
    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      	if(hideFooterHere.has($location.path()))
           	vm.hideFooter = true;
        else
        	vm.hideFooter = false;
    }
  }
}());