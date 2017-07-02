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

    $http.post('/api/host/postpaymentevents/', bodyData).success(function (response) {
      // success
    }).error(function (error) {
      console.log(error);
    });


    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    $http.get('/api/host/postbooking/'+ paymentRequestId).success(function (response) {
      vm.specificBookingDetails = response;
      vm.companyData= response.hostCompany;
      var duration;
      if(!vm.specificBookingDetails.isOpenDateTour) {
        var startDate = new Date(vm.specificBookingDetails.productSession.sessionDepartureDetails.startDate);
        var endDate = new Date(vm.specificBookingDetails.productSession.sessionDepartureDetails.startDate);
        if (vm.specificBookingDetails.product.productDurationType == 'Days')
          duration = vm.specificBookingDetails.product.productDuration;
        else
          duration = 1;
        endDate =  new Date(endDate.setDate(endDate.getDate() + duration - 1));

        vm.startDateOfTheBooking = weekdays[startDate.getDay()] + ', ' + startDate.getDate() + ' ' + months[startDate.getMonth()] + ' ' + startDate.getFullYear();
        vm.endDateOfTheBooking = weekdays[endDate.getDay()] + ', ' + endDate.getDate() + ' ' + months[endDate.getMonth()] + ' ' + endDate.getFullYear();
      } else {
        vm.startDateOfTheBooking = vm.specificBookingDetails.openDatedTourDepartureDate
      }


      vm.bookingOptionsSelected = vm.specificBookingDetails.selectedpricingoptionindexandquantity;
      vm.addonOptionsSelected = vm.specificBookingDetails.selectedaddonoptionsindexandquantity;

      vm.calculatedSeatPriceForselectedBookingOptions = vm.specificBookingDetails.selectedpricingoptionindexandprice;
      vm.calculatedAddonPriceForSelectedAddonOptions = vm.specificBookingDetails.selectedaddonoptionsindexandprice;
      if(vm.specificBookingDetails.isOpenDateTour)
        vm.validPricingOptions = vm.specificBookingDetails.product.productPricingOptions;
      else if (vm.specificBookingDetails.productSession.isSessionPricingValid)
        vm.validPricingOptions = vm.specificBookingDetails.productSession.sessionPricingDetails;
      else
        vm.validPricingOptions = vm.specificBookingDetails.product.productPricingOptions;
    });


    vm.getInquiryHours = function () {
      if (vm.companyData) {
        if (vm.companyData.inquiryTime == 'Anytime')
          return '(24 hours)';
        else
          return vm.companyData.inquiryTimeRangeFrom + ' to ' + vm.companyData.inquiryTimeRangeTo;
      }
    }

    vm.goToHostSocialSite = function (socialSite) {
      if (socialSite == 'facebook') {
        if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.facebook && vm.companyData.hostSocialAccounts.facebook != "")
          $window.location = 'https://www.facebook.com/' + vm.companyData.hostSocialAccounts.facebook;
        else {
          toasty.error({
            title: 'Not available!',
            msg: 'Host has not provided Facebook details!',
            sound: false
          });
        }

      } else if (socialSite == 'twitter') {
        if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.twitter && vm.companyData.hostSocialAccounts.twitter != "")
          $window.location = 'https://www.twitter.com/' + vm.companyData.hostSocialAccounts.twitter;
        else {
          toasty.error({
            title: 'Not available!',
            msg: 'Host has not provided Twitter details!',
            sound: false
          });
        }
      } else {
        if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.instagram && vm.companyData.hostSocialAccounts.instagram != "")
          $window.location = 'https://www.instagram.com/' + vm.companyData.hostSocialAccounts.instagram;
        else {
          toasty.error({
            title: 'Not available!',
            msg: 'Host has not provided Instagram details!',
            sound: false
          });
        }

      }
    }

    vm.checkIfTheBookingOptionIsSelected = function (index) {
      if (parseInt(vm.bookingOptionsSelected[index]) > 0 && vm.bookingOptionsSelected[index] != 'Please Select')
        return true;
      else
        return false;
    }

    vm.areAddonsSelected = function () {
      if (vm.specificBookingDetails) {
        for (var index = 0; index < vm.addonOptionsSelected.length; index ++ ) {
          if (vm.addonOptionsSelected[index] > 0)
            return true;
        }
      }
      return false;
    }
  }
}());
