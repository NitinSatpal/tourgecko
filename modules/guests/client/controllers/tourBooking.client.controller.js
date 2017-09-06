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
      "bookingOptionNoMaxSeatLimitReached" : "Please select booking option to proceed further",
      "bookingOptionMaxSeatLimitReached" : "Please select number of participants within the available range",
      "bookingOptionProductMinSeatLimitReached": "Please select number of participants more than or equal to the minimum participants required",
      "bookingOptionProductMaxSeatLimitReached": "Please select number of participants less than or equal to the maximum participants allowed",
      "dateSelection" : "Please select a departure date to proceed",
      "timeslotSelection" : "Please select your preferred time from the available time slot options"
    })
    .constant('unavailableMonthsMap', {
      "0" : "january",
      "1" : "february",
      "2" : "march",
      "3" : "april",
      "4" : "may",
      "5" : "june",
      "6" : "july",
      "7" : "august",
      "8" : "september",
      "9" : "october",
      "10" : "november",
      "11" : "december"
    });

  TourBookingController.$inject = ['$scope', '$state', '$http', '$location', '$window', '$timeout', 'Authentication', 'toasty', 'bookingErrorContentData', 'unavailableMonthsMap'];

  function TourBookingController($scope, $state, $http, $location, $window, $timeout, Authentication, toasty, bookingErrorContentData, unavailableMonthsMap) {
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
    vm.contentToHost = {};
    var toursite = $location.host().split('.')[0];
    $("#tourgeckoBody").addClass(toursite);
    $timeout(function () {
      $('.host-guest-common-style-Top-Info-Section').addClass('conditionalHide');
      $('.host-guest-common-style-navbar .navbar-header .navbar-toggle').addClass('conditionalHide');
      $('.host-guest-common-style-navbar #toursiteTopNav.navbar-collapse .navbar-nav').addClass('conditionalHide');
      $('.host-guest-common-style-footer-menu-toursite').addClass('conditionalHide');
    });
    
    // For now allowing all the numbers starting from 1 and just checking 10 digits for Indian mobile numbers. We can become more
    // strcit and just allow number starting from 7, 8, 9 as in India number series starts only from these numbers.
    $scope.regExForMobileValidity = '^[1-9][0-9]{9}$';

    var tourType;

    var weekdays = ['Sun' , 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
  
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

    var weekDaysNumber = new Map();
    weekDaysNumber.set('Sunday', 0);
    weekDaysNumber.set('Monday', 1);
    weekDaysNumber.set('Tuesday', 2);
    weekDaysNumber.set('Wednesday', 3);
    weekDaysNumber.set('Thursday', 4);
    weekDaysNumber.set('Friday', 5);
    weekDaysNumber.set('Saturday', 6);

    var oneDay = 24*60*60*1000;

    var maxSeatsAvailable = 0;
    var maxSeatLimitError = false;
    var productMinSeatLimitError = false;
    var productMaxSeatLimitError = false;
    var sessionFullyBooked = new Map();

    var dateTimestampToActualSession = new Map();

    var departureDates = new Map();

    var isViaBookbutton = false;

    // Get the product id
    var productId = $location.path().split('/')[3];
    if (productId == 'book') {
      productId = $location.path().split('/')[4];
      isViaBookbutton = true;
    }
    // We cannot use map here, as keys can be duplicate i.e there can be more than one tour with the same start date
    var sessionIndex = [];
    vm.datesOfTheSessionsOfThisProduct = [];
    vm.sesisonDateAndTimeForDisplayAndAvailability = [];
    var dateToTimeslots = new Map();
    // Fetch product data from database
    $http.get('/api/guest/product/' + productId).success(function (response) {
      /* Product details */
      vm.bookingProductDetails = response[0];
      vm.contentToHost['guestSubject'] = 'Enquiry for - ' + vm.bookingProductDetails.productTitle;
      /* Get all the sessions of the product. Sessions will be present in case of fixed departure tours only. */
      $http.get('/api/host/product/productsession/' + productId).success(function (response) {
        /* Sessions of the above fetched product*/
        vm.sessionsOfThisProduct = response;

        /* Session may or may not have time. If they have time, the following variable will contain the time value else it will contain 'No Time'.
         * This key will be used along with dat to represent a unique session so that all the details of that session can be fetched like remaining seats
         * pricing options etc. */
        var sessionPricingPartialKey;
        var lowestAvailableDate = Number.POSITIVE_INFINITY;
        /* If the product is not 'Open Date', go inside and set things to show on booking page */
        if (vm.bookingProductDetails.productAvailabilityType != 'Open Date') {
          /* Iterate over all the sessions of the above fetched product */
          for (var index = 0; index < vm.sessionsOfThisProduct.length; index ++) {
            if (lowestAvailableDate == 'Infinity' || lowestAvailableDate > new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).getTime())
              lowestAvailableDate = new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).getTime();
            /* Set the partial key */
            if (vm.sessionsOfThisProduct[index].sessionDepartureDetails.startTime == undefined || vm.sessionsOfThisProduct[index].sessionDepartureDetails.startTime == ''
              || vm.sessionsOfThisProduct[index].sessionDepartureDetails.startTime == ' ')
              sessionPricingPartialKey = 'No Time';
            else
              sessionPricingPartialKey = vm.sessionsOfThisProduct[index].sessionDepartureDetails.startTime.toString();

            /* If the session is repeative / series */
            if (vm.sessionsOfThisProduct[index].sessionDepartureDetails.repeatBehavior == 'Repeat Daily' || vm.sessionsOfThisProduct[index].sessionDepartureDetails.repeatBehavior == 'Repeat Weekly') {
                /* If session is repeating daily */
                if (vm.sessionsOfThisProduct[index].sessionDepartureDetails.repeatBehavior == 'Repeat Daily') {
                  /* Check on what days the tour is not present, in case, host had set the tour not available on some days*/
                  var notAllowedDays = new Set();
                  if (vm.sessionsOfThisProduct[index].sessionDepartureDetails.notRepeatOnDays) {
                    for (var innerIndexOne = 0; innerIndexOne < vm.sessionsOfThisProduct[index].sessionDepartureDetails.notRepeatOnDays.length; innerIndexOne++)
                      notAllowedDays.add(weekDaysNumber.get( vm.sessionsOfThisProduct[index].sessionDepartureDetails.notRepeatOnDays[innerIndexOne]));
                  }

                  /* Get the date till the tour will be repeating */
                  var repeatTillDate =  new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.repeatTillDate);
                  /* Set this variable to the start date of the tour and keep on incrementing it by one day at a time */
                  var sessionDateIterator = new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate);
                  /* Calculate how many times the loop should run, in short days between start date and end date */
                  var repeatedDays = (repeatTillDate - sessionDateIterator) / (oneDay) + 1;
                  /* Start the loop till above calculated value */
                  for (var repeatIndex = 0; repeatIndex <= repeatedDays; repeatIndex ++) {
                    /* As we are adding one day in repeatedDays, the following check is required, else one extra day will come. */
                    if (sessionDateIterator.getTime() <= repeatTillDate.getTime()) {
                      /* If day is not present in not allowed days, then perform the operations */
                      if (!notAllowedDays.has(sessionDateIterator.getDay())) {
                        /* This array will store all the dates on which the tour will be present.
                         * It will be used to check whether the calendar has to be created or not.
                         * If more than 20 dates are present, the calendar will be created.
                         * It will also be used to either enable or disable the date on the calendar.
                         */
                        vm.datesOfTheSessionsOfThisProduct.push(sessionDateIterator.toString());
                        /* Get the date and the time so display on the booking page */
                        if (new Date().getTime() < new Date(sessionDateIterator).getTime() && vm.sessionsOfThisProduct[index].sessionInternalName) {
                          var tempRecord = {startDate: sessionDateIterator, startTime: sessionPricingPartialKey, capacityDetails: vm.sessionsOfThisProduct[index].sessionCapacityDetails}
                          /* Add the temprecord to the following array, and this array will be iterated in html ng-repeat */
                          vm.sesisonDateAndTimeForDisplayAndAvailability.push(tempRecord);
                        }

                        /* Check whether any seats are remaining for the above time stamp */
                        var remainingSeats = -1;
                        var fullyBookedKey;
                        fullyBookedKey = sessionDateIterator.getTime().toString() + sessionPricingPartialKey;
                        if (vm.sessionsOfThisProduct[index] && vm.sessionsOfThisProduct[index].numberOfSeats && vm.sessionsOfThisProduct[index].numberOfSeats[fullyBookedKey])
                          remainingSeats = parseInt(vm.sessionsOfThisProduct[index].sessionCapacityDetails.sessionSeatLimit) - parseInt(vm.sessionsOfThisProduct[index].numberOfSeats[fullyBookedKey]);

                        if (parseInt(remainingSeats) == 0)
                          sessionFullyBooked.set(sessionDateIterator.toString(), 'Yes');
                        else
                          sessionFullyBooked.set(sessionDateIterator.toString(), 'No');

                        /* In database, we have saved only one session, with start date. Other repeat sessions we create on the fly everywhere.
                         * Suppose the session start date is 1s Jan and it is repeating for 30 days and user selected 28th Jan. There should be
                         * some way to find out, which session's repeat date is 28th Jan. Hence the following map dateTimestampToActualSession 
                         * store the timestamp to index values for all the sessions.
                         */
                        var key = sessionDateIterator.getTime().toString() + sessionPricingPartialKey;
                        dateTimestampToActualSession.set(key, index);

                        /* There can be two different independent session on the same date with different time slots. We need to show all the
                         * timeslots from all the session on a particular date. The following map dateToTimeslots will store the array of all
                         * the timeslots from all the sessions on a given date
                         */
                        if (dateToTimeslots.has(sessionDateIterator.getTime().toString())) {
                          var tempArr = dateToTimeslots.get(sessionDateIterator.getTime().toString());
                          tempArr.push(sessionPricingPartialKey);
                          dateToTimeslots.set(sessionDateIterator.getTime().toString(), tempArr);
                        } else {
                          var tempArr = [];
                          tempArr.push(sessionPricingPartialKey);
                          dateToTimeslots.set(sessionDateIterator.getTime().toString(), tempArr);
                        }
                      }
                      /* Increment the date iterator variable */
                      sessionDateIterator = new Date(sessionDateIterator);
                      sessionDateIterator = sessionDateIterator.setDate(sessionDateIterator.getDate() + 1);
                      sessionDateIterator = new Date(sessionDateIterator);
                    }
                  }
                }
                /* If session is repeating weekly */
                if (vm.sessionsOfThisProduct[index].sessionDepartureDetails.repeatBehavior == 'Repeat Weekly' ) {
                  /* Check on what days the tour is present, in case, host had set the tour available only on some days*/
                  var allowedDays = new Set();
                  if (vm.sessionsOfThisProduct[index].sessionDepartureDetails.repeatOnDays) {
                    for (var innerIndexTwo = 0; innerIndexTwo < vm.sessionsOfThisProduct[index].sessionDepartureDetails.repeatOnDays.length; innerIndexTwo++)
                      allowedDays.add(weekDaysNumber.get( vm.sessionsOfThisProduct[index].sessionDepartureDetails.repeatOnDays[innerIndexTwo]));
                  }

                  /* Get the date till the tour will be repeating */
                  var repeatTillDate =  new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.repeatTillDate);
                  /* Set this variable to the start date of the tour and keep on incrementing it by one day at a time */
                  var sessionDateIterator = new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate);
                  /* Calculate how many times the loop should run, in short days between start date and end date */
                  var repeatedDays = (repeatTillDate - sessionDateIterator) / (oneDay) + 1;

                  /* Start the loop till above calculated value */
                  for (var repeatIndex = 0; repeatIndex <= repeatedDays; repeatIndex ++) {
                    if (sessionDateIterator.getTime() <= repeatTillDate.getTime()) {
                       /* If day is present in allowed days, then perform the operations */
                      if (allowedDays.has(sessionDateIterator.getDay())) {
                        /* This array will store all the dates on which the tour will be present.
                         * It will be used to check whether the calendar has to be created or not.
                         * If more than 20 dates are present, the calendar will be created.
                         * It will also be used to either enable or disable the date on the calendar.
                         */
                        vm.datesOfTheSessionsOfThisProduct.push(sessionDateIterator.toString());

                        if (new Date().getTime() < new Date(sessionDateIterator).getTime() && vm.sessionsOfThisProduct[index].sessionInternalName) {
                          /* Get the date and the time so display on the booking page */
                          var tempRecord = {startDate: sessionDateIterator, startTime: sessionPricingPartialKey, capacityDetails: vm.sessionsOfThisProduct[index].sessionCapacityDetails}
                          /* Add the temprecord to the following array, and this array will be iterated in html ng-repeat */
                          vm.sesisonDateAndTimeForDisplayAndAvailability.push(tempRecord);
                        }

                        /* Check whether any seats are remaining for the above time stamp */
                        var remainingSeats = -1;
                        var fullyBookedKey;
                        fullyBookedKey = sessionDateIterator.getTime().toString() + sessionPricingPartialKey;
                        if (vm.sessionsOfThisProduct[index] && vm.sessionsOfThisProduct[index].numberOfSeats && vm.sessionsOfThisProduct[index].numberOfSeats[fullyBookedKey])
                          remainingSeats = parseInt(vm.sessionsOfThisProduct[index].sessionCapacityDetails.sessionSeatLimit) - parseInt(vm.sessionsOfThisProduct[index].numberOfSeats[fullyBookedKey]);
                        if (parseInt(remainingSeats) == 0)
                          sessionFullyBooked.set(sessionDateIterator.toString(), 'Yes');
                        else
                          sessionFullyBooked.set(sessionDateIterator.toString(), 'No');

                        /* In database, we have saved only one session, with start date. Other repeat sessions we create on the fly everywhere.
                         * Suppose the session start date is 1s Jan and it is repeating for 30 days and user selected 28th Jan. There should be
                         * some way to find out, which session's repeat date is 28th Jan. Hence the following map dateTimestampToActualSession 
                         * store the timestamp to index values for all the sessions.
                         */
                        var key = sessionDateIterator.getTime().toString() + sessionPricingPartialKey;
                        dateTimestampToActualSession.set(key, index);
                        /* There can be two different independent session on the same date with different time slots. We need to show all the
                         * timeslots from all the session on a particular date. The following map dateToTimeslots will store the array of all
                         * the timeslots from all the sessions on a given date
                         */
                        if (dateToTimeslots.has(sessionDateIterator.getTime().toString())) {
                          var tempArr = dateToTimeslots.get(sessionDateIterator.getTime().toString());
                          tempArr.push(sessionPricingPartialKey);
                          dateToTimeslots.set(sessionDateIterator.getTime().toString(), tempArr);
                        } else {
                          var tempArr = [];
                          tempArr.push(sessionPricingPartialKey);
                          dateToTimeslots.set(sessionDateIterator.getTime().toString(), tempArr);
                        }
                      }
                      /* Increment the date iterator variable */
                      sessionDateIterator = new Date(sessionDateIterator);
                      sessionDateIterator = sessionDateIterator.setDate(sessionDateIterator.getDate() + 1);
                      sessionDateIterator = new Date(sessionDateIterator);
                    }
                  }
                }
            } else {
                /* If session is not repeating at all */
                /* In database, we have saved only one session, with start date. Other repeat sessions we create on the fly everywhere.
                 * Suppose the session start date is 1s Jan and it is repeating for 30 days and user selected 28th Jan. There should be
                 * some way to find out, which session's repeat date is 28th Jan. Hence the following map dateTimestampToActualSession 
                 * store the timestamp to index values for all the sessions.
                 */
                var key = new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).getTime().toString() + sessionPricingPartialKey;
                dateTimestampToActualSession.set(key, index);

                /* There can be two different independent session on the same date with different time slots. We need to show all the
                 * timeslots from all the session on a particular date. The following map dateToTimeslots will store the array of all
                 * the timeslots from all the sessions on a given date
                 */
                if (dateToTimeslots.has(new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).getTime().toString())) {
                  var tempArr = dateToTimeslots.get(new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).getTime().toString());
                  tempArr.push(sessionPricingPartialKey);
                  dateToTimeslots.set(new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).getTime().toString(), tempArr);
                } else {
                  var tempArr = [];
                  tempArr.push(sessionPricingPartialKey);
                  dateToTimeslots.set(new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).getTime().toString(), tempArr);
                }

                vm.datesOfTheSessionsOfThisProduct.push(new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).toString());
                if (new Date().getTime() < new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).getTime()) {
                  var tempRecord = {startDate: new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate), startTime: sessionPricingPartialKey, capacityDetails: vm.sessionsOfThisProduct[index].sessionCapacityDetails}
                  vm.sesisonDateAndTimeForDisplayAndAvailability.push(tempRecord);
                }

                /* Check whether any seats are remaining for the above time stamp */
                var remainingSeats = -1;
                var fullyBookedKey;
                fullyBookedKey = new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).getTime().toString() + sessionPricingPartialKey;
                if (vm.sessionsOfThisProduct[index] && vm.sessionsOfThisProduct[index].numberOfSeats && vm.sessionsOfThisProduct[index].numberOfSeats[fullyBookedKey])
                  remainingSeats = parseInt(vm.sessionsOfThisProduct[index].sessionCapacityDetails.sessionSeatLimit) - parseInt(vm.sessionsOfThisProduct[index].numberOfSeats[fullyBookedKey]);
                if (parseInt(remainingSeats) == 0)
                  sessionFullyBooked.set(new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).toString(), 'Yes');
                else
                  sessionFullyBooked.set(new Date(vm.sessionsOfThisProduct[index].sessionDepartureDetails.startDate).toString(), 'No');
            }
          }
        }


        /* Generate the calendar in case of Open Date or more than 20 sessions */
        var minimumMonthNotAvailableLower = -1;
        var minimumMonthNotAvailableUpper = -1;
        if (vm.bookingProductDetails.productAvailabilityType == 'Open Date' || vm.datesOfTheSessionsOfThisProduct.length > 20) {
          if (vm.bookingProductDetails.productAvailabilityType == 'Open Date') {
            if (!vm.bookingProductDetails.productUnavailableMonths || vm.bookingProductDetails.productUnavailableMonths.length ==0)
              generateCalendar(new Date().getMonth(), new Date().getFullYear());
            else {
              if (!vm.bookingProductDetails.productUnavailableMonths || vm.bookingProductDetails.productUnavailableMonths.length ==0)
                generateCalendar(new Date().getMonth(), new Date().getFullYear());
              else {
                if (vm.bookingProductDetails.productUnavailableMonths.indexOf(unavailableMonthsMap[new Date().getMonth()]) == -1)
                  generateCalendar(new Date().getMonth(), new Date().getFullYear());
                else {
                  var currentMonth = new Date().getMonth();
                  var nextYearStarted = false;
                  for (var index = 1; index < 12; index ++) {
                    var currentMonthIterator = (currentMonth + index) % 12;
                    if (currentMonth + index == 12)
                      nextYearStarted = true;
                    if (vm.bookingProductDetails.productUnavailableMonths.indexOf(unavailableMonthsMap[currentMonthIterator]) == -1) {
                      if (nextYearStarted)
                        generateCalendar(currentMonthIterator, new Date().getFullYear() + 1);
                      else
                        generateCalendar(currentMonthIterator, new Date().getFullYear());

                      break;
                    }
                  }
                }
              }
            }
          } else
            generateCalendar(new Date(lowestAvailableDate).getMonth(), new Date(lowestAvailableDate).getFullYear());
        } else
          $('#bookingCalendar').hide();

      }).error(function(response) {
        vm.error = response.message;
      });

      /* Host Company data */
      vm.companyData = response[0].hostCompany;

      /* Set the values of socal account for hover */
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
      tourType = vm.bookingProductDetails.productAvailabilityType;
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
      if (index == -1)
        return displayDate;
      if (weekdays[date.getDay()] != undefined && date.getDate() != NaN && months[date.getMonth()] != undefined && date.getFullYear() !=NaN)
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
      var min = parseInt(min);
      var max = parseInt(max);
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
    vm.validPricingOptions = [];
    vm.setSelectedDate = function (session , index) {
      vm.selectedDate = departureDates.get(index);
      vm.selectedTimeslot = session.startTime;
      maxSeatsAvailable = parseInt(getRemainingSeatsForList(session));
      var key = new Date(session.startDate).getTime().toString() + session.startTime.toString();
      var actualSessionIndex = dateTimestampToActualSession.get(key);
      vm.selectedBookingOptionIndex = actualSessionIndex;
      vm.showErrorsOnTopOfStep1 = false;

      if (vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].isSessionPricingValid)
        vm.validPricingOptions = vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].sessionPricingDetails;
      else
        vm.validPricingOptions = vm.sessionsOfThisProduct[vm.selectedBookingOptionIndex].product.productPricingOptions;

      for (var index = 0; index < vm.validPricingOptions.length; index ++) {
        if (vm.validPricingOptions[index].pricingType != 'Custom'
          && vm.validPricingOptions[index].pricingType != 'Group')
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
    
vm.selectedTimeslot = 'Select Time';
/* ------------------------------------------------------------------------------------------------------------------------- */    
   /* Validation function */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.validateData = function (stepNumberFrom, stepNumberTo) {
      if (stepNumberFrom == 1 && !vm.selectedDate) {
        vm.errorContent.length = 0;
        vm.errorContent.push(bookingErrorContentData['dateSelection']);
        vm.showErrorsOnTopOfStep1 = true;
        return false;
      } else if (stepNumberFrom == 1 && vm.selectedDate && vm.timesForThisDate.length > 0 && vm.selectedTimeslot == 'Select Time') {
        vm.errorContent.length = 0;
        vm.errorContent.push(bookingErrorContentData['timeslotSelection']);
        vm.showErrorsOnTopOfStep1 = true;
        return false;
      } else if (stepNumberFrom == 2 && vm.totalCalculatedSeatPrice == 0 && !maxSeatLimitError && !productMinSeatLimitError && !productMaxSeatLimitError) {
        vm.errorContent.length = 0;
        vm.errorContent.push(bookingErrorContentData['bookingOptionNoMaxSeatLimitReached']);
        vm.showErrorsOnTopOfStep2 = true;
        return false;
      } else if (stepNumberFrom == 2 && vm.totalCalculatedSeatPrice == 0 && maxSeatLimitError ) {
        vm.errorContent.length = 0;
        vm.errorContent.push(bookingErrorContentData['bookingOptionMaxSeatLimitReached']);
        vm.showErrorsOnTopOfStep2 = true;
        return false;
      } else if (stepNumberFrom == 2 && vm.totalCalculatedSeatPrice == 0 && productMinSeatLimitError ) {
        vm.errorContent.length = 0;
        vm.errorContent.push(bookingErrorContentData['bookingOptionProductMinSeatLimitReached']);
        vm.showErrorsOnTopOfStep2 = true;
        return false;
      } else if (stepNumberFrom == 2 && vm.totalCalculatedSeatPrice == 0 && productMaxSeatLimitError ) {
        vm.errorContent.length = 0;
        vm.errorContent.push(bookingErrorContentData['bookingOptionProductMaxSeatLimitReached']);
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

        return false;
      }
      if (stepNumberTo == 2) {
        document.getElementById('fixedDepartureStep2').style.pointerEvents = 'auto';
        if (vm.timesForThisDate.length == 0 && vm.sesisonDateAndTimeForDisplayAndAvailability.length > 20 && vm.bookingProductDetails.productAvailabilityType == 'Fixed Departure')
          vm.selectedTimeslot = 'No Time';
        findThePricingOptionsForSelectedDateTimestamp(vm.selectedDate, vm.selectedTimeslot);
      }
      if (stepNumberTo == 3) {
        if(vm.bookingProductDetails.minSeatsPerBookingRequired && (parseInt(totalSeatsForThisBooking) < vm.bookingProductDetails.minSeatsPerBookingRequired)) {
          productMinSeatLimitError = true;
          $('.groupCustomQuantityQuantity').val('Please Select');
          reinitializeThePricingAndAddonOptionIndexAndQuantityArray();
          vm.totalDiscount = 0;
          vm.totalCalculatedSeatPrice = 0;
          vm.totalcalculatedAddonPrice = 0;
          vm.totalPayablePrice = 0;
          totalSeatsForThisBooking = 0;
          toasty.error({
            title: 'Minimum limit on seats!',
            msg: 'Minimum ' + vm.bookingProductDetails.minSeatsPerBookingRequired + ' seats need to be booked',
            sound: false
          });
          return;
        }
        document.getElementById('fixedDepartureStep3').style.pointerEvents = 'auto';
      }
      $('#fixedDepartureStep'+stepNumberFrom).removeClass('host-guest-common-style-btn');
      $('#fixedDepartureStep'+stepNumberFrom).addClass('host-guest-common-style-default-btn');
      $('#fixedDepartureStep'+stepNumberTo).removeClass("host-guest-common-style-default-btn");
      $('#fixedDepartureStep'+stepNumberTo).addClass("host-guest-common-style-btn");
      if(stepNumberTo == 4) {
        document.getElementById('fixedDepartureStep4').style.pointerEvents = 'auto';
        setTheEndDateOfTheTour()
      }
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
      /* toasty.error({
        title: 'Minimum value reached',
        msg: 'Value cannot be negative',
        sound: false
      }); */
      return;
    }
    vm.pricingOptionIndexAndQuantity[index] = parseInt(vm.pricingOptionIndexAndQuantity[index]) - 1;
  } else {
    if(vm.bookingProductDetails.maxSeatsPerBookingAllowed && (parseInt(totalSeatsForThisBooking) > vm.bookingProductDetails.maxSeatsPerBookingAllowed)) {
      productMaxSeatLimitError = true;
      $('.groupCustomQuantityQuantity').val('Please Select');
      reinitializeThePricingAndAddonOptionIndexAndQuantityArray();
      vm.totalDiscount = 0;
      vm.totalCalculatedSeatPrice = 0;
      vm.totalcalculatedAddonPrice = 0;
      vm.totalPayablePrice = 0;
      totalSeatsForThisBooking = 0;
      toasty.error({
        title: 'Maximum limit on seats!',
        msg: 'Maximum ' + vm.bookingProductDetails.maxSeatsPerBookingAllowed + ' seats can be booked',
        sound: false
      });
      return;
    }
    if (vm.bookingProductDetails.productAvailabilityType != 'Open Date' && parseInt(totalSeatsForThisBooking) > maxSeatsAvailable) {
      maxSeatLimitError = true;
      $('.groupCustomQuantityQuantity').val('Please Select');
      reinitializeThePricingAndAddonOptionIndexAndQuantityArray();
      vm.totalDiscount = 0;
      vm.totalCalculatedSeatPrice = 0;
      vm.totalcalculatedAddonPrice = 0;
      vm.totalPayablePrice = 0;
      totalSeatsForThisBooking = 0;
      toasty.error({
        title: 'Maximum capacity reached!',
        msg: 'Only ' + maxSeatsAvailable +' seats are available now', 
        sound: false
      });
      return;
    }
    vm.pricingOptionIndexAndQuantity[index] = parseInt(vm.pricingOptionIndexAndQuantity[index]) + 1;
  }
  calculatePrice();
}

vm.getHtmlTrustedData = function(htmlData){
  return $sce.trustAsHtml(htmlData);
};


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
      if(vm.bookingProductDetails.maxSeatsPerBookingAllowed && (parseInt(totalSeatsForThisBooking) > vm.bookingProductDetails.maxSeatsPerBookingAllowed)) {
        productMaxSeatLimitError = true;
        $('.groupCustomQuantityQuantity').val('Please Select');
        reinitializeThePricingAndAddonOptionIndexAndQuantityArray();
        vm.totalDiscount = 0;
        vm.totalCalculatedSeatPrice = 0;
        vm.totalcalculatedAddonPrice = 0;
        vm.totalPayablePrice = 0;
        totalSeatsForThisBooking = 0;
        toasty.error({
          title: 'Maximum limit on seats!',
          msg: 'Maximum ' + vm.bookingProductDetails.maxSeatsPerBookingAllowed + ' seats can be booked',
          sound: false
        });
        return;
      }
      if (vm.bookingProductDetails.productAvailabilityType != 'Open Date' && parseInt(totalSeatsForThisBooking) > maxSeatsAvailable) {
        maxSeatLimitError = true;
        $('.groupCustomQuantityQuantity').val('Please Select');
        reinitializeThePricingAndAddonOptionIndexAndQuantityArray();
        vm.totalDiscount = 0;
        vm.totalCalculatedSeatPrice = 0;
        vm.totalcalculatedAddonPrice = 0;
        vm.totalPayablePrice = 0;
        totalSeatsForThisBooking = 0;
        toasty.error({
          title: 'Maximum capacity reached!',
          msg: 'Only ' + maxSeatsAvailable +' seats are available now',
          sound: false
        });
        return;
      }
      if (vm.validPricingOptions[index].pricingType != 'Group'
        || (vm.validPricingOptions[index].pricingType == 'Group'
          && vm.validPricingOptions[index].groupOption == 'Per Person')) {
        vm.totalCalculatedSeatPrice = vm.totalCalculatedSeatPrice +  (parseInt(vm.pricingOptionIndexAndQuantity[index]) * parseInt(vm.validPricingOptions[index].price));
        vm.calculatedSeatPriceForselectedBookingOptions[index] = parseInt(vm.pricingOptionIndexAndQuantity[index]) * parseInt(vm.validPricingOptions[index].price);
      } else {
        vm.totalCalculatedSeatPrice = vm.totalCalculatedSeatPrice + parseInt(vm.validPricingOptions[index].price);
        vm.calculatedSeatPriceForselectedBookingOptions[index] = parseInt(vm.validPricingOptions[index].price);
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
      /*toasty.error({
        title: 'Minimum value reached',
        msg: 'Value cannot be negative',
        sound: false
      }); */
      return;
    }
    vm.addonOptionIndexAndQuantity[index] = parseInt(vm.addonOptionIndexAndQuantity[index]) - 1;
  } else {
    if (vm.addonOptionIndexAndQuantity[index] == 1 && vm.bookingProductDetails.productAddons[index].applyAs == 'Per Booking') {
      toasty.error({
        title: 'Maximum value reached',
        msg: "Quantity of 'Per Booking' Addons cannot be greater than 1",
        sound: false
      });
      return;
    }
    vm.addonOptionIndexAndQuantity[index] = parseInt(vm.addonOptionIndexAndQuantity[index]) + 1;
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
  if (totalSeatsForThisBooking == 0 && totalAddonForThisBooking > 0) {
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

vm.areAddonsSelected = function () {
  for (var index = 0; index < vm.addonOptionIndexAndQuantity.length; index ++ ) {
    if (vm.addonOptionIndexAndQuantity[index] > 0)
      return true;
  }

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
        var key = new Date(vm.selectedDate).getTime().toString() + vm.selectedTimeslot.toString();
        var actualSessionIndex = dateTimestampToActualSession.get(key);
        bookingObject.productSession = vm.sessionsOfThisProduct[actualSessionIndex]._id;
      }
      bookingObject.selectedpricingoptionindexandquantity = vm.pricingOptionIndexAndQuantity;
      bookingObject.selectedaddonoptionsindexandquantity = vm.addonOptionIndexAndQuantity;
      bookingObject.selectedpricingoptionindexandprice = vm.calculatedSeatPriceForselectedBookingOptions;
      bookingObject.selectedaddonoptionsindexandprice = vm.calculatedAddonPriceForSelectedAddonOptions;
      bookingObject.numberOfSeats = totalSeatsForThisBooking;
      bookingObject.numberOfAddons = totalAddonForThisBooking;
      bookingObject.actualSessionDate = new Date(vm.selectedDate).getTime().toString();
      bookingObject.actualSessionTime = vm.selectedTimeslot.toString();
      // There is no discount for now. So Always zero
      bookingObject.totalDiscount = 0;
      // For now keep deposit zero, but need to handle this when payment option is integrated
      bookingObject.depositPaid = 0;
      // For now assign the calculated amount, but need to handle this when payment option is integrated as user can opt to pay only deposit.
      // Or may be some tours do not ask upfront payment
      bookingObject.totalAmountToBePaid = vm.totalPayablePrice;
      bookingObject.totalAmountPaid = vm.totalPayablePrice;
      bookingObject.totalAmountForProduct = vm.totalCalculatedSeatPrice;
      bookingObject.totalAmountForAddons = vm.totalcalculatedAddonPrice;
      bookingObject.paymentMode = 'tourgecko Wallet';
      //
      if ($location.search().via == 'bookButton')
         bookingObject.bookedVia = 'Book Button'
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
      if (!vm.bookingProductDetails.hostCompany.paymentActivated) {
        $state.go('guest.lockedCheckout');
      } else {
        if (vm.bookingProductDetails.hostCompany.paymentGateway == 'instamojo') {
          var bookingData = createBookingObject();
          var sessionId = bookingData.bookingDetails.productSession;
          var bookingContent= {bookingData: bookingData, sessionId: sessionId, isViaBookbutton: isViaBookbutton}
          $http.post('/api/payment/instamojo/', bookingContent).success (function (response) {
            // $("a.im-checkout-btn.btn--light").attr('href', response);
            if (response.error) {
              toasty.error({
                title: "Oops! seats are gone",
                msg: response.message,
                sound: false
              });
              return;
            }
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
                  }).error(function (error) {

                  });
              },
              "prefill": {
                  "name": bookingData.bookingDetails.providedGuestDetails.firstName + ' ' + bookingData.bookingDetails.providedGuestDetails.lastName,
                  "email": bookingData.bookingDetails.providedGuestDetails.email,
                  "contact": bookingData.bookingDetails.providedGuestDetails.mobile
              },
              "notes": {
                  "address": "my home jewel"
              },
              "theme": {
                  "color": "#F37254"
              }
            };
          var rzp1 = new Razorpay(options);
          rzp1.open();
        }
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

      if (index == vm.bookingProductDetails.productAddons.length - 1 || vm.bookingProductDetails.productAddons[index].name == '' || vm.bookingProductDetails.productAddons[index].price == '')
        return cssObject;
    }

    vm.getInquiryHours = function () {
      if (vm.companyData) {
        if (vm.companyData.inquiryTime == 'Anytime')
          return '(24 hours)';
        else
          return vm.companyData.inquiryTimeRangeFrom + ' to ' + vm.companyData.inquiryTimeRangeTo;
      }
    }

    vm.getDynamicCSSForDateSection = function (index) {
      var cssObject = {
        "border-bottom" : "none",
        "margin-bottom": "0"
      };
      if (index == vm.sesisonDateAndTimeForDisplayAndAvailability.length - 1)
        return cssObject;
    }

    vm.hideErrorsIfExists = function (step) {
      switch(step) {
        case 1:
           vm.showErrorsOnTopOfStep1 = false;
            break;
        case 2:
            vm.showErrorsOnTopOfStep2 = false;
            break;
        case 3:
            vm.showErrorsOnTopOfStep3 = false;
            break;
        default:
            //nothing
      }
      
    }

    vm.getDynamicCSSForAddonSection = function () {
      if (vm.bookingProductDetails && vm.bookingProductDetails.productAddons[0].name == '') {
        var cssObject = {
          "border-top" : "none"
        };
        return cssObject;
      }
    }

    var currentActiveMonth;
    var currentActiveYear;
    $('#loadingDivTourBooking').css('display', 'none');
    $('#tourgeckoBody').removeClass('waitCursor');

    $scope.findUnavailableMonthsAndDates = function (month, year) {
      $('#loadingDivTourBooking').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
        if (month == 'prev') {
          if (currentActiveMonth == 0) {
            currentActiveMonth = 11;
            currentActiveYear = parseInt(currentActiveYear) - 1;
          } else
            currentActiveMonth = currentActiveMonth - 1;
        } else if (month == 'next') {
           if (currentActiveMonth == 11) {
            currentActiveMonth = 0;
            currentActiveYear = parseInt(currentActiveYear) + 1;
           } else
            currentActiveMonth = currentActiveMonth + 1;
        } else {
          currentActiveYear = year;
          currentActiveMonth = month;
        }
        
        var monthDateIterator = new Date(currentActiveYear, currentActiveMonth, 1);
        var month = (monthDateIterator.getMonth() + 1).toString();
        var year = monthDateIterator.getFullYear().toString();
        var dayAdder = 1;
        var lastDay = new Date(currentActiveYear, currentActiveMonth + 1, 0);
        // For Open Date tour
        if (vm.bookingProductDetails.productAvailabilityType == 'Open Date') {
          if (vm.bookingProductDetails.productUnavailableMonths.indexOf(unavailableMonthsMap[currentActiveMonth]) != -1)
           $('.day-style').addClass('not-availableDates');
          else
            $('.day-style').removeClass('not-availableDates');

          // disable past dates
          // disable past dates
          if (lastDay.getTime() < new Date().getTime()) {
            $('.day-style').addClass('not-availableDates');
          }

          var daysDiff = (new Date() - monthDateIterator) / oneDay;

          $timeout(function() {
            for (var index = 0; index < daysDiff - 1; index++) {
              var day = monthDateIterator.getDate().toString();
              var divId = ('#' + day + month + year).toString();
              $(divId).addClass('not-availableDates');
              monthDateIterator.setDate(monthDateIterator.getDate() + dayAdder);
            }
          }, 1000);
          $('#loadingDivTourBooking').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        } else {
          // For Fixed departure tours
          var monthDateInMilliseconds = new Map();
          var daysDiff = (lastDay - monthDateIterator) / oneDay + 1;
          
          $timeout(function() {
            if (vm.bookingProductDetails.productAvailabilityType != 'Open Date') {
              for (var index = 0; index < daysDiff; index++) {
                monthDateInMilliseconds.set(monthDateIterator.getTime(), true);
                var day = monthDateIterator.getDate().toString();
                var divId = ('#' + day + month + year).toString();
                $(divId).addClass('not-availableDates');
                monthDateIterator.setDate(monthDateIterator.getDate() + dayAdder);
              }
            }
            for (var index = 0; index < vm.datesOfTheSessionsOfThisProduct.length; index++) {
              if (sessionFullyBooked.get(vm.datesOfTheSessionsOfThisProduct[index]) == 'No' && monthDateInMilliseconds.get(new Date(vm.datesOfTheSessionsOfThisProduct[index]).getTime())) {
                var day = new Date(vm.datesOfTheSessionsOfThisProduct[index]).getDate().toString();
                var divId = ('#' + day + month + year).toString();
                $(divId).removeClass('not-availableDates');
              }
            }
            $('#loadingDivTourBooking').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
          }, 1000);
        }
    }

    vm.timesForThisDate = [];
    $scope.setThisDateAsSelected = function (displayDate) {
      vm.selectedTimeslot = 'Select Time';
      vm.selectedDate = displayDate;
      if(vm.bookingProductDetails.productAvailabilityType == 'Open Date') {
        if (vm.bookingProductDetails.productTimeSlotsAvailability == 'Fixed Slots' && vm.bookingProductDetails.productTimeSlots.length > 0)
          vm.timesForThisDate = vm.bookingProductDetails.productTimeSlots;
      } else {
        vm.timesForThisDate = dateToTimeslots.get(new Date(vm.selectedDate).getTime().toString());
        if (vm.timesForThisDate.length == 1 && vm.timesForThisDate[0] == 'No Time')
          vm.timesForThisDate.length  = 0;

        if (vm.timesForThisDate.length == 0) {
          maxSeatsAvailable = getRemainingSeatsForCalendar('No Time');
        }
      }
      $scope.$apply();
    }

    function findThePricingOptionsForSelectedDateTimestamp (date, time) {
      vm.totalDiscount = 0;
      vm.totalCalculatedSeatPrice = 0;
      vm.totalcalculatedAddonPrice = 0;
      vm.totalPayablePrice = 0;
      // For open date, irrespective of fate and time selected, pricing options will always be constant
      if(vm.bookingProductDetails.productAvailabilityType == 'Open Date')
        vm.validPricingOptions = vm.bookingProductDetails.productPricingOptions;
      else {
        if (time == 'Select Time')
          time = 'No Time';
        var key = new Date(date).getTime().toString() + time.toString();
        if (vm.sessionsOfThisProduct[dateTimestampToActualSession.get(key)].isSessionPricingValid)
          vm.validPricingOptions = vm.sessionsOfThisProduct[dateTimestampToActualSession.get(key)].sessionPricingDetails;
        else
          vm.validPricingOptions = vm.bookingProductDetails.productPricingOptions;
      }
      for (var index = 0; index < vm.validPricingOptions.length; index ++) {
        if (vm.validPricingOptions[index].pricingType != 'Custom'
          && vm.validPricingOptions[index].pricingType != 'Group')
          vm.pricingOptionIndexAndQuantity[index] = 0;
        else
          vm.pricingOptionIndexAndQuantity[index] = 'Please Select';
      }

      for (var index = 0; index < vm.bookingProductDetails.productAddons.length; index++)
        vm.addonOptionIndexAndQuantity[index]  = 0;
    }

    vm.getSeatsRemainingForList = function (session, index) {
      if(vm.bookingProductDetails.productAvailabilityType == 'Fixed Departure'  && session.capacityDetails.sessionSeatsLimitType == 'unlimited') {
        if (session.capacityDetails.isSessionAvailabilityVisibleToGuests)
          return '-';
        else
          $('#remainingSeats'+index).addClass('removeBackgroundColor');
      } else {
        var remainingSeats =  getRemainingSeatsForList(session);
        if (remainingSeats == 0) {
          $('#optionsRadios' + index).attr('disabled', 'true');
        }
        remainingSeats = remainingSeats <= 1 ? remainingSeats.toString() + ' seat available' : remainingSeats.toString() + ' seats available';
        if (session.capacityDetails.isSessionAvailabilityVisibleToGuests)
          return remainingSeats;
        else
          $('#remainingSeats'+index).addClass('removeBackgroundColor');
      }
      return '';
    }

    function getRemainingSeatsForList (session) {
      var remainingSeats;
      var key;
      if (session)
        key = new Date(session.startDate).getTime().toString() + session.startTime.toString();
      var actualSessionIndex = dateTimestampToActualSession.get(key);
      if (vm.sessionsOfThisProduct && vm.sessionsOfThisProduct[actualSessionIndex] && vm.sessionsOfThisProduct[actualSessionIndex].numberOfSeats && vm.sessionsOfThisProduct[actualSessionIndex].numberOfSeats[key]) {
        remainingSeats = parseInt(vm.sessionsOfThisProduct[actualSessionIndex].sessionCapacityDetails.sessionSeatLimit) - parseInt(vm.sessionsOfThisProduct[actualSessionIndex].numberOfSeats[key]);
      } else {
        remainingSeats = parseInt(session.capacityDetails.sessionSeatLimit);
      }

      return remainingSeats;
    }

    vm.getSeatsRemainingForCalendar = function (time) {
      var key = new Date(vm.selectedDate).getTime().toString() + time.toString();
      var actualSessionIndex = dateTimestampToActualSession.get(key);
      if(vm.bookingProductDetails.productAvailabilityType == 'Open Date')
        return '';
      else if (vm.bookingProductDetails.productAvailabilityType == 'Fixed Departure' && vm.sessionsOfThisProduct[actualSessionIndex].sessionCapacityDetails.sessionSeatsLimitType == 'unlimited') {
        if (vm.sessionsOfThisProduct[actualSessionIndex].sessionCapacityDetails.isSessionAvailabilityVisibleToGuests)
          return ' - (-)';
      } else {
        var remainingSeats = getRemainingSeatsForCalendar(time);
        remainingSeats = remainingSeats <= 1 ? remainingSeats.toString() + ' seat available' : remainingSeats.toString() + ' seats available';
        if (vm.sessionsOfThisProduct[actualSessionIndex].sessionCapacityDetails.isSessionAvailabilityVisibleToGuests)
          return ' - (' + remainingSeats + ')';
      }
      return '';
    }

    function getRemainingSeatsForCalendar (time) {
      var remainingSeats;
      var key = new Date(vm.selectedDate).getTime().toString() + time.toString();
      var actualSessionIndex = dateTimestampToActualSession.get(key);
      if (vm.sessionsOfThisProduct[actualSessionIndex] && vm.sessionsOfThisProduct[actualSessionIndex].numberOfSeats && vm.sessionsOfThisProduct[actualSessionIndex].numberOfSeats[key]) {
        remainingSeats = parseInt(vm.sessionsOfThisProduct[actualSessionIndex].sessionCapacityDetails.sessionSeatLimit) - parseInt(vm.sessionsOfThisProduct[actualSessionIndex].numberOfSeats[key]);
      } else
        remainingSeats = parseInt(vm.sessionsOfThisProduct[actualSessionIndex].sessionCapacityDetails.sessionSeatLimit);

      return remainingSeats;
    }

    vm.findMaximumCapcityOfThisTimestamp = function (time) {
      vm.selectedTimeslot = time;
      maxSeatsAvailable = parseInt(getRemainingSeatsForCalendar(time));
    }

    vm.getTheSelectedTimeslot = function () {
      if (vm.selectedTimeslot != 'No Time' && vm.selectedTimeslot != 'Select Time')
        return vm.selectedTimeslot;
      else
        return '';
    }

    function reinitializeThePricingAndAddonOptionIndexAndQuantityArray () {
      for (var index = 0; index < vm.validPricingOptions.length; index ++) {
        if (vm.validPricingOptions[index].pricingType != 'Custom'
          && vm.validPricingOptions[index].pricingType != 'Group')
          vm.pricingOptionIndexAndQuantity[index] = 0;
        else
          vm.pricingOptionIndexAndQuantity[index] = 'Please Select';
      }

      for (var index = 0; index < vm.addonOptionIndexAndQuantity.length; index++)
        vm.addonOptionIndexAndQuantity[index] = 0;
    }

    vm.sendContentToHost = function (isValid) {
      vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.contentToHostForm');
        return false;
      }
      $('#loadingDivTourBooking').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      var communicationParams = {guestDetails: vm.contentToHost, hostMail: vm.companyData.inquiryEmail}
      $http.post('/api/host/sendContentToHostFromContactUs/', communicationParams).success(function (response) {
        $('#loadingDivTourBooking').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
        toasty.success({
          title: 'Message sent!',
          msg: 'Your message has been sent!',
          sound: false
        });
        vm.contentToHost = null;
        $('#dismissContactUsModal').click();
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivTourBooking').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
        toasty.error({
          title: 'Something went wrong!',
          msg: 'Mail could not be send. Please contact Tourgecko!',
          sound: false
        });
      });
    }
  }
}());
