(function () {
  'use strict';

  angular
    .module('core')
    .controller('TourgeckoAdminCommonController', TourgeckoAdminCommonController);

  TourgeckoAdminCommonController.$inject = ['Authentication'];

  function TourgeckoAdminCommonController(Authentication) {
    var vm = this;
    vm.authentication = Authentication;
  }
}());