(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourCalendarController', TourCalendarController);

  TourCalendarController.$inject = ['$state', '$scope', '$window', '$http'];

  function TourCalendarController($state, $scope, $window, $http) {
    var vm = this;
    $scope.productSessions;
    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    vm.getDepartureDateOfSession = function (startDate) {
      var displayDate;
      var date = new Date(startDate);
      displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();

      return displayDate;
    }

    vm.fetchPrevMonthSessions = function () {
      $('#calendar').fullCalendar('prev');
      $scope.listViewMonthTitle = $('#calendar').fullCalendar('getView').title;
    }

    vm.fetchNextMonthSessions = function () {
      $('#calendar').fullCalendar('next');
      $scope.listViewMonthTitle = $('#calendar').fullCalendar('getView').title;
    }

    vm.getLoaderPositionForHomePageCalendar = function() {
      var leftMargin = ($('.home-content').width() - 25.719) / 2;
      var cssObject = {
        "left" : leftMargin,
        "color": '#ff9800'
      }
      return cssObject;
    }

    vm.getBackgroundColor = function (color) {
      var cssObject = {
        "background-color" : color
      }

      return cssObject;
    }
    vm.changeCalendarView = function (whichView) {
      $("#sessionList .fc-toolbar .fc-right .fc-button-group .fc-button").css("background-color", "#FFFFFF");
      $('#btn' + whichView).css("background-color", "#cccccc");
      $('#calendar').fullCalendar('changeView', whichView);
    }

    vm.goToSessionBookingDetailsViaList = function (index) {
      var sessionStartDate = new Date($scope.productSessions[index].start).getTime().toString();
      $state.go('host.sessionDetails', {productSessionId: $scope.productSessions[index].sessionId,  sessionStartDate: sessionStartDate});
    }

    vm.goToSessionBookingDetailsViaCalendar = function (id) {
      var element = document.getElementById(id);
      var sessionId = element.getAttribute('sessionId');
      var sessionStartDate = element.getAttribute('sessionStartDate');
      sessionStartDate = new Date(sessionStartDate).getTime().toString();
      $state.go('host.sessionDetails', {productSessionId: sessionId, sessionStartDate:sessionStartDate});
    }
  }
}());
