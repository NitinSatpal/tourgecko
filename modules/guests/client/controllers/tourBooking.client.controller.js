(function () {
  'use strict';

  angular
    .module('guests')
    .controller('TourBookingController', TourBookingController)
    .filter('htmlData', function($sce) {
        return function(val) {
          return $sce.trustAsHtml(val);
        };
    })
    .constant('bookingErrorContentData', {
      "firstName" : "First Name cannot be blank",
      "lastName" : "Last Name cannot be blank",
      "guestEmailRequired" : "Email cannot be blank",
      "guestEmailValidity" : "Email is not valid",
      "guestMobileRequired" : "Mobile cannot be blank",
      "guestMobileValidity" : "Mobile number is not valid",
      "bookingOption" : "Please select booking option to proceed further",
      "dateSelection" : "Please select departure date first as prices shown on next screen may vary according to the date selected"
    });

  TourBookingController.$inject = ['$scope', '$state', '$http', '$location', '$window', '$timeout', 'Authentication', 'toasty', 'bookingErrorContentData'];

  function TourBookingController($scope, $state, $http, $location, $window, $timeout, Authentication, toasty, bookingErrorContentData) {
    // Initialize variables
    var vm = this;
    vm.authentication = Authentication;
    vm.totalCalculatedSeatPrice = 0;
    vm.totalcalculatedAddonPrice = 0;
    vm.totalPayablePrice = 0;
    vm.selectedBookingOptionIndex = 0;
    $scope.paymentGateway = '';
    vm.pricingOptionIndexAndQuantity = [];
    vm.addonOptionIndexAndQuantity = [];
    vm.calculatedSeatPriceForselectedBookingOptions = [];
    vm.calculatedAddonPriceForSelectedAddonOptions = [];
    vm.errorContent = [];
    vm.agreedToTermsAndConditions = false;

    // For now allowing all the numbers starting from 1 and just checking 10 digits for Indian mobile numbers. We can become more
    // strcit and just allow number starting from 7, 8, 9 as in India number series starts only from these numbers.
    $scope.regExForMobileValidity = '^[1-9][0-9]{9}$';

    var productSessionIds = [];
    var tourType;

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    var monthToNumber = new Map();
    monthToNumber.set('january', 0);
    monthToNumber.set('february', 1);
    monthToNumber.set('march', 2);
    monthToNumber.set('april', 3);
    monthToNumber.set('may', 4);
    monthToNumber.set('june', 5);
    monthToNumber.set('july', 6);
    monthToNumber.set('august', 7);
    monthToNumber.set('september', 8);
    monthToNumber.set('october', 9);
    monthToNumber.set('november', 10);
    monthToNumber.set('december', 11);

    var departureDates = new Map();

    // Get the product id
    var productId = $location.path().split('/')[4];

    // Fetch product data from database
    $http.get('/api/guest/product/' + productId).success(function (response) {
      vm.bookingProductDetails = response[0];
      $http.get('/api/host/product/productsession/' + productId).success(function (response) {
        vm.sessionsOfThisProduct = response;
      }).error(function(response) {
        vm.error = response.message;
        $('#loadingDivTourBooking').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
      vm.companyData = response[0].hostCompany;
      if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.facebook && vm.companyData.hostSocialAccounts.facebook != "")
        vm.facebookLink = 'https://www.facebook.com/' + vm.companyData.hostSocialAccounts.facebook;
      if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.twitter && vm.companyData.hostSocialAccounts.twitter != "")
        vm.twitterLink = 'https://www.twitter.com/' + vm.companyData.hostSocialAccounts.twitter;
      if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.instagram && vm.companyData.hostSocialAccounts.instagram != "")
        vm.instagramLink = 'https://www.instagram.com/' + vm.companyData.hostSocialAccounts.instagram;
      if (vm.bookingProductDetails == 'No tour found with this id') {
        vm.error = response;
        $('#tourBookingScreen').hide();
        return;
      }
      // product title is required in embedded javascript, hence save it in scope variable
      $scope.productTitle = vm.bookingProductDetails.productTitle;
      tourType = vm.bookingProductDetails.productAvailabilityType;

      $scope.bookingNotAllowedMonths = new Set();
      if (vm.bookingProductDetails.productUnavailableMonths) {
        for (var index = 0; index < vm.bookingProductDetails.productUnavailableMonths.length; index++)
          $scope.bookingNotAllowedMonths.add(monthToNumber.get(vm.bookingProductDetails.productUnavailableMonths[index]));
      }
      
      $('#loadingDivTourBooking').css('display', 'none');
      $('#tourgeckoBody').removeClass('waitCursor');
    }).error(function (response) {
      vm.error = response.message;
      $('#loadingDivTourBooking').css('display', 'none');
      $('#tourgeckoBody').removeClass('waitCursor');
    });
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* convert iso date to the date which has to be shown to the user. It will be called from embedded javascript aslo, hence
    function is at scope level */
/* ------------------------------------------------------------------------------------------------------------------------- */
    $scope.getDepartureDate = function (isoDate, index) {
      var date = new Date(isoDate);
      var displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
      if (displayDate != 'undefined, NaN undefined NaN')
        departureDates.set(index, displayDate);
      return displayDate;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* convert iso date to the date which has to be shown to the user. It will be called from embedded javascript aslo, hence
    function is at scope level, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */



/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Get the option array for ng-repeat of group and custom pricing */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.getRepeaterIndexForGroupAndCustomPricing = function(min, max) {
      var groupPricingArr = [];
      for (var index = min; index <= max; index ++)
        groupPricingArr.push(index);
      return groupPricingArr;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Get the option array for ng-repeat of group and custom pricing, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* save selected date in case of fixed dated tours */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.setSelectedDate = function (index) {
      vm.selectedDate = departureDates.get(index);
      vm.selectedBookingOptionIndex = index;
      vm.showErrorsOnTopOfStep1 = false;

      for (var index = 0; index < vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].sessionPricingDetails.length; index ++) {
        if (vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].sessionPricingDetails[index].pricingType != 'Custom'
          && vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].sessionPricingDetails[index].pricingType != 'Group')
          vm.pricingOptionIndexAndQuantity[index] = 0;
        else
          vm.pricingOptionIndexAndQuantity[index] = 'Please Select';
      }

      for (var index = 0; index < vm.bookingProductDetails.productAddons.length; index++)
        vm.addonOptionIndexAndQuantity[index]  = 0;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* save selected date in case of fixed dated tours, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */
    

/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Validation function */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.validateData = function (stepNumberFrom, stepNumberTo) {
      if (stepNumberFrom == 1 && !vm.selectedDate) {
        vm.errorContent.length = 0;
        console.log(bookingErrorContentData['dateSelection']);
        vm.errorContent.push(bookingErrorContentData['dateSelection']);
        console.log(vm.errorContent);
        vm.showErrorsOnTopOfStep1 = true;
        return false;
      } else if (stepNumberFrom == 2 && vm.totalCalculatedSeatPrice == 0) {
        vm.errorContent.length = 0;
        vm.errorContent.push(bookingErrorContentData['bookingOption']);
        vm.showErrorsOnTopOfStep2 = true;
        return false;
      } else if (stepNumberFrom == 3 && !getGuestDetailsValidity()) {
        vm.errorContent.length = 0;
        if (!vm.bookingForm.$valid) {
          if(vm.bookingForm.firstName.$error.required)
            vm.errorContent.push(bookingErrorContentData['firstName']);
          if(vm.bookingForm.lastName.$error.required)
            vm.errorContent.push(bookingErrorContentData['lastName']);
          if(vm.bookingForm.email.$error.required)
            vm.errorContent.push(bookingErrorContentData['guestEmailRequired']);
          if(vm.bookingForm.email.$error.email)
            vm.errorContent.push(bookingErrorContentData['guestEmailValidity']);
          if(vm.bookingForm.mobile.$error.required)
            vm.errorContent.push(bookingErrorContentData['guestMobileRequired']);
          if(vm.bookingForm.mobile.$error.pattern)
            vm.errorContent.push(bookingErrorContentData['guestMobileValidity']);

          vm.showErrorsOnTopOfStep3 = true;
          $scope.$broadcast('show-errors-check-validity', 'vm.bookingForm');
          return false;
        }
        alert('All the details in this page are mandatory');
        return false;
      }
      $('#fixedDepartureStep'+stepNumberFrom).removeClass('host-guest-common-style-btn');
      $('#fixedDepartureStep'+stepNumberFrom).addClass('host-guest-common-style-default-btn');
      $('#fixedDepartureStep'+stepNumberTo).removeClass("host-guest-common-style-default-btn");
      $('#fixedDepartureStep'+stepNumberTo).addClass("host-guest-common-style-btn");
      if(stepNumberTo == 4)
        setTheEndDateOfTheTour()
      $('#fixedDepartureStep'+stepNumberTo).click();
      return true;
    }

    function getGuestDetailsValidity () {
      if (!vm.providedGuestDetails || vm.providedGuestDetails.firstName == undefined || vm.providedGuestDetails.firstName == '' || vm.providedGuestDetails.lastName == undefined
        || vm.providedGuestDetails.lastName == '' || vm.providedGuestDetails.email == undefined || vm.providedGuestDetails.email == ''
        || vm.providedGuestDetails.mobile == undefined || vm.providedGuestDetails.mobile == '')
        return false;

      return true;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* validation function, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Go to previous step in smartwizard */
/* ------------------------------------------------------------------------------------------------------------------------- */
vm.goToPreviousAndChangeCSS = function (stepNumberFrom, stepNumberTo) {
  $('#fixedDepartureStep'+stepNumberFrom).removeClass('host-guest-common-style-btn');
  $('#fixedDepartureStep'+stepNumberFrom).addClass('host-guest-common-style-default-btn');
  $('#fixedDepartureStep'+stepNumberTo).removeClass("host-guest-common-style-default-btn");
  $('#fixedDepartureStep'+stepNumberTo).addClass("host-guest-common-style-btn");
  $('#fixedDepartureStep'+stepNumberTo).click();
}

/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Go to previous step in smartwizard, ends here*/
/* ------------------------------------------------------------------------------------------------------------------------- */

var totalSeatsForThisBooking = 0;
var totalAddonForThisBooking= 0;

vm.changeSeatsForNonGroupAndCustomOption = function (index, behavior) {
  if (behavior == 'decrement') {
    if (vm.pricingOptionIndexAndQuantity[index] == 0) {
      toasty.error({
        title: 'Minimum value reached',
        msg: 'Value cannot be negative',
        sound: false
      });
      return;
    }
    vm.pricingOptionIndexAndQuantity[index] = vm.pricingOptionIndexAndQuantity[index] - 1;
  } else {
    vm.pricingOptionIndexAndQuantity[index] = vm.pricingOptionIndexAndQuantity[index] + 1;
  }
  calculatePrice();
}


vm.calculatePriceForNonGroupAndCustomOption = function () {
  calculatePrice();
}
vm.calculatePriceForCustomOption = function () {
  calculatePrice();
}

vm.calculatePriceForGroupOption = function () {
  calculatePrice();
}

function calculatePrice () {
  vm.showErrorsOnTopOfStep2 = false;
  vm.totalCalculatedSeatPrice = 0;
  vm.totalPayablePrice = 0;
  totalSeatsForThisBooking = 0;
  for (var index = 0; index < vm.pricingOptionIndexAndQuantity.length; index ++) {
    if (parseInt(vm.pricingOptionIndexAndQuantity[index]) > 0 && vm.pricingOptionIndexAndQuantity[index] != 'Please Select') {
      totalSeatsForThisBooking = totalSeatsForThisBooking + parseInt(vm.pricingOptionIndexAndQuantity[index]);
      if (vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].sessionPricingDetails[index].pricingType != 'Group'
        || (vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].sessionPricingDetails[index].pricingType == 'Group'
          && vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].sessionPricingDetails[index].groupOption == 'Per Person')) {
        vm.totalCalculatedSeatPrice = vm.totalCalculatedSeatPrice +  (parseInt(vm.pricingOptionIndexAndQuantity[index]) * parseInt(vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].sessionPricingDetails[index].price));
        vm.calculatedSeatPriceForselectedBookingOptions[index] = parseInt(vm.pricingOptionIndexAndQuantity[index]) * parseInt(vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].sessionPricingDetails[index].price);
    }
      else {
        vm.totalCalculatedSeatPrice = vm.totalCalculatedSeatPrice + parseInt(vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].sessionPricingDetails[index].price);
        vm.calculatedSeatPriceForselectedBookingOptions[index] = parseInt(vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].sessionPricingDetails[index].price);
      }
    }
  }
  calculateAddonPrice();
}

vm.changeAddonsQuantity = function (index, behavior) {
  if (totalSeatsForThisBooking == 0) {
    toasty.error({
        title: 'Seat selection required',
        msg: 'Please select mandatory seats before selecting optional addons',
        sound: false
      });
      return;
  }
  if (behavior == 'decrement') {
    if (vm.addonOptionIndexAndQuantity[index] == 0) {
      toasty.error({
        title: 'Minimum value reached',
        msg: 'Value cannot be negative',
        sound: false
      });
      return;
    }
    vm.addonOptionIndexAndQuantity[index] = vm.addonOptionIndexAndQuantity[index] - 1;
  } else {
    if (vm.addonOptionIndexAndQuantity[index] == 1 && vm.bookingProductDetails.productAddons[index].applyAs == 'Per Booking') {
      toasty.error({
        title: 'Maximum value reached',
        msg: "Quantity of 'Per Booking' Addons cannot be greater than 1",
        sound: false
      });
      return;
    }
    vm.addonOptionIndexAndQuantity[index] = vm.addonOptionIndexAndQuantity[index] + 1;
  }
  calculateAddonPrice();
}

vm.calculatePriceForAddons = function (index) {
  if (totalSeatsForThisBooking == 0) {
    toasty.error({
        title: 'Seat selection required',
        msg: 'Please select mandatory seats before selecting optional addons',
        sound: false
      });
    vm.addonOptionIndexAndQuantity[index] = 0;
    return;
  }
  calculateAddonPrice();
}


function calculateAddonPrice () {
  if (totalSeatsForThisBooking == 0) {
    toasty.error({
        title: 'Seat selection required',
        msg: 'You have removed all the selected seats. All selected addons are removed.',
        sound: false
      });
    for (var index = 0; index < vm.addonOptionIndexAndQuantity.length; index++)
      vm.addonOptionIndexAndQuantity[index] = 0;
    return;
  }
  vm.totalcalculatedAddonPrice = 0;
  vm.totalPayablePrice = 0;
  for (var index = 0; index < vm.addonOptionIndexAndQuantity.length; index++) {
    if (parseInt(vm.addonOptionIndexAndQuantity[index]) > 0) {
      totalAddonForThisBooking = totalAddonForThisBooking + parseInt(vm.addonOptionIndexAndQuantity[index]);
      if (vm.bookingProductDetails.productAddons[index].applyAs == 'Per Seat') {
        vm.totalcalculatedAddonPrice = vm.totalcalculatedAddonPrice + parseInt(vm.addonOptionIndexAndQuantity[index]) * totalSeatsForThisBooking * parseInt(vm.bookingProductDetails.productAddons[index].price);
        vm.calculatedAddonPriceForSelectedAddonOptions[index] = parseInt(vm.addonOptionIndexAndQuantity[index]) * totalSeatsForThisBooking * parseInt(vm.bookingProductDetails.productAddons[index].price);
      }
      else if (vm.bookingProductDetails.productAddons[index].applyAs == 'Per Booking') {
        vm.totalcalculatedAddonPrice = vm.totalcalculatedAddonPrice + parseInt(vm.bookingProductDetails.productAddons[index].price);
        vm.calculatedAddonPriceForSelectedAddonOptions[index] = parseInt(vm.bookingProductDetails.productAddons[index].price);
      }
      else {
        vm.totalcalculatedAddonPrice = vm.totalcalculatedAddonPrice + parseInt(vm.addonOptionIndexAndQuantity[index]) * parseInt(vm.bookingProductDetails.productAddons[index].price);
        vm.calculatedAddonPriceForSelectedAddonOptions[index] = parseInt(vm.addonOptionIndexAndQuantity[index]) * parseInt(vm.bookingProductDetails.productAddons[index].price);
      }
    }
  }
  vm.totalPayablePrice = vm.totalCalculatedSeatPrice + vm.totalcalculatedAddonPrice;
}


function setTheEndDateOfTheTour () {
  var duration;
  if (vm.bookingProductDetails.productDurationType == 'Days')
    duration = vm.bookingProductDetails.productDuration;
  else
    duration = 1;

  var date = new Date(vm.selectedDate);
  date = new Date (date.setDate(date.getDate() + duration - 1));
  vm.endDateOFTheTour = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}

vm.checkIfTheBookingOptionIsSelected = function (index) {
  if (parseInt(vm.pricingOptionIndexAndQuantity[index]) > 0 && vm.pricingOptionIndexAndQuantity[index] != 'Please Select')
    return true;
  else
    return false;
}
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Booking object creation function */
/* ------------------------------------------------------------------------------------------------------------------------- */
  function createBookingObject () {
      var bookingObject = {};
      bookingObject.providedGuestDetails = vm.providedGuestDetails;
      bookingObject.product = vm.bookingProductDetails._id;
      bookingObject.hostOfThisBooking = vm.bookingProductDetails.user;
      if (tourType == 'Open Date') {
        bookingObject.isOpenDateTour = true;
        bookingObject.openDatedTourDepartureDate = vm.selectedDate;
        bookingObject.productSession = null;
      } else {
        bookingObject.isOpenDateTour = false;
        bookingObject.productSession = productSessionIds[vm.selectedBookingOptionIndex];
      }
      
      bookingObject.numberOfSeats = totalSeatsForThisBooking;
      bookingObject.numberOfAddons = 
      bookingObject.actualSessionDate = new Date(vm.selectedDate).getTime();
      // There is no discount for now. So Always zero
      bookingObject.totalDiscount = 0;
      // For now keep deposit zero, but need to handle this when payment option is integrated
      bookingObject.depositPaid = 0;
      // For now assign the calculated amount, but need to handle this when payment option is integrated as user can opt to pay only deposit.
      // Or may be some tours do not ask upfront payment
      bookingObject.totalAmountPaid = vm.totalPayablePrice;
      bookingObject.totalAmountPaidForProduct = vm.totalCalculatedSeatPrice;
      bookingObject.totalAmountPaidForAddons = vm.totalcalculatedAddonPrice;
      bookingObject.paymentMode = 'tourgecko Wallet';

      var bookingData = {bookingDetails: bookingObject, productData: vm.bookingProductDetails}

      /*$http.post('/api/host/booking', bookingData).success(function (response) {
        $state.go('guest.bookingDone');
      }).error(function (response) {
        vm.error = response.message;
      });*/
      return bookingData;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Booking object creation function, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */

    vm.makePaymentForTheBooking = function () {
      if (!vm.agreedToTermsAndConditions) {
        toasty.error({
          title: "Please read and agree to 'terms and conditions' before proceeding further",
          msg: "",
          sound: false
        });
        return;
      }
      if (vm.bookingProductDetails.hostCompany.paymentGateway == 'instamojo') {
        var bookingData = createBookingObject();
        $http.post('/api/payment/instamojo/', bookingData).success (function (response) {
          // $("a.im-checkout-btn.btn--light").attr('href', response);
          Instamojo.open(response)
          //document.getElementsByClassName('im-checkout-btn')[0].click();
        }).error(function (error) {

        });
      } else if (vm.bookingProductDetails.hostCompany.paymentGateway == 'razorpay') {
          var bookingData = createBookingObject();
          var options = {
              "key": 'rzp_test_0xMZsuLBjAjZ6i',
              "amount": parseInt(bookingData.bookingDetails.totalAmountPaid * 100), // 2000 paise = INR 20
              "name": bookingData.bookingDetails.providedGuestDetails.firstName + ' ' +bookingData.bookingDetails.providedGuestDetails.lastName,
              "description": vm.bookingProductDetails.productTitle,
              "image": "/your_logo.png",
              "handler": function (response){
                  var razorpayData = {bookingObject: bookingData, paymentId: response.razorpay_payment_id};
                  $http.post('/api/payment/razorpay/', razorpayData).success (function (response) {
                   console.log(response);
                  }).error(function (error) {

                  });
              },
              "prefill": {
                  "name": bookingData.bookingDetails.providedGuestDetails.firstName + ' ' + bookingData.bookingDetails.providedGuestDetails.lastName,
                  "email": bookingData.bookingDetails.providedGuestDetails.email,
                  "contact": bookingData.bookingDetails.providedGuestDetails.mobile
              },
              "notes": {
                  "address": "Hello World"
              },
              "theme": {
                  "color": "#F37254"
              }
          };
          var rzp1 = new Razorpay(options);
          rzp1.open();
        }
    }

    vm.getDynamicCSSForBookingScreenNav = function () {
      if(window.innerWidth > 767)
        return 'nav-toursite';
    }
    vm.getDynamicPaddingForBookingScreenNav = function () {
      var cssObject = {
        "padding-left": "15%",
        "padding-right": "15%"
      }
      if(window.innerWidth > 767)
        return cssObject;
    }

    vm.getDynamicCSSForPricingSection = function (index) {
      var cssObject = {
        "border-bottom" : "none",
        "margin-bottom": "0"
      };
      if (index == vm.bookingProductDetails.productAddons.length - 1)
        return cssObject;
    }

    vm.getDynamicCSSForDateSection = function (index) {
      var cssObject = {
        "border-bottom" : "none",
        "margin-bottom": "0"
      };
      if (index == vm.sessionsOfThisProduct.length - 1)
        return cssObject;
    }

    vm.hideErrorsIfExists = function () {
      vm.showErrorsOnTopOfStep3 = false;
    }
  }
}());
