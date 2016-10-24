(function () {
  'use strict';

  angular
    .module('hosts', [])
    .controller('AddProductController', AddProductController);

  AddProductController.$inject = ['$scope', '$state', '$stateParams', '$http', 'tourResolve'];

  function AddProductController($scope, $state, $stateParams, $http, tour) {
    var vm = this;
    vm.tour = tour;
    vm.error = null;
    vm.form = {};
    vm.helpVisible = true;
    vm.isAddonAvailable = false;
    vm.isDepositApplicable = false;
    vm.isAvailableThroughoutTheYear = true;

    vm.save = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tourForm');
        return false;
      }

      vm.tour.isDraft = true;
      vm.tour.$save(successCallback, errorCallback);
      
      function successCallback(res) {
        $state.go('host.hostHome');
      }

      function errorCallback(res) {
        console.log(res.data.message);
        vm.error = res.data.message;
      }
    };

    vm.create = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tourForm');
        return false;
      }

      vm.tour.$save(successCallback, errorCallback);
      
      function successCallback(res) {
        $state.go('host.hostHome');
      }

      function errorCallback(res) {
        console.log(res.data.message);
        vm.error = res.data.message;
      }
    };
  }
}());
