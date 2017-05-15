(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('ToursiteController', ToursiteController);

  ToursiteController.$inject = ['$scope', '$state', '$stateParams', '$http' , '$window', '$location', 'toasty'];

  function ToursiteController($scope, $state, $stateParams, $http, $window, $location, toasty) {
    var vm = this;
    vm.numberOfItemsInOnePage = '10';
    vm.currentPageNumber = 1;
    vm.pageFrom = 0;
    vm.showAtLast = true;

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    var totalToursiteRecords;
    
    if ($window.innerWidth > 767) {
      vm.paginationWindow = 5;
      scrollTo = 580;
    }
    else {
      vm.paginationWindow = 3;
      scrollTo = 583;
    }

    $http.get('/api/host/toursitedata/' + $stateParams.toursite).success(function (response) {
        vm.toursitedata = response.productArray;
        vm.companyData = response.companyData;
        console.log(JSON.stringify(vm.toursitedata));
        if (response.productArray.length > 0)
          vm.userData = response.productArray[0].user;

        vm.totalPages = Math.ceil(response.productCount / 10);
        if(vm.totalPages <= vm.paginationWindow)
          vm.pageTo = vm.totalPages;
        else
          vm.pageTo = vm.paginationWindow;

        vm.pageCounterArray = new Array(vm.totalPages);
        totalToursiteRecords = response.productCount;
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
          if ((vm.pageFrom + vm.paginationWindow) <= vm.totalPages)
            vm.pageTo = vm.pageFrom + vm.paginationWindow;
          else
            vm.pageTo = vm.totalPages;
          if (vm.pageTo + 1 < vm.totalPages)
            vm.showAtLast = true;
          else
            vm.showAtLast = false;
        }
        if (vm.pageFrom == 0)
          vm.showAtLast = true;
        if(vm.pageTo == vm.totalPages)
          vm.showAtLast = false;
    }).error(function (response) {
      vm.error = response.message;
    });

    vm.changeItemsPerPage = function (itemsPerPage) {
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        vm.totalPages = Math.ceil(totalToursiteRecords / parseInt(itemsPerPage));
        vm.pageCounterArray = new Array(vm.totalPages);

        // This will only be possible if user is changing items per page from lestt to more
        if(vm.currentPageNumber > vm.totalPages) {
          vm.currentPageNumber = vm.totalPages;
          vm.showAtLast = false;
          vm.pageTo = vm.currentPageNumber;
          if(vm.pageTo - vm.paginationWindow >= 0)
            vm.pageFrom = vm.pageTo - vm.paginationWindow;
        } else {
          if ((vm.currentPageNumber - vm.paginationWindow) > 0 )
            vm.pageFrom = Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
          else
            vm.pageFrom = 0;

          if(vm.pageFrom + vm.paginationWindow <= vm.totalPages)
            vm.pageTo = vm.pageFrom + vm.paginationWindow;
          else
            vm.pageTo = vm.totalPages;
          if (vm.pageTo + 1 < vm.totalPages)
            vm.showAtLast = true;
          else
            vm.showAtLast = false;
        }
        if (vm.pageFrom == 0)
          vm.showAtLast = true;
        if(vm.pageTo == vm.totalPages)
          vm.showAtLast = false;
        
        $http.get('/api/host/toursitedataForCurrentPage/' + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
          vm.toursitedata = response.productArray;
          vm.companyData = response.companyData;
          if (response.productArray.length > 0)
            vm.userData = response.productArray[0].user;
          $('html, body').scrollTop(scrollTo);
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
          vm.error = response.message;
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        });
    }

    vm.changePageNumber = function (clickedIndex) {
        if (vm.currentPageNumber == clickedIndex + 1) {
          $('html, body').scrollTop(scrollTo);
          return;
        }
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
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

        if (vm.pageFrom == 0)
          vm.showAtLast = true;
        if(vm.pageTo == vm.totalPages)
          vm.showAtLast = false;

        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        $http.get('/api/host/toursitedataForCurrentPage/'  + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
          vm.toursitedata = response.productArray;
          vm.companyData = response.companyData;
          if (response.productArray.length > 0)
            vm.userData = response.productArray[0].user;
          $('html, body').scrollTop(scrollTo);
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
          vm.error = response.message;
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        });
        
    }

    var isWindowSizeReached = false;
    var windowSizeIncremented = false;
    vm.incrementPageNumber = function () {

        // if we are at last page number then just return
        if (vm.currentPageNumber == vm.totalPages)
            return;

        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
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

        if (vm.pageFrom == 0)
          vm.showAtLast = true;
        if(vm.pageTo == vm.totalPages)
          vm.showAtLast = false;

        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        $http.get('/api/host/toursitedataForCurrentPage/'  + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
          vm.toursitedata = response.productArray;
          vm.companyData = response.companyData;
          if (response.productArray.length > 0)
            vm.userData = response.productArray[0].user;
          $('html, body').scrollTop(scrollTo);
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
          vm.error = response.message;
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        });
    }

    vm.incrementWindowSize = function () {
      if (vm.currentPageNumber == vm.totalPages || vm.pageTo == vm.pageCounterArray.length)
        return;
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
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
      if (vm.pageFrom == 0)
        vm.showAtLast = true;
      if(vm.pageTo == vm.totalPages)
        vm.showAtLast = false;

      vm.currentPageNumber = vm.pageFrom + 1;
      var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
      $http.get('/api/host/toursitedataForCurrentPage/'  + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
        vm.toursitedata = response.productArray;
        vm.companyData = response.companyData;
        if (response.productArray.length > 0)
          vm.userData = response.productArray[0].user;
        $('html, body').scrollTop(scrollTo);
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }

    vm.decrementPageNumber = function () {
      if (vm.currentPageNumber == 1)
          return;
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

      if (vm.pageFrom == 0)
        vm.showAtLast = true;
      if(vm.pageTo == vm.totalPages)
        vm.showAtLast = false;
      var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
      $http.get('/api/host/toursitedataForCurrentPage/'  + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
        vm.toursitedata = response.productArray;
        vm.companyData = response.companyData;
        if (response.productArray.length > 0)
          vm.userData = response.productArray[0].user;
        $('html, body').scrollTop (scrollTo);
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }

    vm.decrementWindowSize = function () {
      if (vm.currentPageNumber == 1 || vm.pageFrom == 0)
        return;
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      
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

      if (vm.pageFrom == 0)
        vm.showAtLast = true;
      if(vm.pageTo == vm.totalPages)
        vm.showAtLast = false;
      vm.currentPageNumber = vm.pageTo;
      var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
      $http.get('/api/host/toursitedataForCurrentPage/'  + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
        vm.toursitedata = response.productArray;
        vm.companyData = response.companyData;
        if (response.productArray.length > 0)
          vm.userData = response.productArray[0].user;
        $('html, body').scrollTop(scrollTo);
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }

    vm.getInquiryHours = function () {
      if (vm.companyData) {
        if (vm.companyData.inquiryTime == 'Anytime')
          return '(24 hours)';
        else
          return '(' + vm.companyData.inquiryTimeRangeFrom + ' ' + vm.companyData.inquiryTimeRangeTo + ')';
      }
    }

    vm.getProductTitleToshow = function (title) {
      if (title.length > 25)
        return title.slice(0,25) + ' ...';
      else
        return title;
    }

    vm.getProductDestinationToshow = function (destination) {
      if (destination.length > 25)
        return destination.slice(0,20) + ' ...';
      else
        return destination;
    }

    vm.getDepartureDateToShow = function (index) {
      if (vm.toursitedata[index].productAvailabilityType == 'Open Date')
        return 'Open';
      else {
        var displayDate = '';
        if (vm.toursitedata[index].productScheduledDates[0]) {
          var eventDate = new Date(vm.toursitedata[index].productScheduledDates[0]);

          displayDate = eventDate.getDate() + ' ' + months[eventDate.getMonth()] + ' ' + eventDate.getFullYear();
        } else
          displayDate = 'Not Available Currently';
        if (vm.toursitedata[index].productScheduledDates.length > 1) {
          var numberOfTours = vm.toursitedata[index].productScheduledDates.length - 1;
          var remainingDatesString;
          if (numberOfTours == 1)
            remainingDatesString = numberOfTours + ' more date';
          else
            remainingDatesString = numberOfTours + ' more dates';
          var tourDepartureString = ' and '  + remainingDatesString;
          return displayDate + tourDepartureString;
        }
        else
          return displayDate;
      }
    }
    
    vm.getStartingFromPrice =function (index) {
      if (vm.toursitedata[index].productAdvertisedprice)
        return vm.toursitedata[index].productAdvertisedprice;
      else
        return findMinimum(vm.toursitedata[index].productPricingOptions, index);
    }

    function findMinimum (pricingOptions, index) {
      var minimumTillNow = Number.POSITIVE_INFINITY;
      vm.priceTobeShown = -1;
      for (var index = 0; index < pricingOptions.length; index ++) {
        if (pricingOptions[index].price < minimumTillNow)
          minimumTillNow = pricingOptions[index].price;
        if(vm.priceTobeShown == -1) {
          if (pricingOptions[index].pricingType == 'Everyone' || pricingOptions[index].pricingType == 'Adult')
            vm.priceTobeShown = pricingOptions[index].price;
        }
      }
      if (minimumTillNow == 'Infinity')
        minimumTillNow = '';
      if (vm.priceTobeShown == -1)
        vm.priceTobeShown = minimumTillNow;

      vm.minimumTillNow = minimumTillNow;
      return minimumTillNow;
    }

    vm.getConditionalCSS = function (index) {
      
      if (vm.toursitedata.length % 2 == 1 && window.innerWidth > 767 && index == vm.toursitedata.length - 1) {
        var alignLeft = {
          'margin-left' : '0px'
        }
        return alignLeft;
      }
    }

    vm.getDynamicCSSForToursiteNav = function () {
      if(window.innerWidth > 767)
        return 'nav-toursite';
    }

    vm.getDynamicLeftMarginForCompanyLogo = function () {
      var leftMargin = ($window.innerWidth - 70) / 2 - 60 -15;
      var cssObject = {
        "margin-left" : leftMargin
      }
      if(window.innerWidth <= 767)
        return cssObject;
    }

    vm.goToHostSocialSite = function (socialSite) {
      console.log(vm.companyData.hostSocialAccounts);
      if (socialSite == 'facebook') {
        if (vm.companyData.hostSocialAccounts.facebook && vm.companyData.hostSocialAccounts.facebook != "")
          $window.location = 'https://www.facebook.com/' + vm.companyData.hostSocialAccounts.facebook;
        else {
          toasty.error({
            title: 'Not available!',
            msg: 'Host has not provided Facebook details!',
            sound: false
          });
        }

      } else if (socialSite == 'twitter') {
        if (vm.companyData.hostSocialAccounts.twitter && vm.companyData.hostSocialAccounts.twitter != "")
          $window.location = 'https://www.twitter.com/' + vm.companyData.hostSocialAccounts.twitter;
        else {
          toasty.error({
            title: 'Not available!',
            msg: 'Host has not provided Twitter details!',
            sound: false
          });
        }
      } else {
        if (vm.companyData.hostSocialAccounts.instagram && vm.companyData.hostSocialAccounts.instagram != "")
          $window.location = 'https://www.instagram.com/' + vm.companyData.hostSocialAccounts.instagram;
        else {
          toasty.error({
            title: 'Not available!',
            msg: 'Host has not provided Instagram details!',
            sound: false
          });
        }

      }
    }

    vm.goToProductDetailsPage = function (index) {
      $state.go('guest.tourDetails', {productId: vm.toursitedata[index]._id});
    }
  }
}());
