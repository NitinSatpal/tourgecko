(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('HostHomeController', HostHomeController);

  HostHomeController.$inject = ['$scope', '$state', '$window', '$http', 'Authentication', 'BookingService', 'MessageService', 'ProductSessionService'];

  function HostHomeController($scope, $state, $window, $http, Authentication, BookingService, MessageService, ProductSessionService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.bookings = BookingService.query();
    vm.messages = MessageService.query();
    vm.productSessions = ProductSessionService.query();
    vm.totalRevenue = 0;
    vm.bellNotifications = 0;

    var index = 0;
    for (index = 0; index < vm.bookings.length; index ++)
      vm.totalRevenue = vm.totalRevenue + vm.bookings[index].totalAmountPaid;

    for (index = 0; index < vm.messages.length; index ++) {
      if (vm.messages[index].messageRead === true)
        vm.bellNotifications = vm.bellNotifications + 1;
    }

    
    /* vm.goToHostWebsite = function() {
      var userName = vm.authentication.user.username;
      console.log(userName);
      $http.get('/api/host/toursite', { params: { 'username': userName } }).success(function (response) {
        if (response.toursite === null || response.toursite === '' || response.toursite === undefined) {
          alert('You did not provide touriste name at the time of registration. Pleas eupdate the same in your settings.');
        } else {
          $window.location.href = 'http://' + response.toursite + '.tourgecko.com:3000';
        }
      }).error(function (response) {
        vm.error = response.message;
      });
    }; */
  }
}());
