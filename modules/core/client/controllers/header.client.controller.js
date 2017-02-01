(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', '$http', 'Authentication', '$location', 'menuService', 'NotificationService', 'UnreadNotificationService'];

  function HeaderController($scope, $state, $http, Authentication, $location, menuService, NotificationService, UnreadNotificationService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.hideHeader = false;
    vm.notifications = NotificationService.query();
    vm.unreadNotifications = UnreadNotificationService.query();

    var headerWithoutSideNav = new Set();
    headerWithoutSideNav.add('/password/reset/success');
    headerWithoutSideNav.add('/');
    headerWithoutSideNav.add('/admin/home');
    headerWithoutSideNav.add('/forbidden');
    headerWithoutSideNav.add('/security/privacypolicy');
    headerWithoutSideNav.add('/not-found');

    var hideHeaderAndEditCSS = new Set();
    hideHeaderAndEditCSS.add('/host/tour/preview');

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');
    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
      if(hideHeaderAndEditCSS.has($location.path()) || $location.path().split('/')[3] == 'preview') {
        vm.hideHeader = true;
        $('#mainHeader').removeClass('leftMarginToHeader');
      } else {
        vm.hideHeader = false;
        if(headerWithoutSideNav.has($location.path()) || $location.path().split('/')[1] == 'guest') {
          $('#mainHeader').removeClass('leftMarginToHeader');
        } else {
          $('#mainHeader').addClass('leftMarginToHeader');
        }
      }
      if (notificationId) {
        saveReadNotifications(notificationId);
      }
    }

    function saveReadNotifications (notificationId) {
      $http.post('/api/notifications/markAsRead/'+notificationId).success(function (response) {
        vm.notifications = NotificationService.query();
        vm.unreadNotifications = UnreadNotificationService.query();
      })
    }

    vm.goToHomePage = function() {
      if ($state.$current.url.source !== '/')
        $state.go('abstractHome');
    };

    vm.changeCSSDynamically = function (index) {
      var css = {
        "background-color": "#ffffff"
      }
      if(vm.notifications[index] && vm.notifications[index].notificationRead)
        return css;
    }

    var notificationId;
    vm.markNotificationRead = function (index) {
      notificationId = vm.notifications[index]._id;
      $('#notificationContainer').fadeOut('slow');
      vm.notifications[index].notificationRead = true;
      if (vm.notifications[index].notificationType == 'Booking Request')
        $state.go('host.bookingdetails', {bookingId: vm.notifications[index].bookingId});
    }
  }
}());