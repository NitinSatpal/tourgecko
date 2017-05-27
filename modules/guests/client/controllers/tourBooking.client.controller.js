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

  TourBookingController.$inject = ['$scope', '$state', '$http', '$location', '$window', '$timeout', 'Authentication'];

  function TourBookingController($scope, $state, $http, $location, $window, $timeout, Authentication) {
    // Initialize variables
    var vm = this;
    vm.authentication = Authentication;
    vm.nonGroupCustomSeatQuantity = [];
    vm.groupSeatQuantity = [];
    vm.customSeatQuantity = [];
    vm.addonQuantity = [];
    vm.addonSelectionCheckbox = [];
    vm.totalCalculatedSeatPrice = 0;
    vm.totalcalculatedAddonPrice = 0;
    vm.totalPayablePrice = 0;
    vm.totalNumberOfSeats = 0;
    vm.selectedBookingOptionIndex = 0;
    vm.showLoaderForPriceCalculations = false;

    var productSessionIds = [];
    var tourType;
    var pricingObject;

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

    vm.skipIndexForDepartureDates = 0;
    var departureDates = new Set();
    var sessionCount = 0;

    // Get the product id
    var productId = $location.path().split('/')[4];

    // Fetch product data from database
    $http.get('/api/guest/product/' + productId).success(function (response) {
      vm.bookingProductDetails = response[0];
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
      
      // fetch productsessions
      $http.get('/api/guest/productSessionsWithCount/' + productId + '/' + vm.skipIndexForDepartureDates).success(function (response) {
        vm.productSessions = response.sessions;
        sessionCount = response.sessionCount;
        vm.lastIndexForDepartureDates = Math.floor(sessionCount / 5);
        for ( var index = 0; index < vm.productSessions.length; index ++)
          productSessionIds.push(vm.productSessions[index]._id);

        $('#loadingDivTourBooking').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }).error(function (response) {
          vm.error = response.message;
          $('#loadingDivTourBooking').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
      });
    }).error(function (response) {
      vm.error = response.message;
      $('#loadingDivTourBooking').css('display', 'none');
      $('#tourgeckoBody').removeClass('waitCursor');
    });

    vm.getNextDepartureDates = function () {
      vm.skipIndexForDepartureDates = vm.skipIndexForDepartureDates + 1;
      $('#departureDate'+vm.selectedBookingOptionIndex).prop('checked', false);
      // fetch productsessions
      $http.get('/api/guest/productSessions/' + productId + '/' + vm.skipIndexForDepartureDates).success(function (response) {
        vm.productSessions = response;
        departureDates.clear();
        productSessionIds.length = 0;
        for ( var index = 0; index < vm.productSessions.length; index ++)
          productSessionIds.push(vm.productSessions[index]._id);


      }).error(function (response) {
          vm.error = response.message;
      });
    }

    vm.getPrevDepartureDates = function () {
      vm.skipIndexForDepartureDates = vm.skipIndexForDepartureDates - 1;
      $('#departureDate'+vm.selectedBookingOptionIndex).prop('checked', false);
      // fetch productsessions
      $http.get('/api/guest/productSessions/' + productId + '/' + vm.skipIndexForDepartureDates).success(function (response) {
        vm.productSessions = response;
        departureDates.clear();
        productSessionIds.length = 0;
        for ( var index = 0; index < vm.productSessions.length; index ++)
          productSessionIds.push(vm.productSessions[index]._id);


      }).error(function (response) {
          vm.error = response.message;
      });
    }

    var weekDaysNumber = new Map();
    weekDaysNumber.set('Sunday', 0);
    weekDaysNumber.set('Monday', 1);
    weekDaysNumber.set('Tuesday', 2);
    weekDaysNumber.set('Wednesday', 3);
    weekDaysNumber.set('Thursday', 4);
    weekDaysNumber.set('Friday', 5);
    weekDaysNumber.set('Saturday', 6);

    vm.openRepeatDatesInfoModal = function (divId, sessionId, index) {
      vm.selectedBookingOptionIndex = index;
      $('#departureDate'+vm.selectedBookingOptionIndex).prop('checked', false);
      $('#tourgeckoBody').addClass('makeOverflowHidden');
      $(divId).slideDown('slow');
      var events = [];
      $http.get('/api/host/productsession/' + sessionId).success(function (response) {
        var sessionObject = response;
        var repeatedDays = 0;
        var notAllowedDays = new Set();
        var allowedDays = new Set();
        if(sessionObject.sessionDepartureDetails.repeatBehavior == 'Repeat Daily' || sessionObject.sessionDepartureDetails.repeatBehavior == 'Repeat Weekly') {
          var firstDate = new Date(sessionObject.sessionDepartureDetails.repeatTillDate);
          var secondDate = new Date(sessionObject.sessionDepartureDetails.startDate);
          var oneDay = 24*60*60*1000;
          repeatedDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
          repeatedDays = repeatedDays + 1;
        
          if (sessionObject.sessionDepartureDetails.repeatBehavior == 'Repeat Daily' && sessionObject.sessionDepartureDetails.notRepeatOnDays) {
            for (var index = 0; index < sessionObject.sessionDepartureDetails.notRepeatOnDays.length; index++)
              notAllowedDays.add(weekDaysNumber.get(sessionObject.sessionDepartureDetails.notRepeatOnDays[index]));
          }
          if (sessionObject.sessionDepartureDetails.repeatBehavior == 'Repeat Weekly' && sessionObject.sessionDepartureDetails.repeatOnDays) {
              for (var index = 0; index < sessionObject.sessionDepartureDetails.repeatOnDays.length; index++)
                allowedDays.add(weekDaysNumber.get(sessionObject.sessionDepartureDetails.repeatOnDays[index]));
          }
        }
        var eventDate = new Date(sessionObject.sessionDepartureDetails.startDate);
        for (var index = 0; index <= repeatedDays; index ++) {
          var needToSave = true;
          if(sessionObject.sessionDepartureDetails.repeatBehavior == 'Repeat Daily' && notAllowedDays.has(eventDate.getDay()) ||
            sessionObject.sessionDepartureDetails.repeatBehavior == 'Repeat Weekly' && !allowedDays.has(eventDate.getDay()) ||
            eventDate > firstDate)
            needToSave = false;

          if (needToSave) {
            var endDate = angular.copy(eventDate);
            var limit;
            var percentBooking = 'NA';
            var numOfSeatsKey = eventDate.getTime();
            if (sessionObject.product.productSeatsLimitType == 'unlimited')
              limit = 'No Limit';
            else {
              if (sessionObject.product.productSeatLimit) {
                limit = sessionObject.product.productSeatLimit;
                if (sessionObject.numberOfSeats && sessionObject.numberOfSeats[numOfSeatsKey])
                  percentBooking = parseInt(sessionObject.numberOfSeats[numOfSeatsKey]) / parseInt(limit) * 100;
                else
                  percentBooking = 0;
              } else
                limit = '-';
            }
            var eventObject;
            var colorSelectionAndTitle;
            var colorSelectionAndTitleForMobile;
            var bookingDetailsInCalendar;
            if (sessionObject.numberOfSeats && sessionObject.numberOfSeats[numOfSeatsKey])
              bookingDetailsInCalendar = sessionObject.numberOfSeats[numOfSeatsKey];
            else
              bookingDetailsInCalendar = 0;
            if (percentBooking != 'NA') {
              if (percentBooking <= 40) {
                colorSelectionAndTitle = '<span class="eventname greenFC">' +
                  'Available' + '</span> <br>' +
                  '<span class="lbreak"><i class="zmdi zmdi-circle greenFC"></i>' +
                  '<i class="zmdi zmdi-account"></i> &nbsp; ' + bookingDetailsInCalendar + '/' +limit +'</span>';
                colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle greenFC"><span class="eventname greenFC"></span></i>';
              } else if (percentBooking > 40 && percentBooking <= 80) {
                colorSelectionAndTitle = '<span class="eventname orangeFC">' + 
                  'Filling Fast' + '</span> <br>' + 
                  '<span class="lbreak"><i class="zmdi zmdi-circle orangeFC"></i>' + 
                  '<i class="zmdi zmdi-account"></i> &nbsp;' + bookingDetailsInCalendar + '/' +limit +'</span>';
                colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle orangeFC"><span class="eventname orangeFC"></span></i>';
              } else {
                colorSelectionAndTitle = '<span class="eventname redFC">' +
                  'Few Seats <br> Remaining' + '</span> <br>' +
                  '<span class="lbreak"><i class="zmdi zmdi-circle redFC"></i>' + 
                  '<i class="zmdi zmdi-account"></i> &nbsp;' + bookingDetailsInCalendar + '/' +limit +'</span>';
                colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle redFC"><span class="eventname redFC"></span></i>';
              }

            } else {
              colorSelectionAndTitle = '<span class="eventname greenFC">' +
                  'Available' + '</span> <br>' +
                  '<span class="lbreak"><i class="zmdi zmdi-circle greenFC"></i>' +
                  '<i class="zmdi zmdi-account"></i> &nbsp; ' + document.numberOfSeats[numOfSeatsKey]+ '/' +limit +'</span>';
              colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle greenFC"><span class="eventname greenFC"></span></i>';
            }

            if (window.innerWidth > 767) {
              eventObject = {
                title: colorSelectionAndTitle,
                start: eventDate,
                end: endDate,
                backgroundColor:  '#ffe4b2',
              }
            } else {
              eventObject = {
                title: colorSelectionAndTitleForMobile,
                start: eventDate,
                end: endDate,
              } 
            }
            events.push(eventObject);
          }
          eventDate = new Date (eventDate);
          eventDate = eventDate.setDate(eventDate.getDate() + 1);
          eventDate = new Date (eventDate);
        }
        $('#repeatTourCalendar').fullCalendar({
          height: 600,
          header: {
              left: 'prev,next today',
              center: 'title',
              right: 'month'
          },
          defaultDate: new Date(sessionObject.sessionDepartureDetails.startDate),
          
          events: events,
          eventRender: function (event, element) {
            element.find('.fc-title').html(event.title);
          },
          eventClick:  function(event, jsEvent, view) {
            goToPricingOptions(event);
          }
        });
      }).error(function (response) {
          vm.error = response.message;
      });
    }

    function goToPricingOptions (event) {
      var date = event.start._i;
      vm.selectedDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
      fadeOutTheModal('#showRepeatDatesModal');
      $('.classToClickNext .actionBar .btn-next').click();
      $scope.$apply();
    }
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
        $scope.$apply();
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


    vm.getAvailableSeats = function (index) {
      if(vm.bookingProductDetails && vm.bookingProductDetails.productSeatLimit !== undefined) {
        if (vm.productSessions && vm.productSessions[index]) {
          var key = new Date(vm.productSessions[index].sessionDepartureDetails.startDate).getTime();
          if (vm.productSessions[index].numberOfSeats && vm.productSessions[index].numberOfSeats[key])
            return vm.bookingProductDetails.productSeatLimit - parseInt(vm.productSessions[index].numberOfSeats[key]);
          else 
            return vm.bookingProductDetails.productSeatLimit;
        }
      } else
        return 'No Limit on Seats';
    }

    vm.groupEntryTracker = -1;
    vm.customEntryTracker = -1;
    vm.trackGroupEntry = function (index, pricingType) {
      if (vm.groupEntryTracker == -1 && pricingType == 'Group')
        vm.groupEntryTracker = index;

      if (vm.customEntryTracker == -1 && pricingType == 'Custom')
        vm.customEntryTracker = index;
      
    }

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
   /* Initial Pricing selection and price calculations + variable declaration for non group and non custom pricing types */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.nonGroupCustomCalculatedSeatPrice = 0;
    vm.storePrevNonGroupCustomSeatQuantity = [];
    var nonGroupCustomIndexTracker = new Set();
    vm.setSelectedNonGroupCustomPricing = function (index) {
      vm.showLoaderForPriceCalculations = true;
      if(!nonGroupCustomIndexTracker.has(index)) {
        nonGroupCustomIndexTracker.add(index);
        vm.nonGroupCustomSeatQuantity[index] = 1;
        vm.storePrevNonGroupCustomSeatQuantity[index] = 1;
        vm.totalNumberOfSeats = vm.totalNumberOfSeats + 1;
        // As this is initial selection. Price will always be added in multiple of 1 as user has just selected and by default we are
        // putting 1 as seat quantity. Hence there is not multiplier to pricingObject[index].price
        // When user will change seats, we will re calculate the price.
        vm.nonGroupCustomCalculatedSeatPrice = vm.nonGroupCustomCalculatedSeatPrice + parseInt(pricingObject[index].price);
      } else {
        nonGroupCustomIndexTracker.delete(index)
        vm.nonGroupCustomSeatQuantity[index] = '';
        vm.nonGroupCustomCalculatedSeatPrice = vm.nonGroupCustomCalculatedSeatPrice - parseInt(vm.storePrevNonGroupCustomSeatQuantity[index] * pricingObject[index].price);
        vm.totalNumberOfSeats = vm.totalNumberOfSeats - vm.storePrevNonGroupCustomSeatQuantity[index];
      }
      calculateAddonPricingOnSeatChange();
      calculateTotalSeatPrice();
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Initial Pricing selection and price calculations + variable declaration for non group and non custom pricing types, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed the number of seats of non group and non custom pricing types */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.calculateNonGroupCustomSeatPrice = function (index) {
      vm.showLoaderForPriceCalculations = true;
      if (vm.nonGroupCustomSeatQuantity[index] == null) {
        vm.nonGroupCustomSeatQuantity[index] = '';
        if ($('#pricingSelection'+index).prop('checked'))
          $('#pricingSelection'+index).prop('checked', false); // Unchecks it
        nonGroupCustomIndexTracker.delete(index);
        vm.nonGroupCustomCalculatedSeatPrice = vm.nonGroupCustomCalculatedSeatPrice - parseInt(vm.storePrevNonGroupCustomSeatQuantity[index] * 
                                                        pricingObject[index].price);
        vm.totalNumberOfSeats = vm.totalNumberOfSeats - vm.storePrevNonGroupCustomSeatQuantity[index];
        vm.storePrevNonGroupCustomSeatQuantity[index] = 0;
      } else {
        if (!$('#pricingSelection'+index).prop('checked')) {
          $('#pricingSelection'+index).prop('checked', true);
          vm.totalNumberOfSeats = vm.totalNumberOfSeats - vm.storePrevNonGroupCustomSeatQuantity[index];
          vm.storePrevNonGroupCustomSeatQuantity[index] = 0;
        }
        nonGroupCustomIndexTracker.add(index);
        
        vm.nonGroupCustomCalculatedSeatPrice = vm.nonGroupCustomCalculatedSeatPrice - parseInt(vm.storePrevNonGroupCustomSeatQuantity[index] * pricingObject[index].price);
        vm.nonGroupCustomCalculatedSeatPrice = vm.nonGroupCustomCalculatedSeatPrice + parseInt(vm.nonGroupCustomSeatQuantity[index] * 
                                                        pricingObject[index].price);
        
        vm.totalNumberOfSeats = vm.totalNumberOfSeats - vm.storePrevNonGroupCustomSeatQuantity[index] + vm.nonGroupCustomSeatQuantity[index];
        vm.storePrevNonGroupCustomSeatQuantity[index] = vm.nonGroupCustomSeatQuantity[index];
      }
      calculateAddonPricingOnSeatChange();
      calculateTotalSeatPrice();
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed the number of seats of non group and non custom pricing types, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Initial Pricing selection and price calculations + variable declaration for group pricing type */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.groupCalculatedSeatPrice = 0;
    vm.storePrevGroupQuantity = 0;
    vm.setSelectedGroupPricing = function (index) {
      vm.showLoaderForPriceCalculations = true;
      vm.groupSeatQuantity.length = 0;
      vm.groupSeatQuantity[index] = parseInt(pricingObject[index].minGroupSize);
      vm.totalNumberOfSeats = vm.totalNumberOfSeats - vm.storePrevGroupQuantity + parseInt(pricingObject[index].minGroupSize);
      vm.storePrevGroupQuantity = vm.groupSeatQuantity[index];
      if (pricingObject[index].groupOption == 'Per Person')
        vm.groupCalculatedSeatPrice = vm.groupSeatQuantity[index] * parseInt(pricingObject[index].price);
      else
        vm.groupCalculatedSeatPrice = parseInt(pricingObject[index].price);

      calculateAddonPricingOnSeatChange();
      calculateTotalSeatPrice();
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Initial Pricing selection and price calculations + variable declaration for group pricing type, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed the number of seats of group pricing type */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.calculateGroupSeatPrice = function (index) {
      vm.showLoaderForPriceCalculations = true;
      if (vm.groupSeatQuantity[index] == null) {
        if ($('#groupPricingOption'+index).prop('checked'))
          $('#groupPricingOption'+index).prop('checked', false); // Unchecks it
        vm.groupSeatQuantity.length = 0;
        vm.groupSeatQuantity[index] = '';
        vm.groupCalculatedSeatPrice = 0 * parseInt(pricingObject[index].price);
        vm.totalNumberOfSeats = vm.totalNumberOfSeats - vm.storePrevGroupQuantity;
        vm.storePrevGroupQuantity = 0;
        calculateAddonPricingOnSeatChange();
        calculateTotalSeatPrice();
      } else {
        if (!$('#groupPricingOption'+index).prop('checked')) {
          $('#groupPricingOption'+index).prop('checked', true);
          var tempGroupSeatNumber = vm.groupSeatQuantity[index];
          vm.groupSeatQuantity.length = 0;
          vm.groupSeatQuantity[index] = tempGroupSeatNumber;
        }
        $timeout(function() {
          if(vm.groupSeatQuantity[index] < parseInt(pricingObject[index].minGroupSize) || 
            vm.groupSeatQuantity[index] > parseInt(pricingObject[index].maxGroupSize)) {
            $timeout(function() {
              alert('Please provide quantity within the limit of the group size option');
              vm.groupSeatQuantity[index] = parseInt(pricingObject[index].minGroupSize);
              if (pricingObject[index].groupOption == 'Per Person')
                vm.groupCalculatedSeatPrice = vm.groupSeatQuantity[index] * parseInt(pricingObject[index].price);
              else
                vm.groupCalculatedSeatPrice = parseInt(pricingObject[index].price);

              calculateTotalSeatPrice();
              return false;
            }, 100);
          } else {
            if (pricingObject[index].groupOption == 'Per Person')
              vm.groupCalculatedSeatPrice = vm.groupSeatQuantity[index] * parseInt(pricingObject[index].price);
            else
              vm.groupCalculatedSeatPrice = parseInt(pricingObject[index].price);
            vm.totalNumberOfSeats = vm.totalNumberOfSeats - vm.storePrevGroupQuantity + vm.groupSeatQuantity[index];
            vm.storePrevGroupQuantity = vm.groupSeatQuantity[index];
            calculateAddonPricingOnSeatChange();
            calculateTotalSeatPrice();
          }
        }, 1000);
      }
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed the number of seats of group pricing type, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Initial Pricing selection and price calculations + variable declaration for custom pricing type */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.customCalculatedSeatPrice = 0;
    vm.storePrevCustomQuantity = 0;
    vm.setSelectedCustomPricing = function (index) {
      vm.showLoaderForPriceCalculations = true;
      vm.customSeatQuantity.length = 0;
      vm.customSeatQuantity[index] = 1;
      vm.totalNumberOfSeats = vm.totalNumberOfSeats - vm.storePrevCustomQuantity + 1;
      vm.storePrevCustomQuantity = 1;
      vm.customCalculatedSeatPrice = vm.customSeatQuantity[index] * parseInt(pricingObject[index].price);
      calculateAddonPricingOnSeatChange();
      calculateTotalSeatPrice();
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Initial Pricing selection and price calculations + variable declaration for group pricing type, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed the number of seats of group pricing type */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.calculateCustomSeatPrice = function (index) {
      vm.showLoaderForPriceCalculations = true;
      if (vm.customSeatQuantity[index] == null) {
        if ($('#customPricingOption'+index).prop('checked'))
          $('#customPricingOption'+index).prop('checked', false); // Unchecks it
        vm.customSeatQuantity.length = 0;
        vm.customSeatQuantity[index] = '';
        vm.customCalculatedSeatPrice = 0 * parseInt(pricingObject[index].price);
        vm.totalNumberOfSeats = vm.totalNumberOfSeats - vm.storePrevCustomQuantity + 1;
        vm.storePrevCustomQuantity = 0;
        calculateAddonPricingOnSeatChange();
        calculateTotalSeatPrice();
      } else {
        if (!$('#customPricingOption'+index).prop('checked')) {
          $('#customPricingOption'+index).prop('checked', true);
          var tempCustomSeatNumber = vm.customSeatQuantity[index];
          vm.customSeatQuantity.length = 0;
          vm.customSeatQuantity[index] = tempCustomSeatNumber;
        }
        $timeout(function() {
          if(vm.customSeatQuantity[index] > parseInt(pricingObject[index].seatsUsed)) {
            $timeout(function() {
              alert('Please provide quantity less than the seats used for this option');
              vm.customSeatQuantity[index] = 1;
              vm.customCalculatedSeatPrice = vm.customSeatQuantity[index] * parseInt(pricingObject[index].price);
              calculateTotalSeatPrice();
              return false;
            }, 100);
          } else {
            vm.customCalculatedSeatPrice = vm.customSeatQuantity[index] * parseInt(pricingObject[index].price);
            vm.totalNumberOfSeats = vm.totalNumberOfSeats - vm.storePrevCustomQuantity + vm.customSeatQuantity[index];
            vm.storePrevCustomQuantity = vm.customSeatQuantity[index];
            calculateAddonPricingOnSeatChange();
            calculateTotalSeatPrice();
          }
        }, 1000)
      }
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed the number of seats of group pricing type, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */

    function calculateTotalSeatPrice() {
      vm.totalCalculatedSeatPrice = vm.nonGroupCustomCalculatedSeatPrice + vm.groupCalculatedSeatPrice + vm.customCalculatedSeatPrice;
      calulateTotalPayablePrice();
    }



/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Addon selection,validations and pricing calculations + variable declarations for the same */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.storePrevAddonQuantity = [];
    vm.addonQuantityToCalculatePrice = [];
    var addonIndexTracker = new Set();
    vm.setSelectedAddonPricing = function (index) {
      vm.showLoaderForPriceCalculations = true;
      if (nonGroupSeatCalculator() == 0 && groupSeatCalculator() == 0 && customSeatCalculator() == 0) {
        alert('Please select Booking Option before selecting Optional Add-Ons');
        vm.addonSelectionCheckbox[index] = false;
        vm.showLoaderForPriceCalculations = false;
        return false;
      }
      if(!addonIndexTracker.has(index)) {
        addonIndexTracker.add(index);
        vm.addonQuantity[index] = 1;
        if (vm.bookingProductDetails.productAddons[index].applyAs == 'Per Seat')
          vm.addonQuantityToCalculatePrice[index] = vm.totalNumberOfSeats;
        else
          vm.addonQuantityToCalculatePrice[index] = 1;

        vm.storePrevAddonQuantity[index] = vm.addonQuantityToCalculatePrice[index];
        vm.totalcalculatedAddonPrice = vm.totalcalculatedAddonPrice + parseInt(vm.addonQuantityToCalculatePrice[index] * vm.bookingProductDetails.productAddons[index].price);
      } else {
        addonIndexTracker.delete(index)
        vm.addonQuantity[index] = '';
        vm.addonQuantityToCalculatePrice[index] = 0;
        vm.totalcalculatedAddonPrice = vm.totalcalculatedAddonPrice - parseInt(vm.storePrevAddonQuantity[index] * vm.bookingProductDetails.productAddons[index].price);;
        vm.storePrevAddonQuantity[index] = vm.addonQuantityToCalculatePrice[index];
      }
      calulateTotalPayablePrice();
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Addon selection, validations and pricing calculations + variable declarations for the same, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */
  

/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed number of addons or number of seats */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.calculateAddonPrice = function (index) {
      vm.showLoaderForPriceCalculations = true;
      if (vm.addonQuantity[index] == null) {
        vm.addonQuantity[index] = '';
        if (vm.addonSelectionCheckbox[index])
          vm.addonSelectionCheckbox[index] = false; // Unchecks it
        addonIndexTracker.delete(index);
        vm.totalcalculatedAddonPrice = vm.totalcalculatedAddonPrice - parseInt(vm.storePrevAddonQuantity[index] * vm.bookingProductDetails.productAddons[index].price);
        vm.addonQuantityToCalculatePrice[index] = 0;
        vm.storePrevAddonQuantity[index] = vm.addonQuantityToCalculatePrice[index];
      } else {
        if (!vm.addonSelectionCheckbox[index]) {
          vm.addonSelectionCheckbox[index] = true;
          vm.storePrevAddonQuantity[index] = 0;
        }
        addonIndexTracker.add(index);
        vm.addonQuantityToCalculatePrice[index] = vm.addonQuantity[index];
        vm.totalcalculatedAddonPrice = vm.totalcalculatedAddonPrice - parseInt(vm.storePrevAddonQuantity[index] * vm.bookingProductDetails.productAddons[index].price);;
        vm.totalcalculatedAddonPrice = vm.totalcalculatedAddonPrice + parseInt(vm.addonQuantity[index] * vm.bookingProductDetails.productAddons[index].price);
        vm.storePrevAddonQuantity[index] = vm.addonQuantity[index];;
      }
      calulateTotalPayablePrice();
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Pricing calculations in case user changed number of addons or number of seats, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */
    
    function calculateAddonPricingOnSeatChange () {
      if (nonGroupSeatCalculator() == 0 && groupSeatCalculator() == 0 && customSeatCalculator() == 0) {
        addonIndexTracker.clear();
        vm.addonSelectionCheckbox.length = 0;
        vm.totalcalculatedAddonPrice = 0;
        vm.addonQuantityToCalculatePrice.length = 0;
        vm.storePrevAddonQuantity.length = 0;
        vm.nonGroupCustomSeatQuantity.length = 0;
        vm.groupSeatQuantity.length = 0;
        vm.customSeatQuantity.length = 0;
        vm.addonQuantity.length = 0;
      } else {
        addonIndexTracker.forEach(function(value) {
          if (vm.bookingProductDetails.productAddons[value].applyAs == 'Per Seat') {
            vm.totalcalculatedAddonPrice = vm.totalcalculatedAddonPrice - vm.addonQuantityToCalculatePrice[value] * vm.bookingProductDetails.productAddons[value].price;
            vm.addonQuantityToCalculatePrice[value] = vm.totalNumberOfSeats;
            vm.storePrevAddonQuantity[value] = vm.totalNumberOfSeats;
            vm.totalcalculatedAddonPrice = vm.totalcalculatedAddonPrice + vm.addonQuantityToCalculatePrice[value] * vm.bookingProductDetails.productAddons[value].price
          }
        });
      }
    }

    function nonGroupSeatCalculator () {
      var nonGroupSeatQunatity = 0;
      for (var index = 0; index < vm.nonGroupCustomSeatQuantity.length; index++) {
        if (vm.nonGroupCustomSeatQuantity[index] != '')
          nonGroupSeatQunatity = nonGroupSeatQunatity + vm.nonGroupCustomSeatQuantity[index];
      }
      return nonGroupSeatQunatity;
    }

    function groupSeatCalculator () {
      var groupSeatQunatity = 0;
      for (var index = 0; index < vm.groupSeatQuantity.length; index++) {
        if (vm.groupSeatQuantity[index] != '')
          groupSeatQunatity = groupSeatQunatity + vm.groupSeatQuantity[index];
      }
      return groupSeatQunatity;
    }

    function customSeatCalculator () {
      var customSeatQunatity = 0;
      for (var index = 0; index < vm.customSeatQuantity.length; index++) {
        if (vm.customSeatQuantity[index] != '')
          customSeatQunatity = customSeatQunatity + vm.customSeatQuantity[index];
      }
      return customSeatQunatity;
    }

    function addonQuantityCalculator () {
      var addonQuantity = 0;
      for (var index = 0; index < vm.addonQuantity.length; index++) {
        if (vm.addonQuantity[index] != '')
          addonQuantity = addonQuantity + vm.addonQuantity[index];
      }
      return addonQuantity;
    }

    function calulateTotalPayablePrice () {
      vm.totalPayablePrice = vm.totalCalculatedSeatPrice + vm.totalcalculatedAddonPrice;
      $timeout(function() {
        vm.showLoaderForPriceCalculations = false;
      }, 100);
    }
    


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Validation function */
/* ------------------------------------------------------------------------------------------------------------------------- */
    $scope.validateData = function (stepNumberFrom, stepNumberTo) {
      if (stepNumberFrom > stepNumberTo) {
        return true;
      } else if (stepNumberFrom == 1 && !vm.selectedDate) {
        alert('Please select departure date first as prices shown on next screen may vary');
        return false;
      } else if (stepNumberFrom == 2 && vm.nonGroupCustomSeatQuantity.length == 0 && vm.groupSeatQuantity.length == 0 && vm.customSeatQuantity.length == 0) {
        alert('Please select Booking Option to proceed further');
        return false;
      } else if (stepNumberFrom == 3 && !vm.providedGuestDetails) {
        alert('Please provide the name, email and mobile number for communication');
        return false;
      }
      if (stepNumberFrom == 1) {
        if (vm.bookingProductDetails.productAvailabilityType == 'Fixed Departure' 
            && vm.productSessions[vm.selectedBookingOptionIndex].isSessionPricingValid == true) {
          pricingObject = vm.productSessions[vm.selectedBookingOptionIndex].sessionPricingDetails;
        } else {
          pricingObject = vm.bookingProductDetails.productPricingOptions;
        }
      }
      return true;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* validation function, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Booking object creation function */
/* ------------------------------------------------------------------------------------------------------------------------- */
    $scope.createBookingObject = function () {
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
      
      bookingObject.numberOfSeats = nonGroupSeatCalculator() + groupSeatCalculator() + customSeatCalculator();
      bookingObject.numberOfAddons = addonQuantityCalculator();
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

      $http.post('/api/host/booking', bookingData).success(function (response) {
        $state.go('guest.bookingDone');
      }).error(function (response) {
        vm.error = response.message;
      });
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Booking object creation function, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


    $scope.makePayment = function () {
      var hash = 
      $http.post('https://biz.traknpay.in/v1/paymentrequest', {address_line_1: "abc",
                                                              address_line_2: "pqr",
                                                              amount: 1,
                                                              api_key: 'amma',
                                                              city: 'hyderabad',
                                                              country: 'IND',
                                                              currency: 'INR',
                                                              description: "DSdasads",
                                                              email: "nitinsatpal@gmail.com",
                                                              mode: "LIVE",
                                                              name: "dasdasdsa",
                                                              order_id: '121212',                                                              
                                                              phone: 9535519640,
                                                              return_url: '',
                                                              state:'',
                                                              udf1: '',
                                                              udf2: '',
                                                              udf3: '',
                                                              udf4: '',
                                                              udf5: '',
                                                              zip_code: '500049',
                                                              hash: 'baba'
      })
      .success(function (response) {
        console.log(response);
      }).error(function (response) {
        console.log(response);
        vm.error = response.message;
      });
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
  }
}());
