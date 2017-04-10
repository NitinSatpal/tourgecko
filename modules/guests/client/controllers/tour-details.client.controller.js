(function () {
  'use strict';

  angular
    .module('guests')
    .controller('TourDetailsController', TourDetailsController)
    .filter('htmlData', function($sce) {
        return function(val) {
          return $sce.trustAsHtml(val);
        };
    });

  TourDetailsController.$inject = ['$scope', '$state', '$window', '$http', '$location', 'Authentication'];

  function TourDetailsController($scope, $state, $window, $http, $location, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
    var productId = $location.path().split('/')[3];
    vm.productDetails;
    vm.productImageURLs = [];

    $('#tourgeckoBody').addClass('disableBodyWithoutPosition');
    $('#tourDetailsScreen').addClass('waitCursor');
    vm.showLoaderForTourDetails = true;

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    
    $http.get('/api/guest/product/' + productId).success(function (response) {
      vm.productDetails = response[0];
      vm.companyDetails = response[0].hostCompany;
      vm.productImageURLs = response[0].productPictureURLs
      $('#tourgeckoBody').removeClass('disableBodyWithoutPosition');
      $('#tourDetailsScreen').removeClass('waitCursor');
      vm.showLoaderForTourDetails = false;
    }).error(function (response) {
      vm.error = response.message;
    });

    vm.getHtmlTrustedData = function(htmlData){
      return $sce.trustAsHtml(htmlData);
    };

    vm.getMinimumPricing = function (productDetails) {
      if (productDetails)
        return findMinimum(productDetails);
      else {
        vm.priceTobeShown = '';
        return '';
      }
    }

    function findMinimum (productDetails) {
      vm.minimumTillNow = Number.POSITIVE_INFINITY;
      vm.priceTobeShown = -1;
      
      for (var index = 0; index < productDetails.productPricingOptions.length; index ++) {
        if (productDetails.productPricingOptions[index].price < vm.minimumTillNow)
          vm.minimumTillNow =  productDetails.productPricingOptions[index].price;
        
        if (productDetails.productPricingOptions[index].pricingType == 'Everyone' || productDetails.productPricingOptions[index].pricingType == 'Adult')
          vm.priceTobeShown = productDetails.productPricingOptions[index].price;
      }
      
      if (vm.minimumTillNow == 'Infinity')
        vm.minimumTillNow = '';
      if (vm.priceTobeShown == -1)
        vm.priceTobeShown = vm.minimumTillNow;

      if(productDetails.productAdvertisedprice !== undefined)
        return vm.productDetails.productAdvertisedprice;
      else
        return vm.minimumTillNow;      
    }

    vm.getDepartureDates = function (isoDate) {
      var date = new Date (isoDate);
      // date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
      var displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();

      return displayDate;
    }

    vm.getDynamicCSSForStripedTable = function (index) {
      var oddCSS = {
        "background-color" : "#fff",
      };
      var evenCSS = {
        "background-color" : "#eee",
      };
      if (index % 2 == 1)
        return oddCSS;
      else
        return evenCSS;
    }

    vm.setMarginDynamically = function () {
      if ($window.innerWidth <= 767) {
        var cssObject = {
          "margin-left": "0%",
          "margin-right": "3%"
        }
        return cssObject;
      } else {
        console.log('coming here');
        var cssObject = {
          "margin-left": "15%",
          "margin-right": "15%"
        }
        return cssObject;
      }
    }

    vm.getLoaderPositionForTourDetails = function () {
      var leftMargin = ($window.innerWidth - 34.297) / 2;
      var topMargin = ($window.innerHeight - 40) / 2;
      var cssObject = {
        "left" : leftMargin,
        "top" : topMargin,
        "color": '#ff9800'
      }
      return cssObject;
    }

    vm.goToBookingPage = function () {
      $('#bookTheTour').attr("data-target", '#askForLogin');
      // ui-sref="guest.booking({productId: vm.productDetails._id})" 
    }
  }
}());
