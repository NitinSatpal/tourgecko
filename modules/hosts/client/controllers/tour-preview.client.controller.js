(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourPreviewController', TourPreviewController)
    .filter('htmlData', function($sce) {
        return function(val) {
          console.log(val);
          return $sce.trustAsHtml(val);
        };
    });

  TourPreviewController.$inject = ['$scope', '$state', '$window', '$http', 'Authentication'];

  function TourPreviewController($scope, $state, $window, $http, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
    var productId = $window.localStorage.getItem('productId');
    vm.productDetails;

    $http.get('/api/host/product/'+productId).success(function (response) {
      // And redirect to the Details page with the id of the user
      vm.productDetails = response[0];
      if(response[0].productPictureURLs.length != 0)
        vm.productMainImageURL = response[0].productPictureURLs[0].split('./')[1];
      $http.get('/api/host/company/').success(function (res) {
        // And redirect to the Details page with the id of the user
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
  }
}());
