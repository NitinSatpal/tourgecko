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
    var fetchAll = false;
    //vm.paginationWindow;
    if ($window.innerWidth > 767) 
      vm.paginationWindow = 5;
    else
      vm.paginationWindow = 3;

    var previousKeysPresence = $window.localStorage.getItem('arePreviousFiltersPresent');
    var preferenceRememberence = $window.localStorage.getItem('shallRememberFilterPreference');
    if (previousKeysPresence == 'present' && preferenceRememberence == 'Yes') {
      var previousFilterKeys = JSON.parse($window.localStorage.getItem("bookingFilters"));
      for (var index = 0; index < previousFilterKeys.length; index++)
        vm.selectedFiltersForBookingRecords[reverseFilterMapping.get(previousFilterKeys[index])] = true;
      vm.rememberFilterPreferences = true;
      categorizedBooking(previousFilterKeys, true);
    } else {
      vm.selectedFiltersForBookingRecords
      fetchAllBookingRecords();
    }


    function fetchAllBookingRecords () {
      $http.get('/api/host/booking/').success(function (response) {
        vm.bookings = response.bookingArray;
        vm.totalPages = Math.ceil(response.bookingsCount / 10);
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
          vm.pageFrom = Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
          vm.pageTo = vm.pageFrom + vm.paginationWindow;
          if (vm.pageTo + 1 < vm.totalPages)
            vm.showAtLast = true;
          else
            vm.showAtLast = false;
        }
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

    vm.getEmailIdToDisplay = function (email) {
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
        $state.go('host.allBookings');
      });
    };

    vm.askActionConfirmation = function (bookingStatus, anchorId, modalId) {
      if (bookingStatus != 'Pending')
        return;
      else
        $(anchorId).attr("data-target", modalId);
    };

    vm.changeItemsPerPage = function (itemsPerPage) {
        vm.totalPages = Math.ceil(totalBookingRecords / parseInt(itemsPerPage));
        vm.pageCounterArray = new Array(vm.totalPages);

        // This will only be possible if user is changing items per page from lestt to more
        if(vm.currentPageNumber > vm.totalPages) {
          vm.currentPageNumber = vm.totalPages;
          vm.showAtLast = false;
          vm.pageTo = vm.currentPageNumber;
          if(vm.pageTo - vm.paginationWindow >= 0)
            vm.pageFrom = vm.pageTo - vm.paginationWindow;
        } else {
          vm.pageFrom = Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
          vm.pageTo = vm.pageFrom + vm.paginationWindow;
          if (vm.pageTo + 1 < vm.totalPages)
            vm.showAtLast = true;
          else
            vm.showAtLast = false;
        }
        //vm.currentPageNumber = 1;
        if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(0);
          }).error(function (response) {
              vm.error = response.message;
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
        if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(0);
              $window.changeCSSForBookingFilterButton();
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

        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(0);
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

      vm.currentPageNumber = vm.pageFrom + 1;
      var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.bookings = response;
            // $('html, body').scrollTop(0);
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
      var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
          vm.bookings = response;
          $('html, body').scrollTop(0);
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

      vm.currentPageNumber = vm.pageTo;
      var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.bookings = response;
            // $('html, body').scrollTop(0);
            $window.changeCSSForBookingFilterButton();
        }).error(function (response) {
            vm.error = response.message;
        });
      } else {
          categorizedBooking($scope.selectedCategorizedKeys, false);
      }
    }

    vm.applySelectedFiltersOnBookingRecords = function () {
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
          vm.pageFrom = Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
          vm.pageTo = vm.pageFrom + vm.paginationWindow;
          if (vm.pageTo + 1 < vm.totalPages)
            vm.showAtLast = true;
          else
            vm.showAtLast = false;
        }
        if (startFromTop)
          $('html, body').scrollTop(0);
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
