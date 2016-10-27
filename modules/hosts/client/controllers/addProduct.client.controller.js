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
    vm.durationType = 'days';
    vm.productGrade = 'Easy';
    vm.productAvailabilityType = 'openDate';
    vm.productTimeSlotsAvailability = 'guestChoice';
    vm.productSeatsLimitType = 'limited';
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

    vm.addonParams = {
      params: [{
        name: '',
        price: '',
        applyAs: 'Per Booking',
        description: ''
      }]
    };

    vm.addPricingOption = function() {
      vm.pricingOptions.push('Everyone');
    };

    vm.addMoreAddons = function() {
      vm.addonParams.params.push({
        name: '',
        price: '',
        applyAs: 'Per Booking',
        description: ''
      });
    };

    vm.removeAddon = function(index) {
      if (vm.addonParams.params.length === 1)
        vm.isAddonAvailable = false;
      else
        vm.addonParams.params.splice(index, 1);
    };

    vm.save = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tourForm');
        return false;
      }

      vm.tour.isDraft = true;
      vm.tour.productGrade = vm.productGrade;
      vm.tour.productDurationType = vm.durationType;
      vm.tour.productAvailabilityType = vm.productAvailabilityType;
      vm.tour.productTimeSlotsAvailability = vm.productTimeSlotsAvailability;
      vm.tour.productSeatsLimitType = vm.productSeatsLimitType;

      // Available months
      vm.monthsStore = [];
      var index = 0;
      for (index = 0; index < vm.availableMonths.length; index++) {
        if (vm.availableMonths[index] === true)
          vm.monthsStore.push(vm.monthNames[index]);
      }
      vm.tour.productMonthsAvailableForBoking = vm.monthsStore;

      // Pricing options
      vm.pricingOptionStore = [];
      if (vm.pricingParams[0] !== undefined) {
        for (index = 0; index < vm.pricingOptions.length; index++) {
          var pricingInfo = {};
          pricingInfo[vm.pricingOptions[index]] = vm.pricingParams[index].Params;
          vm.pricingOptionStore.push(pricingInfo);
        }
        vm.tour.productPricingOptions = vm.pricingOptionStore;
      }

      vm.tour.productAddons = vm.addonParams.params;

      vm.tour.isDepositNeeded = vm.isDepositApplicable;

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
