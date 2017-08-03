(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourListController', TourListController);

  TourListController.$inject = ['$scope', '$state', '$window', '$http', '$timeout', '$interval', 'Authentication', 'CompanyProductService'];

  function TourListController($scope, $state, $window, $http, $timeout, $interval, Authentication, CompanyProductService) {
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
    if ($window.innerWidth > 767)
      vm.paginationWindow = 5;
    else
      vm.paginationWindow = 3;

    // vm.products = CompanyProductService.query();

    var prevPageNumber = $window.localStorage.getItem('previousPageNumber');
    var prevItemPerPage = $window.localStorage.getItem('previousItemsPerPage');

    if((prevPageNumber != null && prevItemPerPage != null) && (prevPageNumber != 'noPreviousPageNumber' && prevItemPerPage != 'noPreviousItemsPerPage') && (prevPageNumber != undefined && prevItemPerPage != undefined)) {
        $http.get('/api/host/companyproductsForCurrentPageAfterEdit/' + prevPageNumber +'/' + parseInt(prevItemPerPage)).success(function (response) {
            vm.products = response.productArray;
            vm.totalPages = Math.ceil(response.productCount / prevItemPerPage);
            vm.pageCounterArray = new Array(vm.totalPages);
            $('html, body').scrollTop(0);
            $window.localStorage.setItem('previousPageNumber', 'noPreviousPageNumber');
            $window.localStorage.setItem('previousItemsPerPage', 'noPreviousItemsPerPage');
            if ((prevPageNumber - vm.paginationWindow) > 0)
                vm.pageFrom =   Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
            else
                vm.pageFrom = 0;
            if ((vm.pageFrom + vm.paginationWindow) <= vm.totalPages)
                vm.pageTo = vm.pageFrom + vm.paginationWindow;
            else
                vm.pageTo = vm.totalPages;
            vm.currentPageNumber = prevPageNumber;
            vm.numberOfItemsInOnePage = prevItemPerPage;
            if (vm.pageTo < vm.totalPages - 1)
                vm.showAtLast = false;
            else
                vm.showAtLast = true;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }); 
    } else {
        if(prevItemPerPage != null && prevItemPerPage !== undefined && prevItemPerPage != 'noPreviousItemsPerPage')
            vm.numberOfItemsInOnePage = prevItemPerPage;
        $http.get('/api/host/allCompanyproducts/' + vm.numberOfItemsInOnePage).success(function (response) {
            vm.products = response.productArray;
            vm.totalPages = Math.ceil(response.productCount / vm.numberOfItemsInOnePage);
            if(vm.totalPages <= vm.paginationWindow)
                vm.pageTo = vm.totalPages;
            else
                vm.pageTo = vm.paginationWindow;
            vm.pageCounterArray = new Array(vm.totalPages);
            totalProductRecords = response.productCount;
            vm.pageFrom = 0;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        });
    }
    
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
            var key = product._id;
            var mappingObject = {};
            mappingObject[key] = product.isPublished;
            changedProductStatus.push(mappingObject);
            changedProductIds.push(product._id);
            changeProductVisibility();
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
            changeProductVisibility();
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
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        changeProductVisibility();
        vm.totalPages = Math.ceil(totalProductRecords / parseInt(itemsPerPage));
        vm.pageCounterArray = new Array(vm.totalPages);
        $window.localStorage.setItem('previousItemsPerPage', itemsPerPage);
        // This will only be possible if user is changing items per page from lestt to more
        if(vm.currentPageNumber > vm.totalPages) {
          vm.currentPageNumber = vm.totalPages;
          vm.showAtLast = false;
          vm.pageTo = vm.currentPageNumber;
          if(vm.pageTo - vm.paginationWindow >= 0)
            vm.pageFrom = vm.pageTo - vm.paginationWindow;
        } else {
            if ((vm.currentPageNumber - vm.paginationWindow) > 0)
                vm.pageFrom = Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
            else
                vm.pageFrom = 0;
            if (vm.pageFrom + vm.paginationWindow <=vm.totalPages)
                vm.pageTo = vm.pageFrom + vm.paginationWindow;
            else
                vm.pageTo = vm.totalPages
            if (vm.pageTo + 1 < vm.totalPages)
                vm.showAtLast = true;
            else
                vm.showAtLast = false;
        }
        $http.get('/api/host/companyproductsForCurrentPage/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
            vm.products = response;
            $('html, body').scrollTop(0);
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
        }); 
    }

    vm.changePageNumber = function (clickedIndex) {
        if (vm.currentPageNumber == clickedIndex + 1) {
          $('html, body').scrollTop(0);
          return;
        }
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        changeProductVisibility();
        vm.currentPageNumber = clickedIndex + 1;
        if (vm.currentPageNumber == vm.pageCounterArray.length) {
          vm.showAtLast = false;
          vm.pageTo = vm.currentPageNumber;
          if (vm.pageCounterArray.length >= vm.paginationWindow)
            vm.pageFrom = Math.ceil((vm.pageTo - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
          else
            vm.pageFrom = 0;
        }

        if(vm.currentPageNumber == 1) {
          vm.showAtLast = true;
          vm.pageFrom = 0
          if (vm.pageCounterArray.length >= vm.paginationWindow)
            vm.pageTo = vm.paginationWindow;
          else
            vm.pageTo = vm.pageCounterArray.length;
        }

        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        $http.get('/api/host/companyproductsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.products = response;
            $('html, body').scrollTop(0);
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
        }); 
    }

    var isWindowSizeReached = false;
    var windowSizeIncremented = false;
    vm.incrementPageNumber = function () {
        if (vm.currentPageNumber == vm.totalPages)
            return;
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        changeProductVisibility();
        // If we are at multiple of 5 or crossed the first multiple of 5, handle things differently
        if (vm.currentPageNumber % vm.paginationWindow == 0 || isWindowSizeReached) {
          isWindowSizeReached = true;

          // if we ar at multiple of 5 page number, then set off the variable to enter in the nect if loop
          if (vm.currentPageNumber % vm.paginationWindow == 0)
            windowSizeIncremented = false;

          // increment the page number
          vm.currentPageNumber = vm.currentPageNumber + 1;

          // if we are not in last window and the window is not changed, go inside.
          if (vm.showAtLast && !windowSizeIncremented) {
            // if we are two pages short of total pages, change the '....' to the starting side and set the from and to limits From: -4 here
            if (vm.currentPageNumber + 1 == vm.pageCounterArray.length) {
              vm.showAtLast = false;
              vm.pageFrom = vm.currentPageNumber - vm.paginationWindow - 1;
              vm.pageTo = vm.currentPageNumber + 1;
            } else {
              // if we are not two pages short of total pages, just set the from and to limits From : -5 here
              vm.pageFrom = vm.currentPageNumber - vm.paginationWindow;
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
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
        });
    }

    vm.incrementWindowSize = function () {
        if (vm.currentPageNumber == vm.totalPages || vm.pageTo == vm.pageCounterArray.length)
            return;
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        changeProductVisibility();
        windowSizeIncremented = true;
        if (Math.ceil(vm.currentPageNumber / vm.paginationWindow) * vm.paginationWindow + vm.paginationWindow <= vm.pageCounterArray.length) {
            vm.pageFrom = Math.ceil(vm.currentPageNumber / vm.paginationWindow) * vm.paginationWindow;
            vm.pageTo = vm.pageFrom + vm.paginationWindow;
            vm.showAtLast = true;
        } else {
            if (Math.ceil(vm.currentPageNumber / vm.paginationWindow) * vm.paginationWindow <= vm.pageCounterArray.length) {
                vm.pageFrom = Math.ceil(vm.currentPageNumber / vm.paginationWindow) * vm.paginationWindow;
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
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
        });
    }

    vm.decrementPageNumber = function () {
        if (vm.currentPageNumber == 1)
            return;
        changeProductVisibility();
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        vm.currentPageNumber = vm.currentPageNumber - 1;
        if (!vm.showAtLast) {
            var lastMultipleOfFive =  Math.ceil((vm.pageCounterArray.length - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
            if (vm.currentPageNumber == lastMultipleOfFive)
              vm.showAtLast = true;
        }

        if (vm.currentPageNumber % vm.paginationWindow == 0) {
            vm.pageFrom = vm.currentPageNumber - vm.paginationWindow;
            vm.pageTo = vm.currentPageNumber;
        }
        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        $http.get('/api/host/companyproductsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.products = response;
            $('html, body').scrollTop(0);
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
        });
    }

    vm.decrementWindowSize = function () {
        if (vm.currentPageNumber == 1 || vm.pageFrom == 0)
            return;
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        changeProductVisibility();
        if (Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow > 0) {
            vm.pageTo = Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
            vm.pageFrom = vm.pageTo - vm.paginationWindow;
            vm.showAtLast = true;
        } else {
            if (vm.pageCounterArray.length >= vm.paginationWindow) {
                vm.pageFrom = 0;
                vm.pageTo = vm.paginationWindow;
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
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
        });
    }

    vm.showTourPreview = function(index) {
        changeProductVisibility();
        var winPreview = $window.open($state.href('hostAndGuest.tourPreview', {productId: vm.products[index]._id}),'_blank','heigth=600,width=600');
        winPreview.document.body.innerHTML = "<div style='position:fixed;top:45%;left:46%;width:100%;height:100%;background-color:transparent;color:#40C4FF;font-size:20px;z-index: 9999 !important;pointer-events: none;filter: alpha(opacity=40);'>Please wait ...</div>"
    }

    vm.editTourDetails = function(index) {
        $('#loadingDivTourList').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        changeProductVisibility();
        // $window.localStorage.setItem('productEditId', vm.products[index]._id);
        $window.localStorage.setItem('previousPageNumber', vm.currentPageNumber);
        $window.localStorage.setItem('previousItemsPerPage', vm.numberOfItemsInOnePage);
        $state.go('host.editProduct', {productId: vm.products[index]._id});
    }

    vm.getLoaderPositionForTourEdit = function () {
        var leftMargin; 
        if($window.innerWidth > 767)
            leftMargin = ($('#tourlist-row-content').width() - 34.297) / 2;
        else
            leftMargin = ($window.innerWidth - 34.297) / 2;
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
        var longURL = 'http://tourgecko.com:3000/tour/' + vm.products[vm.index]._id;
        $http.get('/api/social/host/shortenURL/?longURL=' + longURL).success(function (response) {
            tweet = tweet + response + '%0A';
            $window.open("http://twitter.com/share?text="+tweet+"&via=tourgecko&hashtags=''&url=''");
        }).error(function (response) {
            vm.error = response.message;
        });
    }
    vm.postTheProductOnFB = function () {
        changeProductVisibility();
        $http.get('/api/social/host/facebook/pages').success(function (response) {
            if (response == 'not connected') {
                $scope.askForAuthentication = "/api/auth/facebook";
            } else {
                return "";
            }
        }).error(function (response) {
            vm.error = response.message;
        });
    }
    vm.shareTheProductOnWhatsapp = function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            var longURL = 'http://tourgecko.com:3000/tour/' + vm.products[vm.index]._id;
            $http.get('/api/social/host/shortenURL/?longURL=' + longURL).success(function (response) {
                var tourName = vm.products[vm.index].productTitle;
                var tourDestination = vm.products[vm.index].destination;
                var url = response;
                var message = encodeURIComponent(tourName) + '%0A' + encodeURIComponent(tourDestination) + '%0A%0A' + encodeURIComponent(url);
                var whatsapp_url = "whatsapp://send?text=" + message;
                window.location.href = whatsapp_url;    
            }).error(function (response) {
                vm.error = response.message;
            });
        } else {
           alert("Please use a Mobile Device to Share data on whatsapp");
        }
        changeProductVisibility();
    }

  }
}());
