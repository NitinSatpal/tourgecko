(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('HostHomeController', HostHomeController);

  HostHomeController.$inject = ['$scope', '$state', '$window', '$http', 'Authentication', 'CalendarBookingService', 'MessageService', 'NotificationService', 'ProductSessionService', 'PinboardService'];

  function HostHomeController($scope, $state, $window, $http, Authentication, CalendarBookingService, MessageService, NotificationService, ProductSessionService, PinboardService) {
    var vm = this;
    if ($('#calendar').is(':empty')) {
      $('#loaderForCalendarHomePage').show();
    }
    vm.authentication = Authentication;
    vm.bookings = CalendarBookingService.query();
    vm.messages = MessageService.query();
    vm.notifications = NotificationService.query();
    vm.productSessions = ProductSessionService.query();
    vm.pinboardData = PinboardService.query();
    vm.totalRevenue = 0;
    vm.bellNotifications = 0;
    vm.pinboardDismissedMessagesId = [];

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    var index = 0;
    for (index = 0; index < vm.bookings.length; index ++)
      vm.totalRevenue = vm.totalRevenue + vm.bookings[index].totalAmountPaid;

    for (index = 0; index < vm.messages.length; index ++) {
      if (vm.messages[index].messageRead == false)
        vm.bellNotifications = vm.bellNotifications + 1;
    }

    vm.getDepartureDate = function (index) {
      var displayDate;
      if (vm.bookings[index]) {
        if (vm.bookings[index].isOpenDateTour) {
          var date = new Date(vm.bookings[index].openDatedTourDepartureDate);
          date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());

          displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
        } else {
          var date = new Date(vm.bookings[index].productSession.sessionDepartureDetails.startDate);
          date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
          
          displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
        }
      } else
        displayDate = '';
      
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

    vm.getLoaderPositionForHomePageCalendar = function() {
      var leftMargin = ($('.home-content').width() - 25.719) / 2;
      var cssObject = {
        "left" : leftMargin,
        "color": '#ff9800'
      }
      return cssObject;
    }
  }
}());
