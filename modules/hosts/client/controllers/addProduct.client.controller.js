(function () {
  'use strict';

  angular
    .module('hosts', [])
    .controller('AddProductController', AddProductController);

  AddProductController.$inject = ['$scope', '$state', '$stateParams', '$http', '$timeout', 'tourResolve', 'Upload'];

  function AddProductController($scope, $state, $stateParams, $http, $timeout, tour, Upload) {
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
    vm.timeslots = [];
    vm.productSeatsLimitType = 'limited';
    vm.pricingOptions = ['All'];
    vm.imageFileSelected = false;
    vm.mapFileSelected = false;
    vm.showProgressbar = false;
    vm.addMorePhotos = false;
    vm.productPictureURLs = [];
    vm.productMapURLs = [];

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

    vm.timeslotParams = {
      params: [{
        timeslot: ''
      }]
    };

    vm.addPricingOption = function() {
      vm.pricingOptions.push('All');
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

    vm.addMoreTimeslots = function() {
      vm.timeslotParams.params.push({
        timeslot: ''
      });
    };

    vm.removeTimeslots = function(index) {
      vm.timeslotParams.params.splice(index, 1);
    };

    vm.save = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tourForm');
        return false;
      }
      
      vm.tour.isDraft = true;
      
      setProductInformation();

      vm.tour.$save(successCallback, errorCallback);

      function successCallback(res) {
        $state.go('host.hostHome');
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    };

    vm.create = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tourForm');
        return false;
      }

      setProductInformation();
      
      vm.tour.$save(successCallback, errorCallback);

      function successCallback(res) {
        $state.go('host.hostHome');
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    };

    function setProductInformation() {
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

      vm.tour.productTimeSlots = vm.timeslotParams.params;

      vm.tour.productPictureURLs = vm.productPictureURLs;

      vm.tour.productMapURLs = vm.productMapURLs;
    }

    vm.uploadImage = function (dataUrl, name) {
      vm.success = vm.error = null;
      vm.showImageProgressbar = true;
      
      Upload.upload({
        url: 'api/product/productPicture',
        data: {
          newProductPicture: Upload.dataUrltoBlob(dataUrl, name)
        }
      }).then(function (response) {
        $timeout(function () {
          onSuccessItem(response.data, 'image');
        }, 3000);
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      }, function (evt) {
        vm.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      });
    };

    vm.uploadMap = function (dataUrl, name) {
      vm.success = vm.error = null;
      vm.showMapProgressbar = true;
      
      Upload.upload({
        url: 'api/product/productMap',
        data: {
          newProductMap: Upload.dataUrltoBlob(dataUrl, name)
        }
      }).then(function (response) {
        $timeout(function () {
          onSuccessItem(response.data, 'map');
        }, 3000);
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      }, function (evt) {
        vm.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      });
    };

    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(response, pictureType) {
      // Show success message
      vm.success = true;
      // hide progressbar
      vm.showProgressbar = false;

      if (pictureType == 'image') {
        // Reset form
        vm.imageFileSelected = false;
        $scope.picFile = '';
        vm.showImageProgressbar = false;

        //change label
        vm.addMorePhotos = true;

        // add uploaded image urls to database
        vm.productPictureURLs.push(response);
      } else {
        // Reset form
        vm.mapFileSelected = false;
        $scope.mapFile = '';
        vm.showMapProgressbar = false;

        // add uploaded map urls to database
        vm.productMapURLs.push(response);
      }
      
    }

    // Called after the user has failed to uploaded a new picture
    function onErrorItem(response, pictureType) {
      if (pictureType == 'image') {
        // Reset form
        vm.imageFileSelected = false;
      } else {
        // Reset form
        vm.mapFileSelected = false;
      }

      // Show error message
      vm.error = response.message;
    }

    vm.cancelSelection = function(pictureType) {
      if (pictureType == 'image') {
        // Reset form
        vm.imageFileSelected = false;
        $scope.picFile = '';
      } else {
        // Reset form
        vm.mapFileSelected = false;
        $scope.mapFile = '';
      }
      
    }
  }
}());
