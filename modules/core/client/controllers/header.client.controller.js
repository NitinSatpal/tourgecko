(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', 'Authentication', '$location', 'menuService'];

  function HeaderController($scope, $state, Authentication, $location, menuService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.hideHeader = false;
    
    var headerWithoutSideNav = new Set();
    headerWithoutSideNav.add('/password/reset/success');
    headerWithoutSideNav.add('/');
    headerWithoutSideNav.add('/admin/home');
     headerWithoutSideNav.add('/forbidden');

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
    }

    vm.goToHomePage = function() {
      if ($state.$current.url.source !== '/')
        $state.go('abstractHome');
    };
  }
}());