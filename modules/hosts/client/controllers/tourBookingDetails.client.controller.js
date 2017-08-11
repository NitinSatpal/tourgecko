(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourBookingDetailsController', TourBookingDetailsController)

  TourBookingDetailsController.$inject = ['$scope', '$state', '$window', '$location', '$stateParams', '$http'];

  function TourBookingDetailsController($scope, $state, $window, $location, $stateParams, $http) {
    var vm = this;
    vm.tourEndDate = '';
    vm.skipIndexForGuestData = 0;
    vm.lastIndexForGuestData = 0;
    var asynRequestCounter = 0;
    vm.confirmedBookings = 0;
    vm.confirmedSeats = 0;
    vm.totalRevenue = 0;

    var sessionStartDate = $location.path().split('/')[5];
    
    $http.get('/api/host/bookingDetailsForParticularSession/' + $stateParams.productSessionId + '/' + sessionStartDate ).success(function (response) {
      var bookings = response;
      for (var index = 0; index < bookings.length; index++) {
        vm.totalRevenue = vm.totalRevenue + parseInt(bookings[index].totalAmountPaid);
        if(bookings[index].bookingStatus == 'Confirmed') {
          vm.confirmedBookings ++;
          vm.confirmedSeats = vm.confirmedSeats + parseInt(bookings[index].numberOfSeats);
        }
      }
    }).error(function (response){
    });
    /* This will change and we will fetch only one as per date */
    $http.get('/api/host/productsession/' + $stateParams.productSessionId).success(function (response) {
      vm.productSession = response;
      var startDate = new Date(+sessionStartDate);
      var duration = vm.productSession.product.productDuration;
      var tourEndDate;
      if (duration && vm.productSession.product.productDurationType == 'Days') {
        tourEndDate = startDate.setDate(startDate.getDate() + duration - 1);
      } else
        tourEndDate = startDate;
      initializeRemainingTimeCounter(startDate, tourEndDate);
      asynRequestCounter++;
      if(asynRequestCounter >= 2) {
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }
    }).error(function (response) {
      vm.error = response.message;
      asynRequestCounter++
      if(asynRequestCounter >= 2) {
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }
    });

    $http.get(' /api/host/productsessions/guestData/' + $stateParams.productSessionId + '/' + vm.skipIndexForGuestData).success(function (response) {
      vm.guestData = response.guestData;
      var totalGuestDataCount = response.guestDataCount;
      vm.lastIndexForGuestData = Math.floor(totalGuestDataCount / 10);
      asynRequestCounter++;
      if(asynRequestCounter >= 2) {
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }
    }).error(function (response) {
      vm.error = response.message;
       asynRequestCounter++;
      if(asynRequestCounter >= 2) {
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }
    });

    //$("#myNavbar .nav").find(".active").removeClass("active");
    
    vm.numberOfItemsInOnePage = '10';
    vm.currentPageNumber = 1;
    vm.pageFrom = 0;
    vm.showAtLast = true;
    vm.rememberFilterPreferences = false;

    vm.selectedFiltersForBookingRecords = [false, false, false, false, false];

    var filterMapping = new Map();
    filterMapping.set(0, 'Pending');
    filterMapping.set(1, 'Confirmed');
    filterMapping.set(2, 'Declined');
    filterMapping.set(3, 'Cancelled');
    filterMapping.set(4, 'Expired');

    var reverseFilterMapping = new Map()
    reverseFilterMapping.set('Pending', 0);
    reverseFilterMapping.set('Confirmed', 1);
    reverseFilterMapping.set('Declined', 2);
    reverseFilterMapping.set('Cancelled', 3);
    reverseFilterMapping.set('Expired', 4);
    

    $scope.selectedCategorizedKeys = [];
    var totalBookingRecords;
    var scrollTo = 0;
    if ($window.innerWidth > 767) {
      vm.paginationWindow = 5;
      scrollTo = 407;
    }
    else {
      vm.paginationWindow = 3;
    }

    var previousKeysPresence = $window.localStorage.getItem('arePreviousSessionBookingFiltersPresent');
    var preferenceRememberence = $window.localStorage.getItem('shallRememberSessionBookingFilterPreference');
    if (previousKeysPresence == 'present' && preferenceRememberence == 'Yes') {
      var previousFilterKeys = JSON.parse($window.localStorage.getItem("sessionBookingFilters"));
      if ($window.localStorage.getItem('alreadySelectedItemsPerPageForSessionBookings') != null)
        vm.numberOfItemsInOnePage = $window.localStorage.getItem('alreadySelectedItemsPerPageForSessionBookings');
      for (var index = 0; index < previousFilterKeys.length; index++)
        vm.selectedFiltersForBookingRecords[reverseFilterMapping.get(previousFilterKeys[index])] = true;
      vm.rememberFilterPreferences = true;
      categorizedBooking(previousFilterKeys, true);
    } else {
      if ($window.localStorage.getItem('alreadySelectedItemsPerPageForSessionBookings') != null)
        vm.numberOfItemsInOnePage = $window.localStorage.getItem('alreadySelectedItemsPerPageForSessionBookings');
      fetchAllBookingRecords();
    }

    function fetchAllBookingRecords () {
     $http.get('/api/host/productsession/allBookings/' + $stateParams.productSessionId + '/' + sessionStartDate + '/' + vm.numberOfItemsInOnePage).success(function (response) {
        vm.bookings = response.bookingArray;
        vm.totalPages = Math.ceil(response.bookingsCount / vm.numberOfItemsInOnePage);
        if(vm.totalPages <= vm.paginationWindow)
          vm.pageTo = vm.totalPages;
        else
          vm.pageTo = vm.paginationWindow;
        vm.pageCounterArray = new Array(vm.totalPages);
        totalBookingRecords = response.bookingsCount;
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
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }).error(function (err) {
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }

    vm.changeItemsPerPage = function (itemsPerPage) {
        vm.totalPages = Math.ceil(totalBookingRecords / parseInt(itemsPerPage));
        vm.pageCounterArray = new Array(vm.totalPages);
        $window.localStorage.setItem('alreadySelectedItemsPerPageForSessionBookings', itemsPerPage);
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
        
        if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/productsession/bookingsForCurrentPage/' + $stateParams.productSessionId + '/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(scrollTo);
          }).error(function (response) {
              vm.error = response.message;
          });
        } else {
          categorizedBooking($scope.selectedCategorizedKeys, true);
        }
    }

    vm.changePageNumber = function (clickedIndex) {
        if (vm.currentPageNumber == clickedIndex + 1) {
          $('html, body').scrollTop(scrollTo);
          return;
        }
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
        if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/productsession/bookingsForCurrentPage/' + $stateParams.productSessionId + '/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(scrollTo);
              $window.changeCSSForSessionBookingFilterButton();
          }).error(function (response) {
              vm.error = response.message;
          });
        } else {
            categorizedBooking($scope.selectedCategorizedKeys, true);
        }
    }


    var isWindowSizeReached = false;
    var windowSizeIncremented = false;
    vm.incrementPageNumber = function () {

        // if we are at last page number then just return
        if (vm.currentPageNumber == vm.totalPages)
            return;

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
        if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/productsession/bookingsForCurrentPage/' + $stateParams.productSessionId + '/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(scrollTo);
              $window.changeCSSForBookingFilterButton();
          }).error(function (response) {
              vm.error = response.message;
          });
        } else {
            categorizedBooking($scope.selectedCategorizedKeys, true);
        }
    }

    vm.incrementWindowSize = function () {
      if (vm.currentPageNumber == vm.totalPages || vm.pageTo == vm.pageCounterArray.length)
        return;
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
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/productsession/bookingsForCurrentPage/' + $stateParams.productSessionId + '/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
            vm.bookings = response;
            $window.changeCSSForBookingFilterButton();
        }).error(function (response) {
            vm.error = response.message;
        });
      } else {
          categorizedBooking($scope.selectedCategorizedKeys, false);
      }
    }

    vm.decrementPageNumber = function () {
      if (vm.currentPageNumber == 1)
          return;
      
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
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/productsession/bookingsForCurrentPage/' + $stateParams.productSessionId + '/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
          vm.bookings = response;
          $('html, body').scrollTop(scrollTo);
          $window.changeCSSForBookingFilterButton();
        }).error(function (response) {
            vm.error = response.message;
        });
      } else {
          categorizedBooking($scope.selectedCategorizedKeys, true);
      }
    }

    vm.decrementWindowSize = function () {
      if (vm.currentPageNumber == 1 || vm.pageFrom == 0)
        return;
      
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
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/productsession/bookingsForCurrentPage/' + $stateParams.productSessionId + '/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
            vm.bookings = response;
            $window.changeCSSForBookingFilterButton();
        }).error(function (response) {
            vm.error = response.message;
        });
      } else {
          categorizedBooking($scope.selectedCategorizedKeys, false);
      }
    }
    vm.filterApplied = false;
    vm.applySelectedFiltersOnBookingRecords = function () {
      vm.filterApplied = true;
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      $scope.selectedCategorizedKeys.length = 0;
      for(var index = 0; index < vm.selectedFiltersForBookingRecords.length; index++) {
        if(vm.selectedFiltersForBookingRecords[index])
          $scope.selectedCategorizedKeys.push(filterMapping.get(index));
      }
      if ($scope.selectedCategorizedKeys.length > 0) {
        $window.localStorage.setItem('sessionBookingFilters', JSON.stringify($scope.selectedCategorizedKeys));
        $window.localStorage.setItem('arePreviousSessionBookingFiltersPresent', 'present');
      }
      categorizedBooking($scope.selectedCategorizedKeys, true);
      $('#filter-dropdown-button').click();
    }

    vm.clearAllFilterOnBookingRecords = function () {
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      vm.selectedFiltersForBookingRecords = [false, false, false, false, false];
      $scope.selectedCategorizedKeys.length = 0;
      $window.localStorage.setItem('sessionBookingFilters', ' ');
      $window.localStorage.setItem('arePreviousSessionBookingFiltersPresent', 'notPresent');
      vm.rememberFilterPreferences = false;
      $window.localStorage.setItem('shallRememberSessionBookingFilterPreference', 'No');
      fetchAllBookingRecords();
      $('#filter-dropdown-button').click();
    }

    vm.categorizedBooking = function (filterKeys, startFromTop) {
      vm.filterApplied = true;
      categorizedBooking(filterKeys, startFromTop);
    }

    function categorizedBooking (filterKeys, startFromTop) {
      vm.bookings.length = 0;
      if (filterKeys == 'All') {
        fetchAllBookingRecords();
        return;
      }
      var itemsPerPageSelected = parseInt(vm.numberOfItemsInOnePage);
      $http.post('/api/host/productsession/categorizedBooking/' ,{categoryKeys: filterKeys,
        productSessionId : $stateParams.productSessionId,
        sessionStartDate: sessionStartDate,
        pageNumber: vm.currentPageNumber,
        itemsPerPage: itemsPerPageSelected
      })
      .success(function (response) {
        vm.bookings = response.bookingArray;
        vm.totalPages = Math.ceil(response.bookingsCount/itemsPerPageSelected);
        vm.pageCounterArray = new Array(vm.totalPages);
        totalBookingRecords = response.bookingsCount;
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

          if (vm.pageFrom + vm.paginationWindow <= vm.totalPages)
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

        if (startFromTop)
          $('html, body').scrollTop(scrollTo);
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }).error(function (err) {
        vm.filterApplied = false;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }

    vm.getNewSetOfGuestData = function (skipIndex) {
      vm.skipIndexForGuestData = skipIndex;
      $http.get(' /api/host/productsessions/guestData/' + $stateParams.productSessionId + '/' + vm.skipIndexForGuestData).success(function (response) {
        vm.guestData = response.guestData;
        var totalGuestDataCount = response.guestDataCount;
        vm.lastIndexForGuestData = Math.floor(totalGuestDataCount / 10);
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    vm.getBookingDate = function (index) {
      var bookingDate = vm.guestData[index].bookingDate;
      bookingDate = bookingDate.split(' ');
      return bookingDate[2] + ' ' + bookingDate[1] + ', ' + bookingDate[3];
    }

    vm.goToBookingDetailScreen = function (index) {
      $state.go('host.bookingdetails', {bookingId: vm.bookings[index]._id, sessionId: $stateParams.productSessionId});
    }

    vm.setFilterPreferences = function () {
      if (vm.rememberFilterPreferences == true)
        $window.localStorage.setItem('shallRememberSessionBookingFilterPreference', 'Yes');
      else
        $window.localStorage.setItem('shallRememberSessionBookingFilterPreference', 'No');
    }

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    vm.getFullDisplayDate = function () {
      var date = new Date(+sessionStartDate);
      var displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
      return displayDate;
    }

    vm.getDisplayDate = function (isoDate, duration) {
      var date = new Date(isoDate);      
      var displayDate = date.getDate();
      var endDate = new Date(isoDate);
      var tourEndDate;
      if (duration && vm.productSession.product.productDurationType == 'Days') {
        tourEndDate = endDate.setDate(endDate.getDate() + duration - 1);
      } else
        tourEndDate = endDate;
      
      tourEndDate = new Date(tourEndDate);
      vm.tourEndDate = new Date(tourEndDate).getDate();

      return displayDate;
    }

    vm.getDisplayMonthAndYear = function (isoDate, duration) {
      var date = new Date(isoDate);
      var displayDate = months[date.getMonth()] + ' ' + date.getFullYear();
      var endDate = new Date(isoDate);
      var tourEndDate;
      if (duration && vm.productSession.product.productDurationType == 'Days') {
        tourEndDate = endDate.setDate(endDate.getDate() + duration - 1);
      } else
        tourEndDate = endDate;
      
      tourEndDate = new Date(tourEndDate);
      vm.tourEndMonthAndYear = months[tourEndDate.getMonth()] +  ' ' + tourEndDate.getFullYear();
      
      return displayDate;
    }

    vm.getSeatsAvailability = function() {
      if (vm.productSession) {
        if(vm.productSession.product.productAvailabilityType == 'Open Date' || 
          (vm.productSession.product.productAvailabilityType == 'Fixed Departure' && vm.productSession.sessionCapacityDetails.sessionSeatsLimitType == 'unlimited'))
          return '-';
        else 
          return parseInt(vm.productSession.sessionCapacityDetails.sessionSeatLimit) - parseInt(vm.confirmedSeats);
      }
    }

    vm.getDynamicCSSForStripedTable = function (index) {
      var oddCSS = {
        "background-color" : "#fff",
      };
      var evenCSS = {
        "background-color" : "#eee",
      };
      if (index % 2 == 1)
        return oddCSS;
      else
        return evenCSS;
    }

    vm.sendMessageToGuestsOfThisSession = function () {
      if ((vm.msgBodyToSpecificSessionsGuest === undefined || vm.msgBodyToSpecificSessionsGuest == '') && vm.typeOfMsgToGuests === undefined) {
        alert('please select the type of message and enter the message in the area provided');
        return;
      } else if (vm.typeOfMsgToGuests === undefined) {
        alert('please select the type of message you want to send');
        return;
      } else if (vm.msgBodyToSpecificSessionsGuest === undefined || vm.msgBodyToSpecificSessionsGuest == '') {
        alert('please enter the message in the area provided');
        return;
      }

      if(vm.typeOfMsgToGuests == 'email' || vm.typeOfMsgToGuests == 'both') {
        $http.post('/api/host/sessionGuestMassMail/', {message: vm.msgBodyToSpecificSessionsGuest, sessionId: $stateParams.productSessionId})
        .success(function (response) {
          // success
        }).error(function (response) {
          vm.error = response.message;
        });
      }

      if(vm.typeOfMsgToGuests == 'textMsg' || vm.typeOfMsgToGuests == 'both') {
        $http.post('/api/host/sessionGuestMassMessage/', {message: vm.msgBodyToSpecificSessionsGuest, sessionId: $stateParams.productSessionId}).success(function (response) {
          
        }).error(function (response) {
          vm.error = response.message
        });
      }

      $('#closeTheSendMsgToSessionsGuestModal').click();
      vm.typeOfMsgToGuests = undefined;
      vm.msgBodyToSpecificSessionsGuest = undefined;

    }
    

  }
}());
