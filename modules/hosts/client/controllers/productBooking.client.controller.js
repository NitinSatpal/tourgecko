
(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('ProductBookingController', ProductBookingController)

  ProductBookingController.$inject = ['$state', '$scope', '$stateParams', '$window', '$http'];

  function ProductBookingController($state, $scope, $stateParams, $window, $http) {
    var vm = this;
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
    if ($window.innerWidth > 767) 
      vm.paginationWindow = 5;
    else
      vm.paginationWindow = 3;

    var previousKeysPresence = $window.localStorage.getItem('arePreviousFiltersPresent');
    var preferenceRememberence = $window.localStorage.getItem('shallRememberFilterPreference');
    if (previousKeysPresence == 'present' && preferenceRememberence == 'Yes') {
      var previousFilterKeys = JSON.parse($window.localStorage.getItem("bookingFilters"));
      if ($window.localStorage.getItem('alreadySelectedItemsPerPage') != null)
        vm.numberOfItemsInOnePage = $window.localStorage.getItem('alreadySelectedItemsPerPage');
      for (var index = 0; index < previousFilterKeys.length; index++)
        vm.selectedFiltersForBookingRecords[reverseFilterMapping.get(previousFilterKeys[index])] = true;
      vm.rememberFilterPreferences = true;
      categorizedBooking(previousFilterKeys, true);
    } else {
      if ($window.localStorage.getItem('alreadySelectedItemsPerPage') != null)
        vm.numberOfItemsInOnePage = $window.localStorage.getItem('alreadySelectedItemsPerPage');
      fetchAllBookingRecords();
    }


    function fetchAllBookingRecords () {
      $http.get('/api/host/allBookings/' + vm.numberOfItemsInOnePage).success(function (response) {
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
      });
    }

    if($stateParams.bookingId != null) {
      $http.get('/api/host/booking/'+ $stateParams.bookingId).success(function (response) {
        vm.specificBookingDetails = response;
      });
    }

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    vm.getDisplayDate = function (isoDate) {
      var date = new Date(isoDate);
      var displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
      return displayDate;
    }

    vm.goToBookingDetailScreen = function (index) {
      $state.go('host.bookingdetails', {bookingId: vm.bookings[index]._id});
    }

    vm.goToPreviousState = function () {
      // This if else is not really required as, even if we send productSessionId in both the cases, in one case it will be utilized and
      // in other it will not. But for the understanding of functionality, i am putting if else
      if ( $stateParams.sessionId != null )
        $state.go($state.previous.state.name, {productSessionId: $stateParams.sessionId});
      else
        $state.go($state.previous.state.name);
    }

    vm.getEmailIdToDisplay = function (email) {
      console.log(email);
      if (email) {
        if ($window.innerWidth > 767) {
          if (email.length >= 25)
            return email.slice(0,15) + '\n' + email.slice(15, email.length);
          else
            return email;
        } else
          return email;
      }
    }

    vm.modifyBooking = function (status) {
      if (vm.specificBookingDetails.bookingStatus != 'Pending')
        return;

      var bookingModificationData = {bookingId: $stateParams.bookingId, bookingStatus: status, bookingComments: vm.bookingComments}
      $http.post('/api/host/modifyBooking/', bookingModificationData).success(function (response) {
        $('.modal-backdrop').remove();
        // After confirming or declining booking, if we go to bookings tab, its a bit cimplicated to bring the same booking there.
        // Reason can be, filters already had applied pagination page changes after the action etc.
        // Hence for Beta, we will just bring the user back to the booking and will ask him to click Bookings to go to Bookings.
        //$state.go('host.allBookings');
        $state.reload();
      });
    };

    vm.askActionConfirmation = function (bookingStatus, anchorId, modalId) {
      if (bookingStatus != 'Pending')
        return;
      else
        $(anchorId).attr("data-target", modalId);
    };

    vm.changeItemsPerPage = function (itemsPerPage) {
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        vm.totalPages = Math.ceil(totalBookingRecords / parseInt(itemsPerPage));
        vm.pageCounterArray = new Array(vm.totalPages);
        $window.localStorage.setItem('alreadySelectedItemsPerPage', itemsPerPage);
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
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(0);
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
          }).error(function (response) {
              vm.error = response.message;
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
          });
        } else {
          categorizedBooking($scope.selectedCategorizedKeys, true);
        }
    }

    vm.changePageNumber = function (clickedIndex) {
        if (vm.currentPageNumber == clickedIndex + 1) {
          $('html, body').scrollTop(0);
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
        if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(0);
              $window.changeCSSForBookingFilterButton();
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
          }).error(function (response) {
              vm.error = response.message;
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
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
        if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(0);
              $window.changeCSSForBookingFilterButton();
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
          }).error(function (response) {
              vm.error = response.message;
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
          });
        } else {
            categorizedBooking($scope.selectedCategorizedKeys, true);
        }
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
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.bookings = response;
            $window.changeCSSForBookingFilterButton();
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        });
      } else {
          categorizedBooking($scope.selectedCategorizedKeys, false);
      }
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
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
          vm.bookings = response;
          $('html, body').scrollTop(0);
          $window.changeCSSForBookingFilterButton();
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        });
      } else {
          categorizedBooking($scope.selectedCategorizedKeys, true);
      }
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
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.bookings = response;
            $window.changeCSSForBookingFilterButton();
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        });
      } else {
          categorizedBooking($scope.selectedCategorizedKeys, false);
      }
    }

    vm.applySelectedFiltersOnBookingRecords = function () {
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      $scope.selectedCategorizedKeys.length = 0;
      for(var index = 0; index < vm.selectedFiltersForBookingRecords.length; index++) {
        if(vm.selectedFiltersForBookingRecords[index])
          $scope.selectedCategorizedKeys.push(filterMapping.get(index));
      }
      if ($scope.selectedCategorizedKeys.length > 0) {
        $window.localStorage.setItem('bookingFilters', JSON.stringify($scope.selectedCategorizedKeys));
        $window.localStorage.setItem('arePreviousFiltersPresent', 'present');
      }
      categorizedBooking($scope.selectedCategorizedKeys, true);
      $('#filter-dropdown-button').click();
    }

    vm.clearAllFilterOnBookingRecords = function () {
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      vm.selectedFiltersForBookingRecords = [false, false, false, false, false];
      $scope.selectedCategorizedKeys.length = 0;
      $window.localStorage.setItem('bookingFilters', ' ');
      $window.localStorage.setItem('arePreviousFiltersPresent', 'notPresent');
      vm.rememberFilterPreferences = false;
      $window.localStorage.setItem('shallRememberFilterPreference', 'No');
      fetchAllBookingRecords();
    }

    function categorizedBooking (filterKeys, startFromTop) {
      var itemsPerPageSelected = parseInt(vm.numberOfItemsInOnePage);
      $http.post('/api/host/categorizedBooking/' ,{categoryKeys: filterKeys,
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
          $('html, body').scrollTop(0);
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }

    vm.setFilterPreferences = function () {
      if (vm.rememberFilterPreferences == true)
        $window.localStorage.setItem('shallRememberFilterPreference', 'Yes');
      else
        $window.localStorage.setItem('shallRememberFilterPreference', 'No');
    }

    vm.getCSSClassForBigScreens = function () {
      if ($window.innerWidth > 767)
        return "col-lg-6";
    }
  }
}());
