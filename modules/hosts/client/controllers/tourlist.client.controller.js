(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourListController', TourListController);

  TourListController.$inject = ['$scope', '$state', '$window', '$http', 'Authentication', 'CompanyProductService'];

  function TourListController($scope, $state, $window, $http, Authentication, CompanyProductService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.index = -1;
    $scope.askForAuthentication = "";

    vm.products = CompanyProductService.query();    

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

    /*  vm.shareOnSocialAccount = function (account, product) {
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
    }*/

    vm.showTourPreview = function(index) {
        $window.open($state.href('hostAndGuest.tourPreview', {productId: vm.products[index]._id}),'_blank','heigth=600,width=600');
    }

    vm.editTourDetails = function(index) {
        // $window.localStorage.setItem('productEditId', vm.products[index]._id);
        $state.go('host.editProduct', {productId: vm.products[index]._id});
    }

    vm.tweetTheProduct = function () {
        var tweet = vm.products[vm.index].productTitle + '%0A' + vm.products[vm.index].destination + '%0A';
        var longURL = 'http://tourgecko.com:3000/guest/tour/' + vm.products[vm.index]._id;
        $http.get('/api/social/host/shortenURL/?longURL=' + longURL).success(function (response) {
            tweet = tweet + response + '%0A';
            $window.open("http://twitter.com/share?text="+tweet+"&via=tourgecko&hashtags=''&url=''");
            //$('#askSocialSharingOptions').fadeOut('slow');
            //$('.modal-backdrop').remove();
        }).error(function (response) {
            vm.error = response.message;
        });
    }
    vm.postTheProductOnFB = function () {
        $http.get('/api/social/host/facebook/pages').success(function (response) {
            if (response == 'not connected') {
                console.log('i m here');
                $scope.askForAuthentication = "/api/auth/facebook";
            } else {
                return "";
            }
        }).error(function (response) {
            vm.error = response.message;
        });
    }
  }
}());
