(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('ProductBookingController', ProductBookingController)

  ProductBookingController.$inject = ['$state', '$scope', '$stateParams', '$window', '$http', 'BookingService'];

  function ProductBookingController($state, $scope, $stateParams, $window, $http, BookingService) {
    var vm = this;
    vm.numberOfItemsInOnePage = '10';
    vm.currentPageNumber = 1;
    vm.pageFrom = 0;
    vm.showAtLast = true;
    var totalBookingRecords;
    var fetchAll = false;

    $http.get('/api/host/booking/').success(function (response) {
      vm.bookings = response.bookingArray;
      vm.totalPages = Math.ceil(response.bookingsCount/10);
      if(vm.totalPages <= 5)
        vm.pageTo = vm.totalPages;
      else
        vm.pageTo = 5;
      vm.pageCounterArray = new Array(vm.totalPages);
      totalBookingRecords = response.bookingsCount;
    });

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
        vm.totalPages = Math.ceil(totalBookingRecords/itemsPerPage);
        vm.pageCounterArray = new Array(vm.totalPages);
        if (!vm.selectedCategorizedKeys || vm.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
              vm.bookings = response;
              $('html, body').animate({scrollTop : 0},800);
          }).error(function (response) {
              vm.error = response.message;
          });
        } else {
            categorizedBooking(true);
        }
    }

    vm.changePageNumber = function (clickedIndex) {
        if (vm.currentPageNumber == clickedIndex + 1)
            return;
        vm.currentPageNumber = clickedIndex + 1;
        if (vm.currentPageNumber == vm.pageCounterArray.length) {
          vm.showAtLast = false;
          vm.pageTo = vm.currentPageNumber;
          if (vm.pageCounterArray.length >= 5)
            vm.pageFrom =   Math.ceil((vm.pageTo -5) / 5) * 5;
          else
            vm.pageFrom = 0;
        }

        if(vm.currentPageNumber == 1) {
          vm.showAtLast = true;
          vm.pageFrom = 0
          if (vm.pageCounterArray.length >= 5)
            vm.pageTo = 5;
          else
            vm.pageTo = vm.pageCounterArray.length;
        }

        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        if (!vm.selectedCategorizedKeys || vm.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
              vm.bookings = response;
              $('html, body').animate({scrollTop : 0},800);
          }).error(function (response) {
              vm.error = response.message;
          });
        } else {
            categorizedBooking(true);
        }
    }


    var isWindowSizeReached = false;
    var windowSizeIncremented = false;
    vm.incrementPageNumber = function () {

        // if we are at last page number then just return
        if (vm.currentPageNumber == vm.totalPages)
            return;

        // If we are at multiple of 5 or crossed the first multiple of 5, handle things differently
        if (vm.currentPageNumber % 5 == 0 || isWindowSizeReached) {
          isWindowSizeReached = true;

          // if we ar at multiple of 5 page number, then set off the variable to enter in the nect if loop
          if (vm.currentPageNumber % 5 == 0)
            windowSizeIncremented = false;

          // increment the page number
          vm.currentPageNumber = vm.currentPageNumber + 1;

          // if we are not in last window and the window is not changed, go inside.
          if (vm.showAtLast && !windowSizeIncremented) {
            // if we are two pages short of total pages, change the '....' to the starting side and set the from and to limits From: -4 here
            if (vm.currentPageNumber + 1 == vm.pageCounterArray.length) {
              vm.showAtLast = false;
              vm.pageFrom = vm.currentPageNumber - 4;
              vm.pageTo = vm.currentPageNumber + 1;
            } else {
              // if we are not two pages short of total pages, just set the from and to limits From : -5 here
              vm.pageFrom = vm.currentPageNumber - 5;
              vm.pageTo = vm.currentPageNumber;
            }
          }
        } else {
          // If we are not at multiple of 5 or never crossed the first multiple of 5, just increment the page number
          vm.currentPageNumber = vm.currentPageNumber + 1;
        }

        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        if (!vm.selectedCategorizedKeys || vm.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
              vm.bookings = response;
              $('html, body').animate({scrollTop : 0},800);
          }).error(function (response) {
              vm.error = response.message;
          });
        } else {
            categorizedBooking(true);
        }
    }

    vm.incrementWindowSize = function () {
      if (vm.currentPageNumber == vm.totalPages || vm.pageTo == vm.pageCounterArray.length)
        return;
      windowSizeIncremented = true;
      if (Math.ceil(vm.currentPageNumber / 5) * 5 + 5 <= vm.pageCounterArray.length) {
        vm.pageFrom = Math.ceil(vm.currentPageNumber / 5) * 5;
        vm.pageTo = vm.pageFrom + 5;
        vm.showAtLast = true;
      } else {
        if (Math.ceil(vm.currentPageNumber / 5) * 5 <= vm.pageCounterArray.length) {
          vm.pageFrom = Math.ceil(vm.currentPageNumber / 5) * 5;
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
      if (!vm.selectedCategorizedKeys || vm.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.bookings = response;
            $('html, body').animate({scrollTop : 0},800);
        }).error(function (response) {
            vm.error = response.message;
        });
      } else {
          categorizedBooking(true);
      }
    }

    vm.decrementPageNumber = function () {
      if (vm.currentPageNumber == 1)
          return;
      
      vm.currentPageNumber = vm.currentPageNumber - 1;

      if (!vm.showAtLast) {
        var lastMultipleOfFive =  Math.ceil((vm.pageCounterArray.length - 5) / 5) * 5;
        if (vm.currentPageNumber == lastMultipleOfFive)
          vm.showAtLast = true;
      }

      if (vm.currentPageNumber % 5 == 0) {
        vm.pageFrom = vm.currentPageNumber - 5;
        vm.pageTo = vm.currentPageNumber;
      }
      var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
      if (!vm.selectedCategorizedKeys || vm.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
          vm.bookings = response;
          $('html, body').animate({scrollTop : 0},800);
        }).error(function (response) {
            vm.error = response.message;
        });
      } else {
          categorizedBooking(true);
      }
    }

    vm.decrementWindowSize = function () {
      if (vm.currentPageNumber == 1 || vm.pageFrom == 0)
        return;
      
      if (Math.ceil((vm.currentPageNumber - 5) / 5) * 5 > 0) {
        vm.pageTo = Math.ceil((vm.currentPageNumber - 5) / 5) * 5;
        vm.pageFrom = vm.pageTo - 5;
        vm.showAtLast = true;
      } else {
        if (vm.pageCounterArray.length >=5) {
          vm.pageFrom = 0;
          vm.pageTo = 5;
          vm.showAtLast = true;
        } else {
          vm.pageFrom = 0;
          vm.pageTo = vm.pageCounterArray.length;
          vm.showAtLast = true;
        }
      }

      vm.currentPageNumber = vm.pageTo;
      var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
      if (!vm.selectedCategorizedKeys || vm.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.bookings = response;
            $('html, body').animate({scrollTop : 0},800);
        }).error(function (response) {
            vm.error = response.message;
        });
      } else {
          categorizedBooking(true);
      }
    }

    vm.getCategorizedBookings = function () {
      if (vm.selectedCategorizedKeys.length == 0) {
        fetchAll = true;
        categorizedBooking(false);
        fetchAll = false;
      } else {
        categorizedBooking(false);
      }
    }


    function categorizedBooking (callingFromPagination) {
      console.log()
      var itemsPerPageSelected = parseInt(vm.numberOfItemsInOnePage);
      $http.post('/api/host/categorizedBooking/' ,{categoryKeys: vm.selectedCategorizedKeys,
       pageNumber: vm.currentPageNumber,
       itemsPerPage: itemsPerPageSelected,
       queryAll: fetchAll})
      .success(function (response) {
        vm.bookings = response.bookingArray;
        vm.totalPages = Math.ceil(response.bookingsCount/itemsPerPageSelected);
        vm.pageCounterArray = new Array(vm.totalPages);
        totalBookingRecords = response.bookingsCount;
        if (callingFromPagination)
          $('html, body').animate({scrollTop : 0},800);
      });
    }
  }
}());
