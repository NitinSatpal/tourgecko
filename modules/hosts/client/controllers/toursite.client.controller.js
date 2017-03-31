(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('ToursiteController', ToursiteController);

  ToursiteController.$inject = ['$scope', '$state', '$stateParams', '$http' , '$window'];

  function ToursiteController($scope, $state, $stateParams, $http, $window) {
    var vm = this;
    vm.numberOfItemsInOnePage = '20';
    vm.currentPageNumber = 1;
    vm.pageFrom = 0;
    vm.showAtLast = true;

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    var totalToursiteRecords;
    var paginationWindow;
    
    if ($window.innerWidth > 767) {
      paginationWindow = 5;
      scrollTo = 580;
    }
    else {
      paginationWindow = 3;
      scrollTo = 583;
    }

    $http.get('/api/host/toursitedata/' + $stateParams.toursite).success(function (response) {
        vm.toursitedata = response.productArray;
        vm.companyData = response.productArray[0].hostCompany;
        vm.userData = response.productArray[0].user;
        vm.totalPages = Math.ceil(response.productCount / 20);
        if(vm.totalPages <= paginationWindow)
          vm.pageTo = vm.totalPages;
        else
          vm.pageTo = paginationWindow;
        vm.pageCounterArray = new Array(vm.totalPages);
        totalToursiteRecords = response.productCount;     
    }).error(function (response) {
      vm.error = response.message;
    });


    vm.changeItemsPerPage = function (itemsPerPage) {
        vm.totalPages = Math.ceil(totalToursiteRecords / parseInt(itemsPerPage));
        vm.pageCounterArray = new Array(vm.totalPages);
        $http.get('/api/host/toursitedataForCurrentPage/' + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
          vm.toursitedata = response;
          vm.companyData = response[0].hostCompany;
          vm.userData = response[0].user;
          $('html, body').animate({scrollTop : scrollTo},800);
        }).error(function (response) {
          vm.error = response.message;
        });
        
    }

    vm.changePageNumber = function (clickedIndex) {
        if (vm.currentPageNumber == clickedIndex + 1)
            return;
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
        $http.get('/api/host/toursitedataForCurrentPage/'  + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
          vm.toursitedata = response;
          vm.companyData = response[0].hostCompany;
          vm.userData = response[0].user;
          $('html, body').animate({scrollTop : scrollTo},800);
        }).error(function (response) {
          vm.error = response.message;
        });
    }


    var isWindowSizeReached = false;
    var windowSizeIncremented = false;
    vm.incrementPageNumber = function () {

        // if we are at last page number then just return
        if (vm.currentPageNumber == vm.totalPages)
            return;

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
        $http.get('/api/host/toursitedataForCurrentPage/'  + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
          vm.toursitedata = response;
          vm.companyData = response[0].hostCompany;
          vm.userData = response[0].user;
          $('html, body').animate({scrollTop : scrollTo},800);
        }).error(function (response) {
          vm.error = response.message;
        });
    }

    vm.incrementWindowSize = function () {
      if (vm.currentPageNumber == vm.totalPages || vm.pageTo == vm.pageCounterArray.length)
        return;
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
      $http.get('/api/host/toursitedataForCurrentPage/'  + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
        vm.toursitedata = response;
        vm.companyData = response[0].hostCompany;
        vm.userData = response[0].user;
        $('html, body').animate({scrollTop : scrollTo},800);
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    vm.decrementPageNumber = function () {
      if (vm.currentPageNumber == 1)
          return;
      
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
      $http.get('/api/host/toursitedataForCurrentPage/'  + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
        vm.toursitedata = response;
        vm.companyData = response[0].hostCompany;
        vm.userData = response[0].user;
        $('html, body').animate({scrollTop : scrollTo},800);
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    vm.decrementWindowSize = function () {
      if (vm.currentPageNumber == 1 || vm.pageFrom == 0)
        return;
      
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
      $http.get('/api/host/toursitedataForCurrentPage/'  + $stateParams.toursite + '/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
        vm.toursitedata = response;
        vm.companyData = response[0].hostCompany;
        vm.userData = response[0].user;
        $('html, body').animate({scrollTop : scrollTo},800);
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    vm.getInquiryHours = function () {
      if (vm.companyData) {
        if (vm.companyData.inquiryTime == 'Anytime')
          return '(Anytime)';
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
          // eventDate = new Date(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate(),  eventDate.getUTCHours(), eventDate.getUTCMinutes(), eventDate.getUTCSeconds());

          displayDate = /*weekdays[eventDate.getDay()] + ', ' + */ eventDate.getDate() + ' ' + months[eventDate.getMonth()] + ' ' + eventDate.getFullYear();
        }
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
        return findMinimum(vm.toursitedata[index].productPricingOptions);
    }

    function findMinimum (pricingOptions) {
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
      
      if (vm.toursitedata.length % 2 == 1 && window.innerWidth >= 767 && index == vm.toursitedata.length - 1) {
        var alignLeft = {
          'margin-left' : '0px'
        }
        return alignLeft;
      }
    }

    vm.goToProductDetailsPage = function (index) {
      $window.open($state.href('guest.tourDetails', {productId: vm.toursitedata[index]._id}),'_blank','heigth=600,width=600');
    }
  }
}());
