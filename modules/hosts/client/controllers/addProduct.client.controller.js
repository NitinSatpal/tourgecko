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
    vm.durationType = 'days';
    vm.productGrade = 'Easy';
    vm.productAvailabilityType = 'Open Date';
    vm.productTimeSlotsAvailability = 'No Time Required';
    vm.timeslots = [];
    vm.productSeatsLimitType = 'limited';
    vm.pricingOptions = ['Everyone'];
    vm.imageFileSelected = false;
    vm.mapFileSelected = false;
    vm.showProgressbar = false;
    vm.addMorePhotos = false;
    vm.productPictureURLs = [];
    vm.productMapURLs = [];
    vm.availableMonths = [];
    vm.itineraries = [];
    vm.dayCounter = 1;
    vm.showCreatedItinerary = false;
    vm.showSaveButtonForItineraries = false;
    vm.showEditItineraryElements = false;
    vm.productDuration;
    vm.heading = '';
    vm.productType = '';
    vm.isFixedTourTimeSlotAvailable = false;
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
            vm.itineraries = vm.tour.productItineraryDescription;
        });
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
      }
      return true;
    };

    /* This validation will be executed when host is saving the tour, in case host may have change very old group price option. We are only validating
       latest one in previous validation */
    function finalValidateOfGroupPricing () {
      var index;
      var groupRange = [];
      for (index = 0; index < vm.pricingParams.length; index++ ) {
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
          if (groupRange[index + 1] < groupRange[index])
            return false;
        }
      }
      return true;
    }

    vm.removePricingOption = function(index) {
      vm.pricingParams.splice(index, 1);
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* pricing parameters initialization, handler and validation ends */
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

    vm.timeslots = [''];

    vm.addMoreTimeslots = function() {
      vm.timeslots.push('');
    };

    vm.removeTimeslots = function(index) {
      vm.timeslots.splice(index, 1);
    };

    vm.fixedProductSchedule = {
      params: [{
        startDate: '',
        startTime: '',
        repeatBehavior: 'Do not repeat',
        repeatTillDate: '',
        repeatOnDays: []
      }]
    };

/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Itinerary creation, edit, delete and save */
/* ------------------------------------------------------------------------------------------------------------------------- */

    vm.createItinerary = function(done) {
      vm.itineraries.push({'title': vm.heading, 'description': CKEDITOR.instances.tourItinerary.getData(), 'day': vm.dayCounter});
      vm.dayCounter++;
      vm.showCreatedItinerary = true;
      CKEDITOR.instances.tourItinerary.setData('');
      vm.heading = '';
    }

    var indexSaved;
    vm.editItinerary = function(index) {
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
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Itinerary creation, edit and save, ends here*/
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Save function */
/* ------------------------------------------------------------------------------------------------------------------------- */

    // Save the data here
    vm.save = function (isValid) {
      var isGroupPricingCorrect = finalValidateOfGroupPricing()
      
      if (isGroupPricingCorrect == false) {
        alert('Please check group pricing options range. Each group should have range greater than previous.')
        return false;
      }
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tourForm');
        return false;
      }
      
      // save the data which was processed in different way whil creating this product
      setProductInformation();

      var productId = $window.localStorage.getItem('productEditId');
      if(productId != 'noProductId'){
        $window.localStorage.setItem('productEditId', 'noProductId');
        $http.post('/api/host/editproduct/', vm.tour).success(function (response) {
          $state.go('host.tours');
        }).error(function (response) {
          vm.error = response.message;
        });
      } else {
        $http.post('/api/host/product/', vm.tour).success(function (response) {
          $state.go('host.tours');
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
      vm.tour.productDurationType = vm.durationType;
      vm.tour.productDuration = vm.productDuration;
      vm.tour.productAvailabilityType = vm.productAvailabilityType;
      vm.tour.productTimeSlotsAvailability = vm.productTimeSlotsAvailability;
      vm.tour.productSeatsLimitType = vm.productSeatsLimitType;
      vm.tour.productMonthsAvailableForBoking = vm.availableMonths;
      vm.tour.productSummary = CKEDITOR.instances.describe_tour_briefly.getData();
      vm.tour.productCancellationPolicy = CKEDITOR.instances.cancellationPolicies.getData();
      vm.tour.productGuidelines = CKEDITOR.instances.tour_guidelines.getData();
      vm.tour.productInclusions = CKEDITOR.instances.tour_inclusions.getData();
      vm.tour.productExclusions = CKEDITOR.instances.tour_exclusions.getData();
      vm.tour.productItineraryDescription = vm.itineraries;
      vm.tour.productType = $window.localStorage.getItem('productType');
      $window.localStorage.setItem('productType', '');
      vm.tour.fixedProductSchedule = vm.fixedProductSchedule.params;
      vm.tour.productPricingOptions = vm.pricingParams;
      vm.tour.productAddons = vm.addonParams.params;
      vm.tour.isDepositNeeded = vm.isDepositApplicable;
      vm.tour.productTimeSlots = vm.timeslots;
      vm.tour.productPictureURLs = vm.productPictureURLs;
      vm.tour.productMapURLs = vm.productMapURLs;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Assign form data to product record properly, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* This function handles the tour edit. It will be called from tourlist page, if host is clicking on Edit*/
/* ------------------------------------------------------------------------------------------------------------------------- */
    vm.goToTourCreationPage = function() {
      $timeout(function () {
        $state.go('host.addProduct');
      }, 800);
      $window.localStorage.setItem('productType', vm.productType);
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* This function handles the tour edit. It will be called from tourlist page, if host is clicking on Edit, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Image upload, initilization, upload, delte and save */
/* ------------------------------------------------------------------------------------------------------------------------- */
    $scope.imageFilesToBeUploaded = $window.globalImageFileStorage;
    vm.uploadImage = function () {
      vm.success = vm.error = null;
      vm.showImageProgressbar = true;
      
      Upload.upload({
        url: 'api/product/productPicture',
        arrayKey: '',
        data: {
          files: $scope.imageFilesToBeUploaded
        }
      }).then(function (response) {
        $timeout(function () {
          onSuccessItem(response.data, 'image');
        }, 3000);
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      }, function (evt) {
        vm.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      });
    };
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Image upload, initilization, upload, delte and save, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Map upload, initilization, upload, delte and save */
/* ------------------------------------------------------------------------------------------------------------------------- */
    $scope.mapFilesToBeUploded = $window.globalMapFileStorage;
    vm.uploadMap = function () {
      vm.success = vm.error = null;
      vm.showMapProgressbar = true;
      Upload.upload({
        url: 'api/product/productMap',
        arrayKey: '',
        data: {
          files: $scope.mapFilesToBeUploded
        }
      }).then(function (response) {
        $timeout(function () {
          onSuccessItem(response.data, 'map');
        }, 3000);
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      }, function (evt) {
        vm.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      });
    };
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Product Map upload, initilization, upload, delte and save, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Common success and error function for product Image and map upload, initilization, upload, delte and save*/
/* ------------------------------------------------------------------------------------------------------------------------- */
    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(response, pictureType) {
      // Show success message
      vm.success = true;
      // hide progressbar
      vm.showProgressbar = false;

      if (pictureType == 'image') {
        // Reset form
        vm.imageFileSelected = false;
        $scope.picFile = '';
        vm.showImageProgressbar = false;

        //change label
        vm.addMorePhotos = true;

        // add uploaded image urls to database
        vm.productPictureURLs.push(response);
      } else {
        // Reset form
        vm.mapFileSelected = false;
        $scope.mapFile = '';
        vm.showMapProgressbar = false;

        // add uploaded map urls to database
        vm.productMapURLs.push(response);
      }
      
    }

    // Called after the user has failed to uploaded a new picture
    function onErrorItem(response, pictureType) {
      if (pictureType == 'image') {
        // Reset form
        vm.imageFileSelected = false;
      } else {
        // Reset form
        vm.mapFileSelected = false;
      }

      // Show error message
      vm.error = response.message;
    }
/* ------------------------------------------------------------------------------------------------------------------------- */    
    /* Common success and error function for product Image and map upload, initilization, upload, delte and save, ends here */
/* ------------------------------------------------------------------------------------------------------------------------- */
  }
}());
