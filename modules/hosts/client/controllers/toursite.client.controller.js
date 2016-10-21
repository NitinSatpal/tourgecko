(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('ToursiteController', ToursiteController);

  ToursiteController.$inject = ['$scope', '$state', '$stateParams', '$http'];

  function ToursiteController($scope, $state, $stateParams, $http) {
    var vm = this;

    if ($stateParams.id !== null) {
      vm.toursite = $stateParams.id.userId;
      console.log(vm.toursite);
    } else {
      console.log('error');
    }
  }
}());
