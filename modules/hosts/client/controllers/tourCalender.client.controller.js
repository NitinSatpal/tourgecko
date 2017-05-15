(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourCalendarController', TourCalendarController)

  TourCalendarController.$inject = ['$scope', '$window', '$http'];

  function TourCalendarController($scope, $window, $http) {
    var vm = this;
    
    $('#loadingDivHostSide').css('display', 'none');
    $('#tourgeckoBody').removeClass('waitCursor');
    vm.sessionsFetched = false;
    var currentDate = new Date($('#calendar').fullCalendar('getDate'));     
    var uniqueStr = (currentDate.getMonth()).toString() + (currentDate.getUTCFullYear()).toString();
    vm.listViewMonthTitle = $('#calendar').fullCalendar('getView').title;
    $http.get('/api/host/companyproductsessionsforgivenmonth/' + uniqueStr).success(function (response)  {
      vm.productSessions = response;
      vm.sessionsFetched = true;
      $('#loaderForListViewOFSessionsHomePage').hide();
      $('#tourgeckoBody').removeClass('waitCursor');
      $('#loadingDivHostSide').css('display', 'none');
      $('#tourgeckoBody').removeClass('waitCursor');
    });

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    vm.getDepartureDateOfSession = function (index) {
      var displayDate;
      var date = new Date(vm.productSessions[index].sessionDepartureDetails.startDate);
      displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();

      return displayDate;
    }

    vm.fetchPrevMonthSessions = function () {
      vm.sessionsFetched = false;
      // $('#loaderForListViewOFSessionsHomePage').show();
      var tempDate = new Date($('#calendar').fullCalendar('getDate'));
      console.log(tempDate);
      $('#calendar').fullCalendar('prev');
      vm.listViewMonthTitle = $('#calendar').fullCalendar('getView').title;
      var uniqueString = (tempDate.getMonth() - 1).toString() + (tempDate.getUTCFullYear()).toString();
      $http.get('/api/host/companyproductsessionsforgivenmonth/' + uniqueString).success(function (response) {
        vm.productSessions = response;
        vm.sessionsFetched = true;
        // $('#loaderForListViewOFSessionsHomePage').hide();
      });
    }

    vm.fetchNextMonthSessions = function () {
      vm.sessionsFetched = false;
      // $('#loaderForListViewOFSessionsHomePage').show();
      var tempDate = new Date($('#calendar').fullCalendar('getDate'));
      $('#calendar').fullCalendar('next');
      vm.listViewMonthTitle = $('#calendar').fullCalendar('getView').title;
      var uniqueString = (tempDate.getMonth() - 1).toString() + (tempDate.getUTCFullYear()).toString();
      $http.get('/api/host/companyproductsessionsforgivenmonth/' + uniqueString).success(function (response)  {
        vm.productSessions = response;
        vm.sessionsFetched = true;
        // $('#loaderForListViewOFSessionsHomePage').hide();
      });
    }

    vm.getLoaderPositionForHomePageCalendar = function() {
      var leftMargin = ($('.home-content').width() - 25.719) / 2;
      var cssObject = {
        "left" : leftMargin,
        "color": '#ff9800'
      }
      return cssObject;
    }

    vm.getProductSessionLimit = function (index) {
      var limit;
      if(vm.productSessions[index].product.productAvailabilityType == 'Open Date')
        limit = '-';
      else {
        if (vm.productSessions[index].product.productSeatsLimitType == 'unlimited')
          limit = 'No Limit';
        else {
          if (vm.productSessions[index].product.productSeatLimit) {
            limit = vm.productSessions[index].product.productSeatLimit;
          } else
            limit = '-';
        }
      }
      return limit;
    }
    vm.setColorOfListItems = function (index) {
      var percentBooking = 'NA';
      vm.numOfSeatsKey = new Date(vm.productSessions[index].sessionDepartureDetails.startDate).getTime();
      if (vm.productSessions[index] && vm.productSessions[index].product.productSeatLimit)
        if (vm.productSessions[index].numberOfSeats && vm.productSessions[index].numberOfSeats[vm.numOfSeatsKey])
        percentBooking = parseInt(vm.productSessions[index].numberOfSeats[vm.numOfSeatsKey]) / parseInt(vm.productSessions[index].product.productSeatLimit) * 100;
      if (percentBooking != 'NA') {
        if (percentBooking <= 40)
          return 'greenFC';
        else if (percentBooking > 40 && percentBooking <= 80)
          return 'orangeFC';
        else
          return 'redFC'
      } else {
        return 'greenFC';
      }
    }
    vm.getSessionRepeatBehavior = function (index) {
      if (vm.productSessions[index].sessionDepartureDetails.repeatBehavior == 'Repeat Daily')
        return 'Tour repeats daily';
      else if (vm.productSessions[index].sessionDepartureDetails.repeatBehavior == 'Repeat Weekly')
        return 'Tour repeats weekly';
      else
        return 'Non-repeating tour'
    }

    vm.goToSessionBookingDetails = function (index) {
      $state.go('host.sessionBookingDetails', {productSessionId: vm.productSessions[index]._id});
    }
  }
}());
