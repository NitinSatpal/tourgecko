(function () {
  'use strict';

  angular
    .module('guests', [])
    .controller('GuestHomeController', GuestHomeController);

  GuestHomeController.$inject = [];

  function GuestHomeController() {
    var vm = this;
  }
}());
