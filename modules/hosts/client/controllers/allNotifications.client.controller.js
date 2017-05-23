(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('NotificationsController', NotificationsController)
    .constant('monthNumberToName', {
      0: "January",
      1: "February",
      2: "March",
      3: "April",
      4: "May",
      5: "June",
      6: "July",
      7: "August",
      8: "September",
      9: "October",
      10: "November",
      11: "December"
    });

  NotificationsController.$inject = ['$state', '$scope', '$window', '$http', 'monthNumberToName'];

  function NotificationsController($state, $scope, $window, $http, monthNumberToName) {
    var vm = this;
    var monthFetched;
    var yearFetched;
    var tempDate = new Date();
    monthFetched = tempDate.getMonth();
    yearFetched = tempDate.getFullYear();

    vm.notificationListViewMonthTitle = monthNumberToName[monthFetched] + ' ' + yearFetched;
    $http.get('/api/notification/fetchAllNotifications/' + monthFetched + '/' + yearFetched).success(function (response) {
      vm.notifications = response;
      $('#loadingDivHostSide').css('display', 'none');
      $('#tourgeckoBody').removeClass('waitCursor');
    });


    vm.fetchNextMonthNotifications = function () {
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      if (monthFetched == 11) {
        monthFetched = 0;
        yearFetched = yearFetched + 1;
      } else {
        monthFetched = monthFetched + 1;
      }
      vm.notificationListViewMonthTitle = monthNumberToName[monthFetched] + ' ' + yearFetched;
      $http.get('/api/notification/fetchAllNotifications/' + monthFetched + '/' + yearFetched).success(function (response) {
        vm.notifications = response;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }

    vm.fetchPrevMonthNotifications = function () {
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      if (monthFetched == 0) {
        monthFetched = 11;
        yearFetched = yearFetched - 1;
      } else {
        monthFetched = monthFetched - 1;
      }
      vm.notificationListViewMonthTitle = monthNumberToName[monthFetched] + ' ' + yearFetched;
      $http.get('/api/notification/fetchAllNotifications/'+ monthFetched + '/' + yearFetched).success(function (response) {        
        vm.notifications = response;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }
    var notificationId;
    vm.markNotificationRead = function (index) {
      notificationId = vm.notifications[index]._id;
      vm.notifications[index].notificationRead = true;
      if (vm.notifications[index].notificationType == 'Booking Request')
        $state.go('host.bookingdetails', {bookingId: vm.notifications[index].bookingId});

      $http.post('/api/notification/markAsRead/' + notificationId).success(function (response) {
        $http.get('/api/notification/unreadCount/').success(function (response) {  
          angular.element('#mainHeader').scope().unreadNotificationCount =  response.counterValue;
          notificationId = null;
        });
      })
    }
    vm.getBackGroundColorAccordingTostatus = function (index) {
      var cssRead = {
        "background-color": "#fff"
      }
      var cssUnread = {
        "background-color": "#f7f7f7"
      }
      if(vm.notifications[index] && vm.notifications[index].notificationRead)
        return cssRead;
      else
        return cssUnread;
    }
  }
}());
