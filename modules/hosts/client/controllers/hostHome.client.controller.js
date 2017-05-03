(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('HostHomeController', HostHomeController);

  HostHomeController.$inject = ['$scope', '$state', '$window', '$http', 'Authentication', 'CalendarBookingService', 'MessageService', 'ProductSessionService', 'ProductSessionCountService', 'PinboardService'];

  function HostHomeController($scope, $state, $window, $http, Authentication, CalendarBookingService, MessageService, ProductSessionService, ProductSessionCountService, PinboardService) {
    var vm = this;
    vm.sessionsFetched = false;
    var currentDate = new Date($('#calendar').fullCalendar('getDate'));     
    var uniqueStr = (currentDate.getMonth()).toString() + (currentDate.getUTCFullYear()).toString();
    vm.listViewMonthTitle = $('#calendar').fullCalendar('getView').title;
    $http.get('/api/host/companyproductsessionsforgivenmonth/' + uniqueStr).success(function (response)  {
      vm.productSessions = response;
      vm.sessionsFetched = true;
      $('#loaderForListViewOFSessionsHomePage').hide();
      $('#tourgeckoBody').removeClass('waitCursor');
    });
    vm.authentication = Authentication;
    vm.bookings = CalendarBookingService.query();
    vm.messages = MessageService.query();
    vm.productSessionCount = ProductSessionCountService.query();
    vm.pinboardData = PinboardService.query();
    vm.totalRevenue = 0;
    vm.pinboardDismissedMessagesId = [];
    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    var index = 0;
    for (index = 0; index < vm.bookings.length; index ++)
      vm.totalRevenue = vm.totalRevenue + vm.bookings[index].totalAmountPaid;

    vm.getDepartureDateOfBookings = function (index) {
      var displayDate;
      if (vm.bookings[index]) {
        if (vm.bookings[index].isOpenDateTour) {
          var date = new Date(vm.bookings[index].openDatedTourDepartureDate);
          // date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());

          displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
        } else {
          var date = new Date(vm.bookings[index].productSession.sessionDepartureDetails.startDate);
          //date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
          
          displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
        }
      } else
        displayDate = '';
      
      return displayDate;
    }

    vm.getDepartureDateOfSession = function (index) {
      var displayDate;
      var date = new Date(vm.productSessions[index].sessionDepartureDetails.startDate);
      displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();

      return displayDate;
    }

    vm.dismissPinboardMessage = function (index) {
      vm.pinboardDismissedMessagesId.push(vm.pinboardData[index]._id);
      vm.pinboardData.splice(index, 1);
    }

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      if (vm.pinboardDismissedMessagesId.length > 0)
      $http.post('/api/host/pinboard/dismiss', vm.pinboardDismissedMessagesId).success(function (response) {

      }).error(function (response){

      });
    }

    vm.fetchPrevMonthSessions = function () {
      vm.sessionsFetched = false;
      // $('#loaderForListViewOFSessionsHomePage').show();
      var tempDate = new Date($('#calendar').fullCalendar('getDate'));
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

    vm.getProductDuration = function (index) {
      if(vm.productSessions[index].product.productDuration !== undefined)
        return vm.productSessions[index].product.productDuration + '&nbsp;' + vm.productSessions[index].product.productDurationType;
      else
        return 'Duration not provided';
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
      if (vm.productSessions[index] && vm.productSessions[index].product.productSeatLimit)
        percentBooking = parseInt(vm.productSessions[index].numberOfBookings) / parseInt(vm.productSessions[index].product.productSeatLimit) * 100;
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
