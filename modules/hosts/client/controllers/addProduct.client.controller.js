(function () {
  'use strict';

  angular
    .module('hosts', [])
    .controller('AddProductController', AddProductController)
    .filter('htmlData', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    });

  AddProductController.$inject = ['$scope', '$state', '$stateParams', '$http', '$timeout', '$window', '$location', 'Upload', 'ProductDataShareService'];

  function AddProductController($scope, $state, $stateParams, $http, $timeout, $window, $location, Upload, ProductDataShareService) {
/* ------------------------------------------------------------------------------------------------------------------------- */
    /* Initializitaion */
/* ------------------------------------------------------------------------------------------------------------------------- */
    var vm = this;
    vm.error = null;
    vm.form = {};
    vm.helpVisible = true;
    vm.isAddonAvailable = false;
    vm.isDepositApplicable = false;
    vm.isAvailableThroughoutTheYear = true;
    vm.productGrade = 'Easy';
    vm.productAvailabilityType = 'Open Date';
    vm.productDurationType = 'Days';
    vm.productSeatsLimitType = 'limited';
    vm.pricingOptions = ['Everyone'];
    vm.fixedProductSchedule = [];
    vm.productScheduledDates = [];
    vm.imageFileSelected = false;
    vm.mapFileSelected = false;
    vm.showProgressbar = false;
    vm.addMorePhotos = false;
    vm.productPictureURLs = [];
    vm.productMapURLs = [];
    vm.itineraries = [];
    vm.dayCounter = 1;
    vm.showCreatedItinerary = false;
    vm.showSaveButtonForItineraries = false;
    vm.showEditItineraryElements = false;
    vm.heading = '';
    vm.calculatedDay  = true;
    vm.productType =  $window.localStorage.getItem('productType');
    vm.isProductScheduled = false;
    vm.isFixedTourTimeSlotAvailable = false;
    vm.fixedDepartureSessionCounter = -1;
    vm.ShowCalendarButton = true;
    vm.isNewPricingApplicableOnOldSessions = false;
    vm.isNewPricingApplicableOnNewSessions = false;
    $scope.timeslots = [];
    $scope.productTimeSlotsAvailability = 'No Time Required';
    $scope.departureSessions = [];
    var sessionSpecialPricing = [];
    var initializing = true;
    var isPricingOptionsModified = false;
    var isSessionCreatedWhileEditing = false;
    var isSpecialPricingInSessionCreatedWhileEditing = false;
    var currentSessionHasSpecialPricing = false;
    var specialPricingIndexTracker = new Set();
    var sessionMonthsCovered = [];
    var productPictureURLs;
    var productMapURLs;
    var previousPricingOption = [];
    var standardTagSet = new Set();
    standardTagSet.add('Hiking');
    standardTagSet.add('Trekking');
    standardTagSet.add('Cycling');
    standardTagSet.add('Camping');
/* ------------------------------------------------------------------------------------------------------------------------- */
    /* Initialization ends */
/* ------------------------------------------------------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------------------------------------------------- */
/* This is added in case user is redirected here for tour edit. We will be disabling body when user will click on Edit button.
 * We should enable the body here.
 */
/* ------------------------------------------------------------------------------------------------------------------------- */
$('#tourgeckoBody').removeClass('disableBody');
// $("#myNavbar .nav").find(".active").removeClass("active");

/* ------------------------------------------------------------------------------------------------------------------------- */
    /* Check whether product is getting created or edited */
/* ------------------------------------------------------------------------------------------------------------------------- */
    var productId = $location.path().split('/')[4];
    if(productId) {
      $http.get('/api/host/product/'+ productId).success(function (response) {
          vm.tour = response[0];
          $scope.$watch('vm.pricingParams', function() {
            if (initializing) {
              $timeout(function() { initializing = false; });
            } else {
              isPricingOptionsModified = true;
            }
          }, true);
          addImagesMapEditMode(vm.tour.productPictureURLs, vm.tour.productMapURLs);

          $scope.productTimeSlotsAvailability = vm.tour.productTimeSlotsAvailability;

          if (vm.tour.productTimeSlotsAvailability == 'Fixed Slots')
            createTimeslotsEditMode(vm.tour.productTimeSlots);
          
          vm.productAvailabilityType = vm.tour.productAvailabilityType;

          if(vm.tour.productAvailabilityType == 'Fixed Departure')
            openFixedDeparturePanel();

          vm.itineraries = vm.tour.productItineraryDescription;
          vm.pricingParams = vm.tour.productPricingOptions;
          vm.isAddonAvailable = vm.tour.areAddonsAvailable;
          vm.addonParams.params = vm.tour.productAddons;
          vm.isDepositApplicable = vm.tour.isDepositNeeded;
          vm.productDurationType = vm.tour.productDurationType;
          vm.productSeatsLimitType = vm.tour.productSeatsLimitType;
          vm.productSeatsLimitType = vm.tour.productSeatsLimitType;
          vm.productScheduledDates = vm.tour.productScheduledDates;
          previousPricingOption = vm.tour.productPricingOptions;
          vm.showCreatedItinerary = true;
          for(var index = 0; index < vm.tour.productTags.length; index++) {
            if(standardTagSet.has(vm.tour.productTags[index])) {
              $timeout(function() {
                  $("#productTagging").select2('val', vm.tour.productTags[index]);
                  $("#productTagging").trigger("change");
              });
            } else {
              var option=jQuery("<option>").attr("value",vm.tour.productTags[index].toString()).html(vm.tour.productTags[index]);
              jQuery("#productTagging").append(option);
              $timeout(function() {
                $("#productTagging").select2('val', vm.tour.productTags[index]);
                $("#productTagging").trigger("change");
              });
            }
          }
          var maxVal = findDayCounterValue();
          if (maxVal == '-Infinity')
            vm.dayCounter = 1;
          else
            vm.dayCounter = maxVal + 1;
          setRichTextData();
      });
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* function ends */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* function to get the next day counter */
/* ------------------------------------------------------------------------------------------------------------------------- */
function findDayCounterValue () {
  return Math.max.apply(Math,vm.itineraries.map(function(o){return o.day;}));
}
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* function ends */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Function to set tich text data for tour edit */
/* ------------------------------------------------------------------------------------------------------------------------- */

function setRichTextData () {
  CKEDITOR.instances.describe_tour_briefly.setData(vm.tour.productSummary);
  CKEDITOR.instances.cancellationPolicies.setData(vm.tour.productCancellationPolicy);
  CKEDITOR.instances.tour_guidelines.setData(vm.tour.productGuidelines);
  CKEDITOR.instances.tour_inclusions.setData(vm.tour.productInclusions);
  CKEDITOR.instances.tour_exclusions.setData(vm.tour.productExclusions);
}

/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* function ends */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */
    /* Pricing parameters initialization, handler and validations*/
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.pricingParams = [{
      'pricingType': 'Everyone'
    }];

    vm.initializePricingOptions = function (index) {
      if(vm.pricingParams[index].pricingType == 'Group')
        vm.pricingParams[index].groupOption = 'Per Group';
      else
        delete vm.pricingParams[index]['groupOption'];
    }

    vm.addPricingOption = function(index) {
      var isValid = validatePricingOption(index);
      if (isValid) {
        var addPricingOption = {'pricingType': 'Everyone'};
        vm.pricingParams.push(addPricingOption);
      }
    };

    /* Group pricing validation start here. This validation will be executed when host is creating different options to guide the host */
    function validatePricingOption (index) {
      var indexTracker;
      var lastGroupOption;
      if(vm.pricingParams[index].pricingType == 'Group') {
        if(vm.pricingParams[index].minGroupSize === undefined) {
          alert('Please enter a valid range of the group ');
          return false;
        }
        if(vm.pricingParams[index].minGroupSize !== undefined && vm.pricingParams[index].maxGroupSize !== undefined && parseInt(vm.pricingParams[index].minGroupSize) >= parseInt(vm.pricingParams[index].maxGroupSize)) {
          alert('group max size should be greater than group min size ');
          return false;
        }
        if (index > 0) {
          for (indexTracker = index-1; index >= 0; index --) {
            if (vm.pricingParams[indexTracker].pricingType == 'Group') {
              lastGroupOption = vm.pricingParams[indexTracker];
              break;
            }
          }
          if (lastGroupOption !== undefined) {
            if (lastGroupOption.maxGroupSize === undefined || (lastGroupOption.maxGroupSize !== undefined && (parseInt(lastGroupOption.maxGroupSize)  >= parseInt(vm.pricingParams[index].minGroupSize)))) {
              alert('Max size option of previous group should be less than the min size option of current group ');
              return false;
            } else if (parseInt(lastGroupOption.maxGroupSize) <= parseInt(lastGroupOption.minGroupSize)) {
              alert('group max size should be greater than group min size in previous group option ');
              return false;
            }
          }
        }
      } else {
        if (vm.pricingParams[index] && vm.pricingParams[index].pricingType == 'Everyone') {
          if (index > 0) {
            alert('If you want same price for Everyone then Please remove all the options and keep only Price for Everyone');
            return false;
          } else {
            alert('You have already added price for Everyone. No other option is valid now');
            return false;
          }
        }
      }
      return true;
    };

    /* This validation will be executed when host is saving the tour, in case host may have change very old group price option. We are only validating
       latest one in previous validation */
    function finalValidateOfPricing () {
      var index;
      var groupRange = [];
      var isEveryonePricingPresent;
      for (index = 0; index < vm.pricingParams.length; index++ ) {
        if (vm.pricingParams[index].pricingType == 'Everyone')
          isEveryonePricingPresent = true;
        if (vm.pricingParams[index].pricingType == 'Group') {
          groupRange.push(vm.pricingParams[index].minGroupSize);
          if(vm.pricingParams[index].maxGroupSize === undefined)
            groupRange.push(Number.MAX_VALUE)
          else
            groupRange.push(vm.pricingParams[index].maxGroupSize);
        }
      }

      if (groupRange.length > 0) {
        for (index = 0; index < groupRange.length - 1; index ++) {
          if (parseInt(groupRange[index + 1]) < parseInt(groupRange[index])) {
            vm.pricingValid = false;
            return false;
          }
        }
      }

      if(isEveryonePricingPresent == true && vm.pricingParams.length > 1) {
        vm.pricingValid = false
        return false;
      }
      vm.pricingValid = true;
      return true;
    }

    vm.removePricingOption = function(index) {
      vm.pricingParams.splice(index, 1);
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* pricing parameters initialization, handler and validation ends here*/
/* ------------------------------------------------------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Addon parameters initialization and handler*/
/* ------------------------------------------------------------------------------------------------------------------------- */

    vm.addonParams = {
      params: [{
        name: '',
        price: '',
        applyAs: 'Per Booking',
        description: ''
      }]
    };

    vm.addMoreAddons = function() {
      vm.addonParams.params.push({
        name: '',
        price: '',
        applyAs: 'Per Booking',
        description: ''
      });
    };

    vm.removeAddon = function(index) {
      if (vm.addonParams.params.length === 1)
        vm.isAddonAvailable = false;
      else
        vm.addonParams.params.splice(index, 1);
    };
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Addon parameters initialization and handler, ends here*/
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Itinerary creation, edit, delete and save */
/* ------------------------------------------------------------------------------------------------------------------------- */

    vm.createItinerary = function(done) {
      if(vm.productDurationType == 'Hours' && done != true) {
        alert ('Your tour is hourly, There should be only one Day itinerary. Please click on Done');
        return false;
      }
      vm.calculatedDay = true;
      vm.itineraries.push({'title': vm.heading, 'description': CKEDITOR.instances.tourItinerary.getData(), 'day': vm.dayCounter});
      vm.itineraries.sort(function(obj1, obj2) {
        return obj1.day - obj2.day;
      });

      vm.dayCounter = findDayCounterValue() + 1;
      vm.showCreatedItinerary = true;
      CKEDITOR.instances.tourItinerary.setData('');
      vm.heading = '';
    }

    var indexSaved;
    vm.editItinerary = function(index) {
      vm.showCreatedItinerary = false;
      vm.editIndex = index;
      indexSaved = index;
      vm.showEditItineraryElements = true;
      vm.editHeading = vm.itineraries[index].title;
      var idOfEditor = 'editItinerary'+index;

      CKEDITOR.replace(idOfEditor, {
          toolbarGroups: [
            {name: 'basicstyles', groups: 'basicstyles'},
            {name: 'paragraph',   groups: [ 'list', 'indent', 'align']}
          ]
      });

      
      CKEDITOR.instances[idOfEditor].setData(vm.itineraries[index].description);
    }

    vm.saveEditedItinerary = function(index) {
      var idOfEditor = 'editItinerary'+index;
      vm.itineraries[indexSaved].title = vm.editHeading;
      vm.itineraries[indexSaved].description = CKEDITOR.instances[idOfEditor].getData();
      vm.showEditItineraryElements = false;
      vm.showCreatedItinerary = true;
      CKEDITOR.instances[idOfEditor].setData('');
      vm.editHeading = '';

      if (CKEDITOR.instances[idOfEditor]) 
        CKEDITOR.instances[idOfEditor].destroy();
    }

    vm.deleteItinerary = function(index) {
      vm.itineraries.splice(index,1);
    }

    vm.getHtmlTrustedData = function(htmlData){
      return $sce.trustAsHtml(htmlData);
    };

    vm.changeDay = function () {
      vm.calculatedDay = false;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Itinerary creation, edit and save, ends here*/
/* ------------------------------------------------------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Fixed Date departure session validation functions */
/* ------------------------------------------------------------------------------------------------------------------------- */
vm.openDepartureSessionModal = function() {
  vm.isSpecialPricingPresent = false;
  if(vm.tour === undefined || (vm.tour && vm.tour.productTitle === undefined)) {
    alert('Please enter tour name before creating departure session');
    return false;
  } else if((vm.pricingParams.length > 1 && vm.pricingValid == false) || (vm.pricingParams.length == 1 && vm.pricingParams[0].price === undefined)) {
    alert('Please enter pricing details before creating departure session');
    return false;
  } else {
    var modalOpened = true;
    vm.sessionPricing = []
    angular.copy(vm.pricingParams, vm.sessionPricing);
    vm.fixedDepartureSessionCounter++;
    var newSchedule = {'repeatBehavior':'Do not repeat'}
    vm.fixedProductSchedule[vm.fixedDepartureSessionCounter] = newSchedule;
    $scope.$watch('vm.fixedProductSchedule', function() {
      if (initializing) {
        $timeout(function() { initializing = false; });
      } else {
        isSessionCreatedWhileEditing = true;
      }
    }, true);

    $scope.$watch('vm.sessionPricing', function() {
    if (initializing || modalOpened) {
      $timeout(function() { initializing = false; modalOpened = false; });
      } else {
        isSpecialPricingInSessionCreatedWhileEditing = true;
        currentSessionHasSpecialPricing = true;
      }
    }, true);

    vm.isFixedTourTimeSlotAvailable = false;
    $('#departureSession').fadeIn();
  }
}

vm.createDepartureSession = function () {
  if(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate === undefined) {
    alert('Please select date for creating a departure session');
    return false;
  } else if (vm.isFixedTourTimeSlotAvailable == true && ($('#dsTimeSlot').val() === undefined || $('#dsTimeSlot').val() == null || $('#dsTimeSlot').val() == '')) {
    alert('You have opted for time slot. Please create time slot or opt out the same');
    return false;
  } else if ((vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Daily' ||
              vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Weekly') &&
              vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatTillDate === undefined) {
    alert('Please select the end date of reptition of this tour');
    return false;
  }
  if ((vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Weekly') && 
      (vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatOnDays === undefined || vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatOnDays.length == 0)){
    alert('Please select the week days on which this tour will repeat');
    return false;
  }
  

  vm.isProductScheduled = true;
  
  $("#departureSession").fadeOut();
  $('.modal-backdrop').remove();

  // if any tour is repeted, then populate the calendar accordingly
  var weekDaysNumber = new Map();
      weekDaysNumber.set('Sunday', 0);
      weekDaysNumber.set('Monday', 1);
      weekDaysNumber.set('Tuesday', 2);
      weekDaysNumber.set('Wednesday', 3);
      weekDaysNumber.set('Thursday', 4);
      weekDaysNumber.set('Friday', 5);
      weekDaysNumber.set('Saturday', 6);
  var repeatedDays = 0;
  var notAllowedDays = new Set();
  var allowedDays = new Set();

  if(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Daily' ||
     vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Weekly') {
    var firstDate = new Date(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatTillDate);
    var secondDate = new Date(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate);
    var oneDay = 24 * 60 * 60 * 1000;
    repeatedDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
    repeatedDays = repeatedDays + 1;
    vm.tour.isRepeatingProduct = true;

    vm.tour.productRepeatEndDate = vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatTillDate;
    vm.tour.productRepeatStartDate = vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate;

    if (vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Daily' && vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].notRepeatOnDays) {
      vm.tour.productRepeatType = 'Daily';
      for (var index = 0; index < vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].notRepeatOnDays.length; index++) {
        notAllowedDays.add(weekDaysNumber.get(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].notRepeatOnDays[index]));
        if (index == 0)
          vm.tour.productNonRepeatDays = vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].notRepeatOnDays[index] + 's';
        else if (index == vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].notRepeatOnDays.length - 1 && index != 0)
          vm.tour.productNonRepeatDays = vm.tour.productNonRepeatDays + ' and ' + vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].notRepeatOnDays[index] + 's';
        else
          vm.tour.productNonRepeatDays = vm.tour.productNonRepeatDays + ', ' + vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].notRepeatOnDays[index] + 's';
      }
    }
    if (vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Weekly' && vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatOnDays) {
      vm.tour.productRepeatType = 'Weekly';
      for (var index = 0; index < vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatOnDays.length; index++) {
        allowedDays.add(weekDaysNumber.get(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatOnDays[index]));
        if (index == 0)
          vm.tour.productRepeatDays = vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatOnDays[index] + 's';
        else if (index == vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatOnDays.length - 1 && index != 0)
          vm.tour.productRepeatDays = vm.tour.productRepeatDays + ' and ' + vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatOnDays[index] + 's';
        else
          vm.tour.productRepeatDays = vm.tour.productRepeatDays + ', ' + vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatOnDays[index] + 's';
      }
    }
  }

  var eventDate = new Date(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate);
  //eventDate = new Date(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate(),  eventDate.getUTCHours(), eventDate.getUTCMinutes(), eventDate.getUTCSeconds());
  
  var monthTracker = new Set();
  var monthsCovered = [];

  for (var index = 0; index <= repeatedDays; index ++) {
    var needToSave = true;
    if(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Daily' && notAllowedDays.has(eventDate.getDay()) || 
      vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Weekly' && !allowedDays.has(eventDate.getDay()) ||
      eventDate > firstDate)
      needToSave = false;
    
    if (needToSave) {
      var uniqueString = eventDate.getMonth().toString() + eventDate.getUTCFullYear().toString();
      if (!monthTracker.has(uniqueString)) {
        monthTracker.add(uniqueString);
        monthsCovered.push(uniqueString);
      }
    }

    if (needToSave) {
      if ($window.events.length % 3 == 0) {
        if (window.innerWidth > 767)
          $window.events.push({
            title: '<span class="eventname orangeFC">' + vm.tour.productTitle + '</span><br><i class="zmdi zmdi-circle orangeFC"></i>',
            start: eventDate,
            allDay: true,
            backgroundColor: 'rgba(237,156,40, 0.2)'
          });
        else
          $window.events.push({
            title: '<i class="zmdi zmdi-circle orangeFC"></i>',
            start: eventDate,
            allDay: true,
            backgroundColor: 'rgba(237,156,40, 0.2)'
          });
      } else if ($window.events.length % 3 == 1) {
        if (window.innerWidth > 767)
          $window.events.push({
            title: '<span class="eventname greenFC">' + vm.tour.productTitle + '</span><br><i class="zmdi zmdi-circle greenFC"></i>',
            start: eventDate,
            allDay: true,
            backgroundColor: 'rgba(66,174,94,0.2)'
          });
        else
          $window.events.push({
            title: '<i class="zmdi zmdi-circle greenFC"></i>',
            start: eventDate,
            allDay: true,
            backgroundColor: 'rgba(66,174,94,0.2)'
          });
      } else {
        if (window.innerWidth > 767)
          $window.events.push({
            title: '<span class="eventname redFC">' + vm.tour.productTitle + '</span><br><i class="zmdi zmdi-circle redFC"></i>',
            start: eventDate,
            allDay: true,
            backgroundColor: 'rgba(216,64,64,0.2)'
          });
        else
          $window.events.push({
            title: '<i class="zmdi zmdi-circle redFC"></i>',
            start: eventDate,
            allDay: true,
            backgroundColor: 'rgba(216,64,64,0.2)'
          });
      }
    }
    eventDate = new Date (eventDate);
    eventDate = eventDate.setDate(eventDate.getDate() + 1);
    eventDate = new Date (eventDate);
  }
  
  sessionMonthsCovered[vm.fixedDepartureSessionCounter] = monthsCovered;
  vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startTime = $('#dsTimeSlot').val();
  vm.productScheduledDates.push(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate);
  sessionSpecialPricing[vm.fixedDepartureSessionCounter] = vm.sessionPricing;
  if (currentSessionHasSpecialPricing == true) {
    currentSessionHasSpecialPricing = false;
    specialPricingIndexTracker.add(vm.fixedDepartureSessionCounter);
  }

  if (vm.ShowCalendarButton && vm.fixedDepartureSessionCounter == 0) {
    openCalendarForFixedDepartures();
    if (vm.ShowCalendarButton)
      vm.ShowCalendarButton = !vm.ShowCalendarButton;
  }
  else
    rebuildFullCalendar();

  $(".ds_repeat_daily").hide();
  $(".dsChangePrice").hide();
  return true;
  
}

/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Fixed Date departure session validation function, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Save function */
/* ------------------------------------------------------------------------------------------------------------------------- */

    // Save the data here
    vm.save = function (isValid) {
      // return;
      var isPricingCorrect = finalValidateOfPricing();
      
      if (isPricingCorrect == false) {
        alert('Please check pricing options range. Each group should have range greater than previous And If Price for Everyone is present, no other option should be present.')
        return false;
      } else if (vm.pricingParams.length == 1 && vm.pricingParams[0].price === undefined) {
        alert('Please provide at least one pricing options for the tour to be bookable');
        return false;
      }
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tourForm');
        return false;
      }
      if(productId !== undefined && isPricingOptionsModified == true && vm.tour.productScheduledDates.length > 0) {
        $('#pricingApplicability').click();
      } else {
        vm.showLoaderForProductSave = true;
        $('#tourgeckoBody').addClass('disableBody');
        $('#tours').addClass('waitCursor');
        setProductInformation();
        saveTheProduct();
      }
    };
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Save function ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.askExtraConfirmation = function (extraConfirmation) {
      vm.isNewPricingApplicableOnOldSessions = extraConfirmation;
      if (isSessionCreatedWhileEditing == true && isSpecialPricingInSessionCreatedWhileEditing == true)
        $('#sessionCreatedWithModifiedPrice').click();
      else {
        if (isSessionCreatedWhileEditing == true) {
          for (var index = 0; index < sessionSpecialPricing.length; index++)
            sessionSpecialPricing[index] = vm.pricingParams;
        }
        vm.showLoaderForProductSave = true;
        $('#tourgeckoBody').addClass('disableBody');
        $('#tours').addClass('waitCursor');
        setProductInformation();
        saveTheProduct();
      }
    }

    vm.saveTheEditedProduct = function (applyPriceToNewSessions) {
      if (applyPriceToNewSessions == false) {
        for (var index = 0; index < sessionSpecialPricing.length; index ++) {
          if (!specialPricingIndexTracker.has(index)) {
            sessionSpecialPricing[index] = vm.pricingParams;
          }
        }
      }
      vm.isNewPricingApplicableOnNewSessions = applyPriceToNewSessions;
      vm.showLoaderForProductSave = true;
      $('#tourgeckoBody').addClass('disableBody');
      $('#tours').addClass('waitCursor');
      setProductInformation();
      saveTheProduct();
    }

    function saveTheProduct () {
      if(productId) {
        $window.localStorage.setItem('productSuccessfullyEdited', 'Yes');
        $http.post('/api/host/editproduct/', {tour: vm.tour, toursessions: vm.fixedProductSchedule, 
                                              sessionPricings: sessionSpecialPricing, monthsCovered: sessionMonthsCovered,
                                              changePreviouslyCreatedSessionPricing: vm.isNewPricingApplicableOnOldSessions,
                                              changeNewlyCreatedSessionPricing: vm.isNewPricingApplicableOnNewSessions})
        .success(function (response) {
        }).error(function (response) {
          vm.error = response.message;
        });
      } else {
        $http.post('/api/host/product/', {tour: vm.tour, toursessions: vm.fixedProductSchedule, sessionPricings: sessionSpecialPricing, monthsCovered: sessionMonthsCovered})
        .success(function (response) {
          //success
        }).error(function (response) {
          vm.error = response.message;
        });
      }
      $('#tourgeckoBody').removeClass('disableBody');
      $('#tours').removeClass('waitCursor');
      vm.showLoaderForProductSave = false;
      $state.go('host.tours');
    }

    $scope.updateImageStorage = function (newData) {
      $window.globalImageFileStorage = newData;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Image upload */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.uploadImage = function () {
      if ($window.imageSizeLimitExceeded) {
        alert('Please either remove or replace the marked images');
        return false;
      }
      vm.showLoaderForProductSave = true;
      $('#tourgeckoBody').addClass('disableBody');
      $('#tours').addClass('waitCursor');
      $('#pictureUploadLimitExceeded').hide();
      vm.imageSuccess = vm.imageError = null;
      Upload.upload({
        url: 'api/product/productPictureUploads/',
        arrayKey: '',
        data: {
          files: $window.globalImageFileStorage,
          previousFiles: $window.globalImageFileStorageEdit
        }
      }).then(function (response) {
        onImageUploadSuccess(response.data);
      }, function (response) {
        if (response.status > 0) onImageUploadError(response.data);
      });
    };
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Image upload, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */
    function onImageUploadSuccess(response) {
      if ($window.globalImageFileStorage.length == 0)
        vm.imageError = 'You have not selected any photos to upload';
      else
        vm.imageSuccess = 'Photos have been uploaded successfully'
      $('#tourgeckoBody').removeClass('disableBody');
      $('#tours').removeClass('waitCursor');
      vm.showLoaderForProductSave = false;
      productPictureURLs = response;
    }

    function onImageUploadError(response) {
      $('#tourgeckoBody').removeClass('disableBody');
      $('#tours').removeClass('waitCursor');
      vm.showLoaderForProductSave = false;
      vm.imageError = 'Some error occurred. Please try again. If error persists, contact tourgecko';
     /* if (response == 'LIMIT_FILE_SIZE') {
        for(var index = 0; index < $window.globalImageFileStorage.length; index++) {
          if ($window.globalImageFileStorage[index].size > 5242880) {
            var parentElement = document.getElementById('parentdiv' + $window.globalImageFileStorage[index].index);
            var markAsToBeRemoved = $('<span>To Be Removed<span>')
            .attr('id', 'elementToBeRemoved' + $window.globalImageFileStorage[index].index)
            .attr('class', 'markAsToBeRemoved');
            markAsToBeRemoved.appendTo(parentElement);
            // $window.globalImageFileStorage.splice($window.globalImageFileStorage[index], 1);
          }
        }
        vm.imageError = 'Marked images exceeds 5MB limit. Please remove them.'
      } 

      if (response == 'LIMIT_FILE_COUNT') {
        var extraImages = $window.globalImageFileStorage.length - 5;
        var extraImagesString;
        if (extraImages == 1)
          extraImagesString = extraImages + ' image';
        else
          extraImagesString = extraImages + ' images';
        vm.imageError = 'Only 5 image upload are allowed. Please remove at least ' + extraImagesString;
      } */
    }

/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Map upload */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.uploadMap = function () {
      if ($window.mapSizeLimitExceeded) {
        alert('Please either remove or replace the marked images');
        return false;
      }
      vm.showLoaderForProductSave = true;
      $('#tourgeckoBody').addClass('disableBody');
      $('#tours').addClass('waitCursor');
      $('#mapUploadLimitExceeded').hide();
      vm.mapSuccess = vm.mapError = null;
      Upload.upload({
        url: 'api/product/productMapUploads/',
        arrayKey: '',
        data: {
          files: $window.globalMapFileStorage,
          previousFiles: $window.globalMapFileStorageEdit
        }
      }).then(function (response) {
        onMapUploadSuccess(response.data);
      }, function (response) {
        if (response.status > 0) onMapUploadError(response.data);
      });
    };
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Map upload, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Common success and error function for product Image and map upload, initilization, upload, delte and save*/
/* ------------------------------------------------------------------------------------------------------------------------- */


    function onMapUploadSuccess(response) {
      if ($window.globalMapFileStorage.length == 0)
        vm.mapError = 'You have not selected any maps to upload'
      else
        vm.mapSuccess = 'Maps have been uploaded successfully'
      $('#tourgeckoBody').removeClass('disableBody');
      $('#tours').removeClass('waitCursor');
      vm.showLoaderForProductSave = false;
      productMapURLs = response;
    }

    function onMapUploadError(response) {
      $('#tourgeckoBody').removeClass('disableBody');
      $('#tours').removeClass('waitCursor');
      vm.showLoaderForProductSave = false;
      vm.mapError = 'Some error occurred. Please try again. If error persists, contact tourgecko';
      
      /* if (response == 'LIMIT_FILE_COUNT') {
        var extraImages = $window.globalMapFileStorage.length - 3;
        var extraImagesString;
        if (extraImages == 1)
          extraImagesString = extraImages + ' image';
        else
          extraImagesString = extraImages + ' images';
        vm.mapError = 'Only 3 image upload are allowed. Please remove at least ' + extraImagesString;
      } */
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Common success and error function for product Image and map upload, initilization, upload, delte and save, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */



/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Assign form data to product record properly */
/* ------------------------------------------------------------------------------------------------------------------------- */
    function setProductInformation() {
      vm.tour.destination = document.getElementById('tour_main_destination').value;
      vm.tour.productGrade = vm.productGrade;
      vm.tour.productAvailabilityType = vm.productAvailabilityType;
      vm.tour.productScheduledDates = vm.productScheduledDates;
      vm.tour.productSeatsLimitType = vm.productSeatsLimitType;
      vm.tour.productDurationType = vm.productDurationType;
      if (vm.productSeatsLimitType == 'unlimited') {
        vm.tour.productSeatLimit = '';
        vm.tour.isAvailabilityVisibleToGuests = false;
      }
      vm.tour.productSummary = CKEDITOR.instances.describe_tour_briefly.getData();
      vm.tour.productCancellationPolicy = CKEDITOR.instances.cancellationPolicies.getData();
      vm.tour.productGuidelines = CKEDITOR.instances.tour_guidelines.getData();
      vm.tour.productInclusions = CKEDITOR.instances.tour_inclusions.getData();
      vm.tour.productExclusions = CKEDITOR.instances.tour_exclusions.getData();
      vm.tour.productItineraryDescription = vm.itineraries;
      vm.tour.productType = $window.localStorage.getItem('productType');
      $window.localStorage.setItem('productType', '');
      vm.tour.productPricingOptions = vm.pricingParams;
      vm.tour.areAddonsAvailable = vm.isAddonAvailable;
      vm.tour.productAddons = vm.addonParams.params;
      vm.tour.isDepositNeeded = vm.isDepositApplicable;
      vm.tour.productTimeSlots = $scope.timeslots;
      vm.tour.isProductScheduled = vm.isProductScheduled;
      vm.tour.productTimeSlotsAvailability = $scope.productTimeSlotsAvailability;
      vm.tour.productMapURLs = productMapURLs;
      vm.tour.productPictureURLs = productPictureURLs

      if (vm.tour.isProductAvailabileAllTime)
        vm.tour.productUnavailableMonths.length = 0;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Assign form data to product record properly, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* This function handles the button click of add tour */
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.goToTourCreationPage = function() {
      if (vm.productType == '') {
        alert('please select at least one type for the tour');
        return false;
      }
      $('#select-tour-type').slideUp('slow');
      $timeout(function () {
        $('.modal-backdrop').remove();
        $state.go('host.addProduct');
      }, 800);
      $window.localStorage.setItem('productType', vm.productType);
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* This function handles the button click of add tour, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


    vm.getDynamicCSS = function (index) {
      vm.zeroCSS = {
        "background-color" : "#eee",
        "border-radius": "10px"
      };
      vm.otherCSS = {
        "background-color" : "#eee",
        "border-radius": "10px",
        "margin-top": "10px"
      };
      if (index == 0)
        return vm.zeroCSS;
      else
        return vm.otherCSS;
    }

    vm.getLoaderPositionForProductSave = function () {
      var leftMargin; 
        if($window.innerWidth > 767)
            leftMargin = ($('.add-product').width() - 34.297) / 2;
        else
            leftMargin = ($window.innerWidth - 34.297) / 2;
      var topMargin = ($window.innerHeight - 40) / 3;
      var cssObject = {
        "left" : leftMargin,
        "top" : topMargin,
        "color": '#ff9800'
      }
      return cssObject;
    }

    $scope.goToPreviewPage = function () {
      if (!vm.tour.productTitle) {
        alert('Please enter at least title of the tour');
        return;
      }
      setProductInformation();
      $window.localStorage.setItem('productData', JSON.stringify(vm.tour));
      $window.open($state.href('hostAndGuest.previewBeforeSave'),'_blank','heigth=600,width=600');
    }
  }
}());
