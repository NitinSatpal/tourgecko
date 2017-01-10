(function () {
  'use strict';

  angular
    .module('guests')
    .controller('TourBookingController', TourBookingController)
    .filter('htmlData', function($sce) {
        return function(val) {
          return $sce.trustAsHtml(val);
        };
    });

  TourBookingController.$inject = ['$scope', '$state', '$http', '$location', 'Authentication'];

  function TourBookingController($scope, $state, $http, $location, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
    vm.seatQuantity = [];
    vm.addonQuantity = [];
    vm.calculatedSeatPrice = 0;
    vm.calculatedAddonPrice = 0;
    vm.totalPayablePrice = 0;

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    var departureDates = new Set();

    var productId = $location.path().split('/')[4];

    $http.get('/api/guest/product/' + productId).success(function (response) {
      vm.bookingProductDetails = response[0];

       $http.get('/api/guest/productSessions/' + productId).success(function (response) {
          vm.productSessions = response;
       }).error(function (response) {
          vm.error = response.message;
      });
    }).error(function (response) {
      vm.error = response.message;
    });


    vm.getDepartureDate = function (isoDate) {
      var date = new Date(isoDate);
      var displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();

      if (displayDate != 'undefined, NaN undefined NaN')
        departureDates.add(displayDate);
      return displayDate;
    }

    $scope.firstFiveDepartureDates = 5;
    $scope.getDepartureDates = function(num) {
      return new Array(num);   
    }

    vm.setSelectedDate = function (index) {
      vm.selectedDate = Array.from(departureDates)[index];
    }

    vm.setSelectedPricing = function (index) {
      if(vm.seatQuantity.length > 0)
        vm.seatQuantity.length = 0;
      vm.seatQuantity[index] = 1;

      vm.calculatedSeatPrice = parseInt(vm.bookingProductDetails.productPricingOptions[index].price);

      vm.totalPayablePrice = vm.calculatedSeatPrice + vm.calculatedAddonPrice;
    }

    vm.calculateSeatPrice = function (index) {
      vm.calculatedSeatPrice = parseInt(vm.bookingProductDetails.productPricingOptions[index].price) * vm.seatQuantity[index];
      vm.totalPayablePrice = vm.calculatedSeatPrice + vm.calculatedAddonPrice;
    }

    var addonTracker = new Set();
    vm.setSelectedAddonPricing = function (index) {
      if(!addonTracker.has(index)) {
        addonTracker.add(index);
        vm.addonQuantity[index] = 1;
      } else {
        addonTracker.delete(index);
        vm.addonQuantity[index] = '';
      }
      var addonSelected = Array.from(addonTracker);

      vm.calculatedAddonPrice = 0;
      for(var tracker = 0; tracker < addonSelected.length; tracker++)
        vm.calculatedAddonPrice = vm.calculatedAddonPrice + 
                                  parseInt(vm.bookingProductDetails.productAddons[addonSelected[tracker]].price) * 
                                  vm.addonQuantity[addonSelected[tracker]];

      vm.totalPayablePrice = vm.calculatedSeatPrice + vm.calculatedAddonPrice;
    }
  
    vm.calculateAddonPrice = function (index) {
      var addonSelected = Array.from(addonTracker);
      vm.calculatedAddonPrice = 0;
      console.log('2nd ' + addonSelected);
      for(var tracker = 0; tracker < addonSelected.length; tracker++)
        vm.calculatedAddonPrice = vm.calculatedAddonPrice + 
                                  parseInt(vm.bookingProductDetails.productAddons[addonSelected[tracker]].price) * 
                                  vm.addonQuantity[addonSelected[tracker]];
      vm.totalPayablePrice = vm.calculatedSeatPrice + vm.calculatedAddonPrice;
    }
  }
}());
