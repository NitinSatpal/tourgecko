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
    vm.numberOfItemsInOnePage = '10';
    vm.currentPageNumber = 1;
    vm.pageFrom = 0;
    vm.showAtLast = true;
    vm.tourEditInitiated = false;
    var changedProductStatus = [];
    var changedProductIds = [];
    var totalProductRecords;
    var paginationWindow;
    if ($window.innerWidth > 767)
      paginationWindow = 5;
    else
      paginationWindow = 3;

    // vm.products = CompanyProductService.query();
    $http.get('/api/host/companyproducts/').success(function (response) {
        vm.products = response.productArray;
        vm.totalPages = Math.ceil(response.productCount/10);
        if(vm.totalPages <= paginationWindow)
            vm.pageTo = vm.totalPages;
        else
            vm.pageTo = paginationWindow;
        vm.pageCounterArray = new Array(vm.totalPages);
        totalProductRecords = response.productCount;
    }).error(function (response) {
        vm.error = response.message;
    });

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
        changeProductVisibility();
    }

    function changeProductVisibility () {
        if (changedProductStatus.length > 0 ) {
            $http.post('/api/host/productVisibility/', {changedIds: changedProductIds, changedStatus: changedProductStatus}).success(function (response) {
                changedProductStatus.length = 0;
            }).error(function (response) {
                vm.error = response.message;
            });
        }
    }
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
            var key = product._id;
            var mappingObject = {};
            mappingObject[key] = product.isPublished;
            changedProductStatus.push(mappingObject);
            changedProductIds.push(product._id);
            alert('Please make sure all the details are correct. Tours with more details are booked more often');
    	} else {
    		// In case host is trying to make the tour invisible. Just give the info of what will happen with this
    		// and ask for confirmation

    		//For now i m making it invisible without asking for confirmation.
            var key = product._id;
            var mappingObject = {};
            mappingObject[key] = product.isPublished;
            changedProductStatus.push(mappingObject);
            changedProductIds.push(product._id);
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
    
    vm.changeItemsPerPage = function (itemsPerPage) {
        changeProductVisibility();
        vm.totalPages = Math.ceil(totalProductRecords / parseInt(itemsPerPage));
        vm.pageCounterArray = new Array(vm.totalPages);
        $http.get('/api/host/companyproductsForCurrentPage/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
            vm.products = response;
            $('html, body').scrollTop(0);
        }).error(function (response) {
            vm.error = response.message;
        }); 
    }

    vm.changePageNumber = function (clickedIndex) {
        if (vm.currentPageNumber == clickedIndex + 1)
            return;
        changeProductVisibility();
        vm.currentPageNumber = clickedIndex + 1;
        if (vm.currentPageNumber == vm.pageCounterArray.length) {
          vm.showAtLast = false;
          vm.pageTo = vm.currentPageNumber;
          if (vm.pageCounterArray.length >= paginationWindow)
            vm.pageFrom =   Math.ceil((vm.pageTo - paginationWindow) / paginationWindow) * paginationWindow;
          else
            vm.pageFrom = 0;
        }

        if(vm.currentPageNumber == 1) {
          vm.showAtLast = true;
          vm.pageFrom = 0
          if (vm.pageCounterArray.length >= paginationWindow)
            vm.pageTo = paginationWindow;
          else
            vm.pageTo = vm.pageCounterArray.length;
        }

        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        $http.get('/api/host/companyproductsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.products = response;
            $('html, body').scrollTop(0);
        }).error(function (response) {
            vm.error = response.message;
        }); 
    }

    var isWindowSizeReached = false;
    var windowSizeIncremented = false;
    vm.incrementPageNumber = function () {
        if (vm.currentPageNumber == vm.totalPages)
            return;
        changeProductVisibility();
        // If we are at multiple of 5 or crossed the first multiple of 5, handle things differently
        if (vm.currentPageNumber % paginationWindow == 0 || isWindowSizeReached) {
          isWindowSizeReached = true;

          // if we ar at multiple of 5 page number, then set off the variable to enter in the nect if loop
          if (vm.currentPageNumber % paginationWindow == 0)
            windowSizeIncremented = false;

          // increment the page number
          vm.currentPageNumber = vm.currentPageNumber + 1;

          // if we are not in last window and the window is not changed, go inside.
          if (vm.showAtLast && !windowSizeIncremented) {
            // if we are two pages short of total pages, change the '....' to the starting side and set the from and to limits From: -4 here
            if (vm.currentPageNumber + 1 == vm.pageCounterArray.length) {
              vm.showAtLast = false;
              vm.pageFrom = vm.currentPageNumber - paginationWindow - 1;
              vm.pageTo = vm.currentPageNumber + 1;
            } else {
              // if we are not two pages short of total pages, just set the from and to limits From : -5 here
              vm.pageFrom = vm.currentPageNumber - paginationWindow;
              vm.pageTo = vm.currentPageNumber;
            }
          }
        } else {
          // If we are not at multiple of 5 or never crossed the first multiple of 5, just increment the page number
          vm.currentPageNumber = vm.currentPageNumber + 1;
        }

        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        $http.get('/api/host/companyproductsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.products = response;
            $('html, body').scrollTop(0);
        }).error(function (response) {
            vm.error = response.message;
        });
    }

    vm.incrementWindowSize = function () {
        if (vm.currentPageNumber == vm.totalPages || vm.pageTo == vm.pageCounterArray.length)
            return;
        changeProductVisibility();
        windowSizeIncremented = true;
        if (Math.ceil(vm.currentPageNumber / paginationWindow) * paginationWindow + paginationWindow <= vm.pageCounterArray.length) {
            vm.pageFrom = Math.ceil(vm.currentPageNumber / paginationWindow) * paginationWindow;
            vm.pageTo = vm.pageFrom + paginationWindow;
            vm.showAtLast = true;
        } else {
            if (Math.ceil(vm.currentPageNumber / paginationWindow) * paginationWindow <= vm.pageCounterArray.length) {
                vm.pageFrom = Math.ceil(vm.currentPageNumber / paginationWindow) * paginationWindow;
                vm.pageTo = vm.pageCounterArray.length;
                vm.showAtLast = false;
            } else {
                vm.pageFrom = vm.currentPageNumber;
                vm.pageTo = vm.pageCounterArray.length;
                vm.showAtLast = false;
            }
        }

        vm.currentPageNumber = vm.pageFrom + 1;
        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        $http.get('/api/host/companyproductsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.products = response;
            $('html, body').scrollTop(0);
        }).error(function (response) {
            vm.error = response.message;
        });
    }

    vm.decrementPageNumber = function () {
        if (vm.currentPageNumber == 1)
            return;
        changeProductVisibility();
        vm.currentPageNumber = vm.currentPageNumber - 1;
        if (!vm.showAtLast) {
            var lastMultipleOfFive =  Math.ceil((vm.pageCounterArray.length - paginationWindow) / paginationWindow) * paginationWindow;
            if (vm.currentPageNumber == lastMultipleOfFive)
              vm.showAtLast = true;
        }

        if (vm.currentPageNumber % paginationWindow == 0) {
            vm.pageFrom = vm.currentPageNumber - paginationWindow;
            vm.pageTo = vm.currentPageNumber;
        }
        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        $http.get('/api/host/companyproductsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.products = response;
            $('html, body').scrollTop(0);
        }).error(function (response) {
            vm.error = response.message;
        });
    }

    vm.decrementWindowSize = function () {
        if (vm.currentPageNumber == 1 || vm.pageFrom == 0)
            return;
        changeProductVisibility();
        if (Math.ceil((vm.currentPageNumber - paginationWindow) / paginationWindow) * paginationWindow > 0) {
            vm.pageTo = Math.ceil((vm.currentPageNumber - paginationWindow) / paginationWindow) * paginationWindow;
            vm.pageFrom = vm.pageTo - paginationWindow;
            vm.showAtLast = true;
        } else {
            if (vm.pageCounterArray.length >= paginationWindow) {
                vm.pageFrom = 0;
                vm.pageTo = paginationWindow;
                vm.showAtLast = true;
            } else {
                vm.pageFrom = 0;
                vm.pageTo = vm.pageCounterArray.length;
                vm.showAtLast = true;
            }
        }

        vm.currentPageNumber = vm.pageTo;
        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        $http.get('/api/host/companyproductsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.products = response;
            $('html, body').scrollTop(0);
        }).error(function (response) {
            vm.error = response.message;
        });
    }

    vm.showTourPreview = function(index) {
        changeProductVisibility();
        $window.open($state.href('hostAndGuest.tourPreview', {productId: vm.products[index]._id}),'_blank','heigth=600,width=600');
    }

    vm.editTourDetails = function(index) {
        vm.tourEditInitiated = true;
        $('#tourgeckoBody').addClass('disableBody');
        changeProductVisibility();
        // $window.localStorage.setItem('productEditId', vm.products[index]._id);
        //$state.go('host.editProduct', {productId: vm.products[index]._id});
    }

    vm.getLoaderPositionForTourEdit = function () {
      var leftMargin = ($('#tourlist-row-content').width() - 34.297) / 2;
      var topMargin = ($window.innerHeight - 40) / 2.5;
      var cssObject = {
        "left" : leftMargin,
        "top" : topMargin,
        "color": '#ff9800'
      }
      return cssObject;
    }

    vm.tweetTheProduct = function () {
        changeProductVisibility();
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
        changeProductVisibility();
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
