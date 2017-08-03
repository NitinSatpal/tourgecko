(function () {
  'use strict';

  angular
    .module('core')
    .controller('LegalController', LegalController);

  LegalController.$inject = ['Authentication'];

  function LegalController(Authentication) {
    var vm = this;
    vm.authentication = Authentication;
  }
}());