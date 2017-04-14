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

  TourBookingController.$inject = ['$scope', '$state', '$http', '$location', '$window', 'Authentication'];

  function TourBookingController($scope, $state, $http, $location, $window, Authentication) {
    // Initialize variables
    var vm = this;
    vm.authentication = Authentication;
    vm.seatQuantity = [];
    vm.addonQuantity = [];
    vm.calculatedSeatPrice = 0;
    vm.calculatedAddonPrice = 0;
    vm.totalPayablePrice = 0;
    vm.selectedBookingOptionIndex = 0;

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

    var departureDates = new Set();

    // Get the product id
    var productId = $location.path().split('/')[4];

    // Fetch product data from database
    $http.get('/api/guest/product/' + productId).success(function (response) {
      vm.bookingProductDetails = response[0];

      // product title is required in embedded javascript, hence save it in scope variable
      $scope.productTitle = vm.bookingProductDetails.productTitle;
      tourType = vm.bookingProductDetails.productAvailabilityType;

      $scope.bookingNotAllowedMonths = new Set();
      for (var index = 0; index < vm.bookingProductDetails.productUnavailableMonths.length; index++)
        $scope.bookingNotAllowedMonths.add(monthToNumber.get(vm.bookingProductDetails.productUnavailableMonths[index]));
      // fetch productsessions
      $http.get('/api/guest/productSessions/' + productId).success(function (response) {
        vm.productSessions = response;
        for ( var index = 0; index < vm.productSessions.length; index ++)
          productSessionIds.push(vm.productSessions[index]._id);


      }).error(function (response) {
          vm.error = response.message;
      });
    }).error(function (response) {
      vm.error = response.message;
    });


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* convert iso date to the date which has to be shown to the user. It will be called from embedded javascript aslo, hence
    function is at scope level */
/* ------------------------------------------------------------------------------------------------------------------------- */
    $scope.getDepartureDate = function (isoDate, isFullCallendarCalling) {
      var date = new Date(isoDate);
      var displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();

      // in case of open dated tour, we have to populate the full calendar events for the date selected by the user
      if (isFullCallendarCalling) {
        // save the selected date, in order to save to the database
        vm.selectedDate = displayDate;

        // displaydate css thing
        var displayDateEdited = weekdays[date.getDay()] + ', <br> ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
        
        // call function
        populateFullCalendarEvent(date, displayDateEdited);
      }

      if (displayDate != 'undefined, NaN undefined NaN')
        departureDates.add(displayDate);
      return displayDate;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* convert iso date to the date which has to be shown to the user. It will be called from embedded javascript aslo, hence
    function is at scope level, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */



/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* populate events of full calendar in case of open dated tours */
/* ------------------------------------------------------------------------------------------------------------------------- */
    function populateFullCalendarEvent (date, displayDate) {
      $window.events.length = 0;
      //if (productTitle.length > 10)
        // productTitle = productTitle.slice(0,10) + '<br>' + productTitle.slice(10, produ) 
      $window.events.push({
        title: '' +
         '<span class="selectedDate blueFC"> Selected <br> Date </span> <br> <span class="displayDate"> ' + displayDate + '</span>',
         start: date
      });
      $('#bookingCalendar').fullCalendar( 'removeEventSource', $window.events );
      $('#bookingCalendar').fullCalendar( 'addEventSource', $window.events );
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* populate events of full calendar in case of open dated tours, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* In case of fixed dated tours, if more than 5 sessions are present, initially show only five */
/* ------------------------------------------------------------------------------------------------------------------------- */
    $scope.getDepartureDates = function(num) {
      if (num < 5)
        return new Array(num);
      else
        return new Array(5);
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* In case of fixed dated tours, if more than 5 sessions are present, initially show only five, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* save selected date in case of fixed dated tours */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.setSelectedDate = function (index) {
      vm.selectedDate = Array.from(departureDates)[index];
      vm.selectedBookingOptionIndex = index;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* save selected date in case of fixed dated tours, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Initial Pricing selection and price calculations + variable declaration for the same */
/* ------------------------------------------------------------------------------------------------------------------------- */
    var selectedPricingIndex;
    vm.setSelectedPricing = function (index) {
      if(vm.seatQuantity.length > 0)
        vm.seatQuantity.length = 0;
      vm.seatQuantity[index] = 1;
      selectedPricingIndex = index;

      vm.calculatedSeatPrice = parseInt(vm.bookingProductDetails.productPricingOptions[index].price);

      vm.totalPayablePrice = vm.calculatedSeatPrice + vm.calculatedAddonPrice;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Initial Pricing selection and price calculations + variable declaration for the same, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed the number of seats */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.calculateSeatPrice = function (index) {
      vm.calculatedSeatPrice = parseInt(vm.bookingProductDetails.productPricingOptions[index].price) * vm.seatQuantity[index];
      calculateAddonPricing(true);
      vm.totalPayablePrice = vm.calculatedSeatPrice + vm.calculatedAddonPrice;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed the number of seats, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */



/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Addon selection,validations and pricing calculations + variable declarations for the same */
/* ------------------------------------------------------------------------------------------------------------------------- */
    var addonTracker = new Set();
    vm.addonsChecked = [];
    vm.setSelectedAddonPricing = function (index) {
      if (vm.seatQuantity.length == 0) {
        alert('Please select Booking Option before selecting Optional Add-Ons');
        vm.addonsChecked[index] = false;
        return false;
      }

      if(!addonTracker.has(index)) {
        addonTracker.add(index);
        if (vm.bookingProductDetails.productAddons[index].applyAs == 'Per Booking' || vm.bookingProductDetails.productAddons[index].applyAs == 'Guest Choice')
          vm.addonQuantity[index] = 1;
        else
          vm.addonQuantity[index] = vm.seatQuantity[selectedPricingIndex];
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
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Addon selection, validations and pricing calculations + variable declarations for the same, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */
  


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed number of addons or number of seats */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.calculateAddonPrice = function () {
      // call external function,  because, in case user has changed the seats, we need to exlicitly change that for addon
      // if addon selected is 'Per Seat'. If user change addon quantity, the required value will be automatically changed
      calculateAddonPricing(false);
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed number of addons or number of seats, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* External function for Pricing calculations in case user changed number of addons or number of seats */
/* ------------------------------------------------------------------------------------------------------------------------- */
    function calculateAddonPricing (needToChangeAddonQuantity) {
      var addonSelected = Array.from(addonTracker);

      // in case the number of seats changed, we have to change the quantity of addons for calculations
      if (needToChangeAddonQuantity) {
        for(var tracker = 0; tracker < addonSelected.length; tracker++) {
          if (vm.bookingProductDetails.productAddons[addonSelected[tracker]].applyAs == 'Per Seat')
            vm.addonQuantity[addonSelected[tracker]] = vm.seatQuantity[selectedPricingIndex];
        }
      }

      vm.calculatedAddonPrice = 0;
      for(var tracker = 0; tracker < addonSelected.length; tracker++)
        vm.calculatedAddonPrice = vm.calculatedAddonPrice + 
                                  parseInt(vm.bookingProductDetails.productAddons[addonSelected[tracker]].price) * 
                                  vm.addonQuantity[addonSelected[tracker]];
      vm.totalPayablePrice = vm.calculatedSeatPrice + vm.calculatedAddonPrice;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* External function for Pricing calculations in case user changed number of addons or number of seats, ends here*/
/* ------------------------------------------------------------------------------------------------------------------------- */
    


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Validation function */
/* ------------------------------------------------------------------------------------------------------------------------- */
    $scope.validateData = function (stepNumberFrom, stepNumberTo) {
      if (stepNumberFrom > stepNumberTo) {
        // For now creating booking from here
        if (stepNumberFrom == 4 && stepNumberTo == 3) {
          createBookingObject();
          return true;
        } else
          return true;
      }
      else if (stepNumberFrom == 1 && !vm.selectedDate) {
        alert('Please select departure date first as prices shown on next screen may vary');
        return false;
      } else if (stepNumberFrom == 2 && vm.seatQuantity.length == 0) {
        alert('Please select Booking Option to proceed further');
        return false;
      } else if (stepNumberFrom == 3 && !vm.providedGuestDetails) {
        alert('Please provide the name, email and mobile number for communication');
        return false;
      } else if (stepNumberFrom == 4) {
        createBookingObject();
      }
      return true;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* validation function, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Booking object creation function */
/* ------------------------------------------------------------------------------------------------------------------------- */
    function createBookingObject () {
      var bookingObject = {};
      bookingObject.providedGuestDetails = vm.providedGuestDetails;
      bookingObject.numberOfSeats = vm.seatQuantity[selectedPricingIndex];
      bookingObject.numberOfAddons = vm.addonsChecked.length;
      bookingObject.product = vm.bookingProductDetails._id;
      bookingObject.hostOfThisBooking = vm.bookingProductDetails.user;
      if (tourType == 'Open Date') {
        bookingObject.isOpenDateTour = true;
        var openDatedTourDepartureDate = new Date(vm.selectedDate);
        openDatedTourDepartureDate = openDatedTourDepartureDate.setDate(openDatedTourDepartureDate.getDate() + 1);
        bookingObject.openDatedTourDepartureDate = new Date(openDatedTourDepartureDate);
        bookingObject.productSession = null;
      } else {
        bookingObject.isOpenDateTour = false;
        bookingObject.productSession = productSessionIds[selectedPricingIndex];
      }
      // There is no discount for now. So Always zero
      bookingObject.totalDiscount = 0;
      // For now keep deposit zero, but need to handle this when payment option is integrated
      bookingObject.depositPaid = 0;
      // For now assign the calculated amount, but need to handle this when payment option is integrated as user can opt to play only deposit.
      // Or may be some tours do not ask upfront payment
      bookingObject.totalAmountPaid = vm.totalPayablePrice;
      bookingObject.totalAmountPaidForProduct = vm.calculatedSeatPrice;
      bookingObject.totalAmountPaidForAddons = vm.calculatedAddonPrice;
      bookingObject.paymentMode = 'tourgecko Wallet';

      var bookingData = {bookingDetails: bookingObject, productTitle: vm.bookingProductDetails.productTitle}

      $http.post('/api/host/booking', bookingData).success(function (response) {
        $state.go('guest.bookingDone');
      }).error(function (response) {
        vm.error = response.message;
      });
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Booking object creation function, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */
  }
}());
