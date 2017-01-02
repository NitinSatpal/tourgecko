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

  AddProductController.$inject = ['$scope', '$state', '$stateParams', '$http', '$timeout', '$window', 'Upload'];

  function AddProductController($scope, $state, $stateParams, $http, $timeout, $window, Upload) {
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
    $scope.timeslots = [];
    $scope.productTimeSlotsAvailability = 'No Time Required';
    $scope.departureSessions = [];
    $scope.imageFilesToBeUploaded;
    $scope.imageFilesToBeUploadedEdit;
    $scope.mapFilesToBeUploded;
    var uploadFilesProductId;
    var sessionSpecialPricing = [];
/* ------------------------------------------------------------------------------------------------------------------------- */
    /* Initialization ends */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */
    /* Check whether product is getting created or edited */
/* ------------------------------------------------------------------------------------------------------------------------- */
    var productId = $window.localStorage.getItem('productEditId');
    if(productId != 'noProductId') {
      $http.get('/api/host/product/'+ $window.localStorage.getItem('productEditId')).success(function (response) {
          vm.tour = response[0];

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
          vm.showCreatedItinerary = true;
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
    function finalValidateOfGroupPricing () {
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
          if (groupRange[index + 1] < groupRange[index]) {
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
  }
  else {
    vm.sessionPricing = []
    angular.copy(vm.pricingParams, vm.sessionPricing);
    vm.fixedDepartureSessionCounter++;
    var newSchedule = {'repeatBehavior':'Do not repeat'}
    vm.fixedProductSchedule[vm.fixedDepartureSessionCounter] = newSchedule;
    vm.isFixedTourTimeSlotAvailable = false;
    $('#departureSession').fadeIn();
  }
}

vm.createDepartureSession = function () {
  if(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate === undefined) {
    alert('Please select date for creating a departure session');
    return false;
  } else if (vm.isFixedTourTimeSlotAvailable == true && vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startTime === undefined) {
    alert('You have opted for time slot. Please create time slot or opt out the same');
    return false;
  } else if ((vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Daily' ||
              vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Weekly') &&
              vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatTillDate === undefined) {
    alert('Please select the end date of reptition of this tour');
    return false;
  }
  vm.isProductScheduled = true;
  vm.productScheduledDates.push(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate);
  sessionSpecialPricing[vm.fixedDepartureSessionCounter] = vm.sessionPricing;
  $("#departureSession").fadeOut();
  $('.modal-backdrop').remove();
 
  if ($window.events.length % 3 == 0) {
    $window.events.push({title: '<span class="eventname orangeFC">' +
                                vm.tour.productTitle +
                                '</span><br><i class="zmdi zmdi-circle orangeFC"></i>&nbsp;<i class="zmdi zmdi-account"></i> &nbsp; 7/10</span>',
                                start: vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate,
                                end: vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].endDate,
                                backgroundColor: 'rgba(237,156,40, 0.2)'});

  } else if ($window.events.length % 3 == 1) {
    $window.events.push({title: '<span class="eventname greenFC">' +
                                vm.tour.productTitle +
                                '</span><br><i class="zmdi zmdi-circle greenFC"></i>&nbsp;<i class="zmdi zmdi-account"></i> &nbsp; 7/10</span>',
                                start: vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate,
                                end: vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].endDate,
                                backgroundColor: 'rgba(66,174,94,0.2)'});
  } else {
    $window.events.push({title: '<span class="eventname redFC">' +
                                vm.tour.productTitle +
                                '</span><br><i class="zmdi zmdi-circle redFC"></i>&nbsp;<i class="zmdi zmdi-account"></i> &nbsp; 7/10</span>',
                                start: vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate,
                                end: vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].endDate,
                                backgroundColor: 'rgba(216,64,64,0.2)'});
  }
  

  if (vm.ShowCalendarButton && vm.fixedDepartureSessionCounter == 0) {
    openCalendarForFixedDepartures();
    if (vm.ShowCalendarButton)
      vm.ShowCalendarButton = !vm.ShowCalendarButton;
  }
  else
    rebuildFullCalendar();
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
      var isPricingCorrect = finalValidateOfGroupPricing();
      
      if (isPricingCorrect == false) {
        alert('Please check pricing options range. Each group should have range greater than previous And If Price for Everyone is present, no other option should be present.')
        return false;
      }
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tourForm');
        return false;
      }
      
      setProductInformation();

      var productId = $window.localStorage.getItem('productEditId');

      if(productId != 'noProductId') {
        $http.post('/api/host/editproduct/', {tour: vm.tour, toursessions: vm.fixedProductSchedule, sessionPricings: sessionSpecialPricing}).success(function (response) {
          uploadFilesProductId = response._id;
          $scope.imageFilesToBeUploaded = $window.globalImageFileStorage;
          $scope.imageFilesToBeUploadedEdit = $window.globalImageFileStorageEdit;
          $scope.mapFilesToBeUploded = $window.globalMapFileStorage;
          uploadImage();
         /* else {
            $state.go('host.tours');
            $window.localStorage.setItem('productEditId', 'noProductId');
          } */

          if($scope.mapFilesToBeUploded.length > 0)
            uploadMap();
        }).error(function (response) {
          vm.error = response.message;
        });
      } else {
        $http.post('/api/host/product/', {tour: vm.tour, toursessions: vm.fixedProductSchedule, sessionPricings: sessionSpecialPricing}).success(function (response) {
          uploadFilesProductId = response._id;
          $scope.imageFilesToBeUploaded = $window.globalImageFileStorage;
          $scope.mapFilesToBeUploded = $window.globalMapFileStorage;
          if($scope.imageFilesToBeUploaded.length > 0) 
            uploadImage();
          else {
            $state.go('host.tours');
          }
          if($scope.mapFilesToBeUploded.length > 0)
            uploadMap();
        }).error(function (response) {
          vm.error = response.message;
        });
      }
    };
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Save function ends here */
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
      $window.localStorage.setItem('productEditId', 'noProductId');
      $timeout(function () {
        $state.go('host.addProduct');
      }, 800);
      $window.localStorage.setItem('productType', vm.productType);
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* This function handles the button click of add tour, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Image upload */
/* ------------------------------------------------------------------------------------------------------------------------- */
    function uploadImage () {      
      vm.success = vm.error = null;
      // uploadFilesProductId
      Upload.upload({
        url: 'api/product/productPictureUploads/',
        arrayKey: '',
        params: {
          productId: uploadFilesProductId,
        },
        data: {
          files: $scope.imageFilesToBeUploaded,
          previousFiles: $window.globalImageFileStorageEdit
        }
      }).then(function (response) {
        onSuccessItem(response.data, 'image');
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      });
    };
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Image upload, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Map upload */
/* ------------------------------------------------------------------------------------------------------------------------- */
    function uploadMap () {
      vm.success = vm.error = null;
      Upload.upload({
        url: 'api/product/productMap/'+ uploadFilesProductId,
        arrayKey: '',
        data: {
          files: $scope.mapFilesToBeUploded
        }
      }).then(function (response) {
        onSuccessItem(response.data, 'map');
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      });
    };
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Map upload, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Common success and error function for product Image and map upload, initilization, upload, delte and save*/
/* ------------------------------------------------------------------------------------------------------------------------- */
    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(response, pictureType) {
      vm.success = true;
      if(pictureType == 'image') {
        $state.go('host.tours');
        $window.localStorage.setItem('productEditId', 'noProductId');
      }
    }

    // Called after the user has failed to uploaded a new picture
    function onErrorItem(response, pictureType) {
      vm.error = true;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Common success and error function for product Image and map upload, initilization, upload, delte and save, ends here */
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
  }
}());
