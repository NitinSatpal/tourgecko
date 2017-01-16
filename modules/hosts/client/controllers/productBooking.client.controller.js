(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('ProductBookingController', ProductBookingController)

  ProductBookingController.$inject = ['$state', '$stateParams', '$window', '$http', 'BookingService'];

  function ProductBookingController($state, $stateParams, $window, $http, BookingService) {
    var vm = this;
    vm.bookings = BookingService.query();

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

    vm.confirmBooking = function () {
      if (vm.specificBookingDetails.bookingStatus == 'Confirmed' || vm.specificBookingDetails.bookingStatus == 'Declined')
        return;
      $http.post('/api/host/confirmBooking/' + $stateParams.bookingId).success(function (response) {
        $state.go('host.allBookings');
      });
    };
    
  }
}());
