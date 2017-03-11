(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('ToursiteController', ToursiteController);

  ToursiteController.$inject = ['$scope', '$state', '$stateParams', '$http'];

  function ToursiteController($scope, $state, $stateParams, $http) {
    var vm = this;

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    /*if ($stateParams.id !== null) {
      /* $http.get('/api/host/product/').success(function (response) {
          
        }).error(function (response) {
          vm.error = response.message;
        }); */
      // vm.toursite = $stateParams.id.userId;
    //} else {
      //console.log('error');
    //}
    $http.get('/api/host/toursitedata/' + $stateParams.toursite).success(function (response) {
        vm.toursitedata = response;
        vm.companyData = response[0].hostCompany;
        vm.userData = response[0].user;        
    }).error(function (response) {
      vm.error = response.message;
    });

    vm.getInquiryHours = function () {
      if (vm.companyData) {
        if (vm.companyData.inquiryTime == 'Anytime')
          return '(Anytime)';
        else
          return '(' + vm.companyData.inquiryTimeRangeFrom + ' ' + vm.companyData.inquiryTimeRangeTo + ')';
      }
    }

    vm.getProductTitleToshow = function (title) {
      if (title.length > 25)
        return title.slice(0,25) + ' ...';
      else
        return title;
    }

    vm.getProductDestinationToshow = function (destination) {
      if (destination.length > 25)
        return destination.slice(0,20) + ' ...';
      else
        return destination;
    }

    vm.getDepartureDateToShow = function (index) {
      if (vm.toursitedata[index].productAvailabilityType == 'Open Date')
        return 'Open Dated Tour';
      else {
        if (vm.toursitedata[index].productScheduledDates[0]) {
          var eventDate = new Date(vm.toursitedata[index].productScheduledDates[0]);
          eventDate = new Date(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate(),  eventDate.getUTCHours(), eventDate.getUTCMinutes(), eventDate.getUTCSeconds());

          var displayDate = /*weekdays[eventDate.getDay()] + ', ' + */ eventDate.getDate() + ' ' + months[eventDate.getMonth()] + ' ' + eventDate.getFullYear();
        }
        if (vm.toursitedata[index].productScheduledDates.length > 1) {
          var numberOfTours = vm.toursitedata[index].productScheduledDates.length - 1;
          var remainingDatesString;
          if (numberOfTours == 1)
            remainingDatesString = numberOfTours + ' more date';
          else
            remainingDatesString = numberOfTours + ' more dates';
          var tourDepartureString = ' and '  + remainingDatesString;
          return displayDate + tourDepartureString;
        }
        else
          return displayDate;
      }
    }

    vm.getStartingFromPrice =function (index) {
      if (vm.toursitedata[index].productAdvertisedprice)
        return vm.toursitedata[index].productAdvertisedprice;
      else
        return findMinimum(vm.toursitedata[index].productPricingOptions);
    }

    function findMinimum (pricingOptions) {
      var minimumTillNow = Number.POSITIVE_INFINITY;
      vm.priceTobeShown = -1;
      for (var index = 0; index < pricingOptions.length; index ++) {
        if (pricingOptions[index].price < minimumTillNow)
          minimumTillNow = pricingOptions[index].price;
        if(vm.priceTobeShown == -1) {
          if (pricingOptions[index].pricingType == 'Everyone' || pricingOptions[index].pricingType == 'Adult')
            vm.priceTobeShown = pricingOptions[index].price;
        }
      }
      if (minimumTillNow == 'Infinity')
        minimumTillNow = '';
      if (vm.priceTobeShown == -1)
        vm.priceTobeShown = minimumTillNow;

      vm.minimumTillNow = minimumTillNow;
      return minimumTillNow;
    }
  }
}());
