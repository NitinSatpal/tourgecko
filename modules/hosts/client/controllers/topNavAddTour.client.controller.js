(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TopNavAddTourController', TopNavAddTourController)

  TopNavAddTourController.$inject = ['$state', '$scope', '$window', '$timeout'];

  function TopNavAddTourController($state, $scope, $window, $timeout) {
    var vm = this;
    /* ------------------------------------------------------------------------------------------------------------------------- */    
    	/* This function handles the button click of add tour */
	/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.goToTourCreationPage = function() {
      	if (vm.productType == '' || vm.productType == null) {
        	alert('please select at least one type for the tour');
        	return false;
      	}
      	$('#loadingDivHostSide').css('display', 'block');
		$('#tourgeckoBody').addClass('waitCursor');
      	$('#select-tour-type').slideUp('slow');
      	$timeout(function () {
        	$('.modal-backdrop').remove();
        	$state.go('host.addProduct');
      	}, 800);
      	$window.localStorage.setItem('productType', vm.productType);
    }
	/* ------------------------------------------------------------------------------------------------------------------------- */    
	    /* This function handles the button click of add tour, ends here */
	/* ------------------------------------------------------------------------------------------------------------------------- */
  }
}());
