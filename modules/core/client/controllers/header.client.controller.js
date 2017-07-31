(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', '$http', '$window', 'Authentication', '$location', 'menuService', '$timeout'];

  function HeaderController($scope, $state, $http, $window, Authentication, $location, menuService, $timeout) {
    var vm = this;
    vm.authentication = Authentication;
    vm.hideHeader = false;
    vm.notifications = [];
    $scope.unreadNotificationCount = -1;
    vm.notificationSkipIndex = 0;

    $http.get('/api/notification/initialfetch/').success(function (response) {
      vm.notifications = response;
    });
    $http.get('/api/notification/unreadCount/').success(function (response) {      
      $scope.unreadNotificationCount = response.counterValue;
    });
    setInterval(function () {
      $http.get('/api/notification/initialfetch/').success(function (response) {
        vm.notifications = response;
      });
      $http.get('/api/notification/unreadCount/').success(function (response) {      
        $scope.unreadNotificationCount = response.counterValue;
      });
    }, 60000);
    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');
    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      if($location.path() == '/settings/profile')
        $('#account-dropdown-menuitem0').addClass('activePElementForAccountDropdown');
      else
        $('#account-dropdown-menuitem0').removeClass('activePElementForAccountDropdown');
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
      if (notificationId) {
        saveReadNotifications(notificationId);
      }
    }

    function saveReadNotifications (notificationId) {
      $http.post('/api/notification/markAsRead/' + notificationId).success(function (response) {
        $http.get('/api/notification/unreadCount/').success(function (response) {      
          $scope.unreadNotificationCount = response.counterValue;
          notificationId = null;
        });
      })
    }

    var notificationId;
    vm.markNotificationRead = function (index) {
      if($window.innerWidth <= 767)
        $("#notification-mobile-modal").click();
      notificationId = vm.notifications[index]._id;
      $('#notificationContainer').fadeOut('slow');
      vm.notifications[index].notificationRead = true;
      if (vm.notifications[index].notificationType == 'Booking Request')
        $state.go('host.bookingdetails', {bookingId: vm.notifications[index].bookingId});
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

    vm.showLoadersAndWaitCursor = function () {
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
    }
    vm.setWidthOFModalInCaseOfMobile = function() {
      $timeout(function () {
        $("#notification-mobile-item").css("width", $("#notification-mobile-content").outerWidth())
      },500)
    }
  }
}());