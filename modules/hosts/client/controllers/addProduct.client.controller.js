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
    vm.productGrade = 'Easy';
    vm.pricingOptions = ['Everyone'];

    // Hashmaps and other methods won't optimize this as it is a constant time checking. So using two arrays 
    vm.availableMonths = [false, false, false, false, false, false, false, false, false, false, false, false];
    vm.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    vm.pricingParams = {
      Params: [{
        price: 0,
        description: '',
        minGroupSize: 0,
        maxGroupSize: 0,
        groupOption: 'Per Group',
        customLabel: '',
        seatsUsed: 0
      }]
    };

    vm.addPricingOption = function() {
      vm.pricingOptions.push('Everyone');
    }

    vm.save = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tourForm');
        return false;
      }

      vm.tour.isDraft = true;
      vm.tour.productGrade = vm.productGrade;

      // Available months
      vm.monthsStore = [];
      for(var index = 0; index < vm.availableMonths.length; index++) {
        if (vm.availableMonths[index] == true)
          vm.monthsStore.push(vm.monthNames[index]);
      }
      vm.tour.productMonthsAvailableForBoking = vm.monthsStore;

      // Pricing options
      vm.pricingOptionStore = [];
      if (vm.pricingParams[0] !== undefined) {
        for(var index = 0; index < vm.pricingOptions.length; index++) {
          var pricingInfo = {};
          pricingInfo[vm.pricingOptions[index]] = vm.pricingParams[index].Params;
          vm.pricingOptionStore.push(pricingInfo);
        }
        vm.tour.productPricingOptions = vm.pricingOptionStore;
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
