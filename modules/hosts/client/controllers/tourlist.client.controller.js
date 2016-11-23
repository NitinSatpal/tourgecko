(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourListController', TourListController);

  TourListController.$inject = ['$scope', '$state', '$window', '$http', 'Authentication', 'CompanyProductService'];

  function TourListController($scope, $state, $window, $http, Authentication, CompanyProductService) {
    var vm = this;
    vm.authentication = Authentication;

    vm.products = CompanyProductService.query();

    vm.checkThis = $window.localStorage.getItem('productId');
    

    vm.makeProductVisible = function (product) {
    	if (product.isPublished == true) {
    		// In case host trying to make the tour visible
    		/* if (product.isDraft == true) {
    			// Check if the tour is in draft stage. If yes then do not allow the host to change the visibility.
    			alert('This tour is in draft stage. Please complete the details first');
    			product.isVerified = false;
    		} else {
    			// If the tour is not in draft stage but ie yet to be verified by tourgecko. ASk host to wait while we verify
    			alert('This tour is not yet verified by tourgecko. We will notify you with the status shortly');
    			product.isVerified = false;
    		} */
            alert('Please make sure all the details are correct. Tours with more details are booked more often');
    	} else {
    		// In case host is trying to make the tour invisible. Just give the info of what will happen with this
    		// and ask for confirmation

    		//For now i m making it invisible without asking for confirmation.
    		alert('The tour will not be visible to guests and cannot be booked if you make it invisible');
    	}
    }

    vm.shareOnSocialAccount = function (account, product) {
        if (account == 'twitter') {
            $http.post('/api/social/host/twitter', product).success(function (response) {
                console.log(response);
            }).error(function (response) {
                vm.error = response.message;
            });
        } else if (account == 'facebook') {
            $http.post('/api/social/host/facebook', product).success(function (response) {
                console.log(response);
            }).error(function (response) {
                vm.error = response.message;
            });
        }
    }

    vm.showTourDetails = function(index) {
        $window.localStorage.setItem('productId', vm.products[index]._id);
        $window.open($state.href('host.tourDetails'),'_blank','heigth=600,width=600');
    }

  }
}());
