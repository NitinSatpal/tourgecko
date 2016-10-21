(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$scope', '$state', '$http', '$location', '$stateParams'];

  function HomeController($scope, $state, $http, $location, $stateParams) {
    var vm = this;
  }
}());
