(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('ProductBookingController', ProductBookingController)

  ProductBookingController.$inject = ['$state', '$stateParams', '$window', '$http', 'BookingService'];

  function ProductBookingController($state, $stateParams, $window, $http, BookingService) {
    var vm = this;
    vm.numberOfItemsInOnePage = '10';
    vm.currentPageNumber = 1;
    var totalBookingRecords;
    var fetchAll = false;

    $http.get('/api/host/booking/').success(function (response) {
      vm.bookings = response.bookingArray;
      vm.totalPages = Math.ceil(response.bookingsCount/10);
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

    vm.incrementPageNumber = function () {
        if (vm.currentPageNumber == vm.totalPages)
            return;
        vm.currentPageNumber = vm.currentPageNumber + 1;
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
