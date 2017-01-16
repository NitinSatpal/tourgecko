(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('HostHomeController', HostHomeController);

  HostHomeController.$inject = ['$scope', '$state', '$window', '$http', 'Authentication', 'BookingService', 'MessageService', 'NotificationService', 'ProductSessionService'];

  function HostHomeController($scope, $state, $window, $http, Authentication, BookingService, MessageService, NotificationService, ProductSessionService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.bookings = BookingService.query();
    vm.messages = MessageService.query();
    vm.notifications = NotificationService.query();
    vm.productSessions = ProductSessionService.query();
    vm.totalRevenue = 0;
    vm.bellNotifications = 0;

    var index = 0;
    for (index = 0; index < vm.bookings.length; index ++)
      vm.totalRevenue = vm.totalRevenue + vm.bookings[index].totalAmountPaid;

    for (index = 0; index < vm.messages.length; index ++) {
      if (vm.messages[index].messageRead == false)
        vm.bellNotifications = vm.bellNotifications + 1;
    }
  }
}());
