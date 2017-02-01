(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourBookingDetailsController', TourBookingDetailsController)

  TourBookingDetailsController.$inject = ['$state', '$stateParams', '$http'];

  function TourBookingDetailsController($state, $stateParams, $http) {
    var vm = this;
    vm.tourEndDate = '';

    $http.get('/api/host/booking/' + $stateParams.productId).success(function (response) {
      vm.bookings = response;
    }).error(function (response) {
      vm.error = response.message;
    });

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    vm.getFullDisplayDate = function (isoDate) {
      var date = new Date(isoDate);
      var displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
      return displayDate;
    }

    vm.getDisplayDate = function (isoDate, duration) {
      var date = new Date(isoDate);
      var displayDate = date.getDate();

      var endDate = new Date(isoDate);
      var tourEndDate;
      if (duration && vm.bookings[0].product.productDurationType == 'Days') {
        tourEndDate = endDate.setDate(endDate.getDate() + duration);
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
      if (duration && vm.bookings[0].product.productDurationType == 'Days') {
        tourEndDate = endDate.setDate(endDate.getDate() + duration);
      } else
        tourEndDate = endDate;
      
      tourEndDate = new Date(tourEndDate);
      vm.tourEndMonthAndYear = months[tourEndDate.getMonth()] +  ' ' + tourEndDate.getFullYear();
      
      return displayDate;
    }

    vm.getAmountEarnedAndConfirmedBookings = function () {
      var totalAmountPaid = 0;
      vm.confirmedBookings = 0
      vm.confirmedSeats = 0;
      for (var index = 0; index < vm.bookings.length; index++) {
        totalAmountPaid = totalAmountPaid + vm.bookings[index].totalAmountPaid;
        if(vm.bookings[index].bookingStatus == 'Confirmed') {
          vm.confirmedBookings ++;
          vm.confirmedSeats = vm.confirmedSeats + vm.bookings[index].bookingStatus + numberOfBookings;
        }
      }
      return totalAmountPaid;
    }

    vm.getDaysRemainingToStartOfTour = function(isoDate) {
      var currentDate = new Date();
      var startDate = new Date(isoDate);
      var timeDiff = Math.abs(startDate.getTime() - currentDate.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      return diffDays;
    }

    vm.getSeatsAvailability = function() {
      if(vm.bookings[0].product.productAvailabilityType == 'Open Date' || 
        (vm.bookings[0].product.productAvailabilityType == 'Fixed Departure' && vm.bookings[0].product.productSeatsLimitType == 'unlimited'))
        return 'No Limit';
      else
        vm.bookings[0].product.productSeatLimit - vm.confirmedSeats;
    }

  }
}());
