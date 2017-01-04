(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourPreviewController', TourPreviewController)
    .filter('htmlData', function($sce) {
        return function(val) {
          return $sce.trustAsHtml(val);
        };
    });

  TourPreviewController.$inject = ['$scope', '$state', '$window', '$http', 'Authentication'];

  function TourPreviewController($scope, $state, $window, $http, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
    var productId = $window.localStorage.getItem('productId');
    vm.productDetails;

    $http.get('/api/host/product/' + productId).success(function (response) {
      vm.productDetails = response[0];
      if(response[0].productPictureURLs.length != 0)
        vm.productMainImageURL = response[0].productPictureURLs[0].split('./')[1];
      $http.get('/api/host/company/').success(function (res) {
        vm.companyDetails = res[0];
      }).error(function (response) {
        vm.error = response.message;
      });
    }).error(function (response) {
      vm.error = response.message;
    });

    vm.getHtmlTrustedData = function(htmlData){
      return $sce.trustAsHtml(htmlData);
    };

    vm.getMinimumPricing = function (productDetails) {

      if(productDetails && productDetails.productAdvertisedprice !== undefined)
        return vm.productDetails.productAdvertisedprice;
      else {
        if (productDetails)
          return findMinimum(productDetails.productPricingOptions);
      }
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

      return minimumTillNow;
    }
  }
}());
