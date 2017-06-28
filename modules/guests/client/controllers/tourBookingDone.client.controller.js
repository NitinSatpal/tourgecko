(function () {
  'use strict';

  angular
    .module('guests')
    .controller('TourBookingDoneController', TourBookingDoneController)

  TourBookingDoneController.$inject = ['$stateParams', '$http', '$window', '$location'];

  function TourBookingDoneController($stateParams, $http, $window, $location) {
    // Initialize variables
    var vm = this;
    var paymentRequestId = $location.search().payment_request_id;
    var paymentId = $location.search().payment_id;
    var bodyData = {paymentRequestId: paymentRequestId, paymentId: paymentId};
    console.log($location.search().payment_id);
    console.log($location.search().payment_request_id);
    $http.post('/api/host/postpaymentevents/', bodyData).success(function (response) {
      console.log(response);
    }).error(function (error) {
      console.log(error);
    })
  }
}());
