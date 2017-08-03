(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('HostHomeController', HostHomeController)
    .constant('mobileverificationServerResponseCodes', {
      "askForNewTokenGeneration" : "regenerateNew",
      "mobileVerificationSuccess" : "successfullyVerified",
      "mobileVerificationTokeMismatch" : "accountKeyMismatch",
      "mobileAlreadyVerified": "alreadyVerified"
    });

  HostHomeController.$inject = ['$scope', '$state', '$window', '$http', '$timeout', 'Authentication', 'PinboardPinService', 'PinboardGoalService', 'mobileverificationServerResponseCodes'];

  function HostHomeController($scope, $state, $window, $http, $timeout, Authentication, PinboardPinService, PinboardGoalService, mobileverificationServerResponseCodes) {
    var vm = this;
    vm.goalPinStatus = [];
    $window.localStorage.setItem('signingupUserEmail', 'NoEmailId');
    vm.sessionsFetched = false;
    var currentDate = new Date($('#calendar').fullCalendar('getDate'));     
    var uniqueStr = (currentDate.getMonth()).toString() + (currentDate.getUTCFullYear()).toString();
    vm.listViewMonthTitle = $('#calendar').fullCalendar('getView').title;
    $scope.productSessions;
    vm.authentication = Authentication;
    vm.messageCount = 0;
    $http.get('/api/host/bookingDetailsForAnalyticsAndLatestData/').success(function (response) {
      vm.bookings = response.bookings;
      vm.totalRevenue = response.totalRevenue;
    }).error(function (response){
    });
    $http.get('/api/host/companyproductscount/').success(function (response) {
      vm.productCount = response.count;
    }).error(function (response){
    });
    
    $http.get('/api/host/messageDetailsForAnalyticsAndLatestData/').success(function (response) {
      vm.messages = response.messages;
      vm.messageCount = response.messageCount;
    }).error(function (response){
    });

    $http.get('/api/host/companyproductsessionsForAnalyticsAndLatestData/').success(function (response) {
      vm.departuresCount = response.count;
      vm.departureSessions = response.departureSessions;
    }).error(function (response){
    });

    vm.noPinboardData = true;
    $http.get('/api/host/company/').success(function (response)  {
      vm.companyDetails = response[0];
      for (var index = 0; index < vm.companyDetails.pinboardGoals.length; index++) {
        if (!vm.companyDetails.pinboardGoals[index].isGoalCompleted) {
          vm.noPinboardData = false;
          break;
        }
      }
      for (var index = 0; index < vm.companyDetails.pinboardPins.length; index++) {
        if (!vm.companyDetails.pinboardPins[index].isPinCompleted) {
          vm.noPinboardData = false;
          break;
        }
      }
    }).error(function (response){
    });

    //vm.pinboardPins = PinboardPinService.query();
    //vm.pinboardGoals = PinboardGoalService.query();
    vm.pinboardDismissedMessagesId = [];
    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    var index = 0;
      
    vm.getPercentCompletionOfGoal = function (goal) {
      vm.percentCompletion = goal.completedPinsCounter / goal.pinsForthisGoal.length * 100;
      return 'p' + vm.percentCompletion;
    }

    vm.getDepartureDateOfBookings = function (index) {
      var displayDate;
      if (vm.bookings[index]) {
        if (vm.bookings[index].isOpenDateTour) {
          var date = new Date(vm.bookings[index].openDatedTourDepartureDate);
          displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
        } else {
          var date = new Date(vm.bookings[index].productSession.sessionDepartureDetails.startDate);          
          displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
        }
      } else
        displayDate = '';
      
      return displayDate;
    }

    vm.getDepartureDateOfSession = function (startDate) {
      var displayDate;
      var date = new Date(startDate);
      displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();

      return displayDate;
    }

    vm.getAvailabilityFigureForLatestSection = function (startDate, numberOfSeatsSession) {
      var key = new Date(startDate).getTime().toString();
      if (numberOfSeatsSession && numberOfSeatsSession[key])
        return numberOfSeatsSession[key];
      else
        return 0;
    }

    vm.dismissPinboardMessage = function (id, type, index) {
      if (type == 'pin') {
        vm.pinboardPins.splice(index, 1)
        $http.post('/api/host/pinboard/pins/dismiss', {pinId: id}).success(function (response) {
        }).error(function (response){
        });
      }
    }

    /* $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      if (vm.pinboardDismissedMessagesId.length > 0)
      $http.post('/api/host/pinboard/dismiss', vm.pinboardDismissedMessagesId).success(function (response) {

      }).error(function (response){

      });
    } */

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

    vm.clickThisElement = function (id) {
      $('#'+id).click();
      if (id == 'verifyAccountPhoneNumber') {
        $http.post('/api/host/verify/mobile').success(function (response) {
          
        }).error(function (response){
        });
      }
    }

    vm.getDynamicPadding = function () {
      var cssObjectOne = {
        "padding-top" : "5px"
      }
      var cssObjectTwo = {
        "padding-top" : "15px"
      }
      if (window.innerWidth <= 767) {
        return cssObjectOne;
      } else {
        return cssObjectTwo;
      }
    }

    vm.getDynamicMarginPinboardButtons = function () {
      var cssObjectOne = {
        "margin-top" : "55px"
      }
      var cssObjectTwo = {
        "margin-top" : "8px"
      }
      if (window.innerWidth <= 767) {
        return cssObjectOne;
      } else {
        return cssObjectTwo;
      }
    }

    vm.getDynamicMarginPinboardCompletion = function () {
      var cssObjectOne = {
        "margin-top" : "55px"
      }
      var cssObjectTwo = {
        "margin-top" : "-5px"
      }
      if (window.innerWidth <= 767) {
        return cssObjectOne;
      } else {
        return cssObjectTwo;
      }
    }
    

    vm.verifyMobileNumber = function (verificationCode) {
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      $('#initialMobileVerificationMessage').css('display', 'none');
      $('#regenerateNew').css('display', 'none');
      $('#successfullyVerified').css('display', 'none');
      $('#accountKeyMismatch').css('display', 'none');
      $http.get('/api/auth/mobileverification/' + verificationCode).success(function (response) {
          $('#initialMobileVerificationMessage').css('display', 'none');
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
          $('#' + mobileverificationServerResponseCodes[response]).css('display', 'block');
          if (response == 'mobileVerificationSuccess') {
            $timeout(function () {
              $state.reload();
              $('.modal-backdrop').remove();
            }, 2000);
          }
      }).error(function (response){
      });
    }

    vm.resendMobileVerificationKey = function () {
      $('#tourgeckoBody').addClass('waitCursor');
      $('#initialMobileVerificationMessage').css('display', 'block');
      $http.post('/api/host/reverify/mobile').success(function (response) {
        $('#loadingDivHostSide').css('display', 'block');
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }).error(function (response){
      });
    }

    vm.changeCalendarView = function (whichView) {
      $("#sessionList .fc-toolbar .fc-right .fc-button-group .fc-button").css("background-color", "#FFFFFF");
      $('#btn' + whichView).css("background-color", "#cccccc");
      $('#calendar').fullCalendar('changeView', whichView);
    }
    
    vm.goToBookingDetails = function (id) {
      $state.go('host.bookingdetails', {bookingId: id});
    }

    vm.goToSessionBookingDetailsViaList = function (index) {
      var sessionStartDate = new Date($scope.productSessions[index].start).getTime().toString();
      $state.go('host.sessionDetails', {productSessionId: $scope.productSessions[index].sessionId, sessionStartDate: sessionStartDate});
    }

    vm.goToSessionBookingDetailsViaLatestSection = function (session) {
      var sessionStartDate = new Date(session.startDate).getTime().toString();
      $state.go('host.sessionDetails', {productSessionId: session.sessionId, sessionStartDate: sessionStartDate});
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
