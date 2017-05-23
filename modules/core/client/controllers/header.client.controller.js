(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', '$http', '$window', 'Authentication', '$location', 'menuService'];

  function HeaderController($scope, $state, $http, $window, Authentication, $location, menuService) {
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
      if($location.path() == '/settings/profile')
        $('#account-dropdown-menuitem0').addClass('activePElementForAccountDropdown');
      else
        $('#account-dropdown-menuitem0').removeClass('activePElementForAccountDropdown');
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
  }
}());