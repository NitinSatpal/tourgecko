(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourDetailsController', TourDetailsController);

  TourDetailsController.$inject = ['$scope', '$state', '$window', '$http', 'Authentication'];

  function TourDetailsController($scope, $state, $window, $http, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
    var productId = $window.localStorage.getItem('productId');
    vm.productDetails;

    $http.get('/api/host/product/'+productId).success(function (response) {
        // And redirect to the Details page with the id of the user
        vm.productDetails = response;
      }).error(function (response) {
        vm.error = response.message;
      });

  }
}());
