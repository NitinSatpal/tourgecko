(function () {
  'use strict';

  angular
    .module('core')
    .controller('FooterController', FooterController);

  FooterController.$inject = ['$scope', '$state', 'Authentication', 'menuService'];

  function FooterController($scope, $state, Authentication, menuService) {
    var vm = this;

  }
}());