(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$scope', '$state', '$http', '$location', 'Authentication', '$stateParams'];

  function HomeController($scope, $state, $http, $location, Authentication, $stateParams) {
    var vm = this;
    vm.authentication = Authentication;
  }
}());
