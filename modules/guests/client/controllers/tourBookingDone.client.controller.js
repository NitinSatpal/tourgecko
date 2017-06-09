(function () {
  'use strict';

  angular
    .module('guests')
    .controller('TourBookingDoneController', TourBookingDoneController)

  TourBookingDoneController.$inject = ['$stateParams', '$http'];

  function TourBookingDoneController($stateParams, $http) {
    // Initialize variables
    var vm = this;
    var bodyData = {paymentRequestId: $stateParams.payment_request_id, paymentId: $stateParams.payment_id};

    $http.post('/api/host/postpaymentevents/', bodyData).success(function (response) {
      console.log(response);
    }).error(function (error) {
      console.log(error);
    })
  }
}());
