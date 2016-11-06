(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourListController', TourListController);

  TourListController.$inject = ['$scope', '$state', '$window', '$http', 'Authentication'];

  function TourListController($scope, $state, $window, $http, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
  }
}());
