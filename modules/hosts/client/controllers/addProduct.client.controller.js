  (function () {
    'use strict';

    angular
      .module('hosts', [])
      .controller('AddProductController', AddProductController)
      .filter('htmlData', function($sce) {
          return function(val) {
              return $sce.trustAsHtml(val);
          };
      })
      .constant('errorContentData', {
        "tourName" : "Name of the tour cannot be blank",
        "tourDestination" : "Main Destination cannot be blank",
        "groupPricingFinalValidation" : "'Group' sizes  in group price option can not overlap",
        "everyonePricingFinalValidation" : "Price for 'Everyone' option can not be used with any other option",
        "tourDuration": "Duration of the tour cannot be blank",
        "onePricingOptionRequired": "Minimum one price option is required",
        "openDatTimeSlotNotPresent": "Please enter at least one available time-slot or change the time-slot availability option"
      });
    AddProductController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$http', '$timeout', '$window', '$location', 'Upload', 'ProductDataShareService', 'errorContentData', 'toasty'];

    function AddProductController($scope, $rootScope, $state, $stateParams, $http, $timeout, $window, $location, Upload, ProductDataShareService, errorContentData, toasty) {
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
      vm.productTags = [];
      vm.productGrade = 'Select';
      vm.productAvailabilityType = 'unavailable';
      vm.productDurationType = 'Days';
      vm.sessionSeatsLimitType = 'select';
      vm.pricingOptions = ['Everyone'];
      vm.oldSessionEditing = false;
      vm.fixedProductScheduleVisibility = [];
      vm.fixedProductSchedule = [];
      vm.fixedProductScheduleCapacities = [];
      vm.fixedProductScheduleUniqueId = [];
      vm.lastIndexOfAlreadySavedOldSessions = -1;
      vm.productScheduledDates = [];
      vm.onlyCapacityEditAllowed = false;
      vm.editingTheSession = false;
      vm.productScheduledTimestamps = [];
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
      vm.fixedDepartureSessionCounter = -1;
      vm.ShowCalendarButton = true;
      vm.isNewPricingApplicableOnOldSessions = false;
      vm.isNewPricingApplicableOnNewSessions = false;
      vm.saveBtnDisabled = true;
      vm.isProductAvailabileAllTime = true;
      $scope.timeslotsTracker = new Set();
      $scope.timeslots = [];
      $scope.productTimeSlotsAvailability = 'No Time Required';
      $scope.departureSessions = [];
      vm.sessionSpecialPricing = [];
      vm.sessionInternalNames = [];
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
      $scope.uploadedProductPicturesForThisProduct = [];
      $scope.uploadedProductMapsForThisProduct = [];
      $scope.imageUploadErrorContent = [];
      $scope.showImageUploadErrorsBlock = false;
      vm.singleImageUploadError = false;
      vm.multipleImageUploadError = false;
      if ($state.$current.self.name == 'host.addProduct')
        vm.tourActionCanBePerformed = 'Create Tour';
      else
        vm.tourActionCanBePerformed = 'Edit Tour';

      if (window.innerWidth <= 767) {
        $('.fixedDepartureAddTourMobile #onMobile').css('display', 'block');
        $('.fixedDepartureAddTourMobile #notOnMobile').css('display', 'none');
      }
  /* ------------------------------------------------------------------------------------------------------------------------- */
      /* Initialization ends */
  /* ------------------------------------------------------------------------------------------------------------------------- */
      

  /* ------------------------------------------------------------------------------------------------------------------------- */
      /* Display image upload errors */
  /* ------------------------------------------------------------------------------------------------------------------------- */

      /* This is the dirty way. From image uploader callback, if I am trying to display the messages, nothing is visible.
       * The reason is digest cycle. I have to manually trigger $scope.$apply. Hence I am calling this function from
       * fineuploader onError callback, and applying digest cycle manually. Even in this case, the best approach was to
       * call this function once all file uploads are done, so that we can start digest cycle for everything together.
       * But onAllcomplete callback of fineuploader is not working the way it should work. It's not getting called, if all
       * the images uplaoded are failed. In that case, no error will be shown. Hence, we are calling this function for each
       * image. Maximum five times (image upload maximum file limit is 5). For this reason, I have to set both
       * vm.singleImageUploadError and vm.multipleImageUploadError everytime, else both singular and plural message will be shown
      */    
      $scope.showImageUploadErrors = function (error) {
        $scope.imageUploadErrorContent.push(error);
        $scope.showImageUploadErrorsBlock = true;
        if ($scope.imageUploadErrorContent.length == 1) {
          vm.singleImageUploadError = true;
          vm.multipleImageUploadError = false;
        }  else {
          vm.singleImageUploadError = false;
          vm.multipleImageUploadError = true;
        }
        $scope.$apply();
      }
  /* ------------------------------------------------------------------------------------------------------------------------- */
      /* Display image upload errors, ends*/
  /* ------------------------------------------------------------------------------------------------------------------------- */
      
      $scope.initializeImageUploadErrorContent = function (startDigest) {
        $scope.imageUploadErrorContent.length = 0;
        vm.singleImageUploadError = false;
        vm.multipleImageUploadError  = false;
        $scope.showImageUploadErrorsBlock = false;
        if (startDigest && !$scope.$$phase) {
          $scope.$apply();
        }
      }

    // $window.localStorage.setItem('dirtyDataPresent', 'No');
  /* ------------------------------------------------------------------------------------------------------------------------- */
      /* Checking if user has entered anything so that save button can be enabled */
  /* ------------------------------------------------------------------------------------------------------------------------- */
      var isPricePresent = false;
      $scope.$watch('vm.pricingParams', function() {
        if (initializing) {
          $timeout(function() { initializing = false; });
        } else {
          vm.saveBtnDisabled = false;
          $rootScope.productCreationOrEditDirtyDataPresent = true;
        }
      }, true);

      $scope.$watch('vm.tour', function() {
        if (initializing) {
          $timeout(function() { initializing = false; });
        } else {
          vm.saveBtnDisabled = false;
          $rootScope.productCreationOrEditDirtyDataPresent = true;
        }
      }, true);

      for (var i in CKEDITOR.instances) {
        if (CKEDITOR.instances[i].name != 'tourItinerary') {
          CKEDITOR.instances[i].on('change', function() {
            vm.saveBtnDisabled = false;
            $rootScope.productCreationOrEditDirtyDataPresent = true;
            $scope.$apply();
          });
        }
      }
  /* ------------------------------------------------------------------------------------------------------------------------- */
      /* Checking if user has entered anything so that save button can be enabled ends */
  /* ------------------------------------------------------------------------------------------------------------------------- */


  /* ------------------------------------------------------------------------------------------------------------------------------------------ */
      /* CKEDITOR does not glow the editor on focus, hence this things required to match the behavior with other elements of the form */
  /* ------------------------------------------------------------------------------------------------------------------------------------------ */
      CKEDITOR.instances.describe_tour_briefly.on( 'focus', function () {
        $("#cke_describe_tour_briefly").addClass('ckEditorFocus');
      });
      CKEDITOR.instances.describe_tour_briefly.on('blur', function() {
        $("#cke_describe_tour_briefly").removeClass('ckEditorFocus');
      });
      CKEDITOR.instances.cancellationPolicies.on( 'focus', function () {
        $("#cke_cancellationPolicies").addClass('ckEditorFocus');
      });
      CKEDITOR.instances.cancellationPolicies.on('blur', function() {
        $("#cke_cancellationPolicies").removeClass('ckEditorFocus');
      });
      CKEDITOR.instances.tourItinerary.on( 'focus', function () {
        $("#cke_tourItinerary").addClass('ckEditorFocus');
      });
      CKEDITOR.instances.tourItinerary.on('blur', function() {
        $("#cke_tourItinerary").removeClass('ckEditorFocus');
      });
      CKEDITOR.instances.tour_guidelines.on( 'focus', function () {
        $("#cke_tour_guidelines").addClass('ckEditorFocus');
      });
      CKEDITOR.instances.tour_guidelines.on('blur', function() {
        $("#cke_tour_guidelines").removeClass('ckEditorFocus');
      });
      CKEDITOR.instances.tour_inclusions.on( 'focus', function () {
        $("#cke_tour_inclusions").addClass('ckEditorFocus');
      });
      CKEDITOR.instances.tour_inclusions.on('blur', function() {
        $("#cke_tour_inclusions").removeClass('ckEditorFocus');
      });
      CKEDITOR.instances.tour_exclusions.on( 'focus', function () {
        $("#cke_tour_exclusions").addClass('ckEditorFocus');
      });
      CKEDITOR.instances.tour_exclusions.on('blur', function() {
        $("#cke_tour_exclusions").removeClass('ckEditorFocus');
      });
  /* ------------------------------------------------------------------------------------------------------------------------------------------ */
      /* CKEDITOR does not glow the editor on focus, hence this things required to match the behavior with other elements of the form ends */
  /* ------------------------------------------------------------------------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------------------------------------------------------- */
  /* This is added in case user is redirected here for tour edit. We will be disabling body when user will click on Edit button.
   * We should enable the body here.
   */
  /* ------------------------------------------------------------------------------------------------------------------------- */
  $('#tourgeckoBody').removeClass('disableBody');
  // $("#myNavbar .nav").find(".active").removeClass("active");

  $scope.showEditSuccessMsg = function () {
    if ($stateParams.showEditSuccessMsg) {
    toasty.success({
      title: 'Edit successful!',
      msg: 'Tour has been modified!',
      sound: false
    });
  }
  vm.showSuccessMsgOnTop = $stateParams.showSuccessMsg;

  }
  /* ------------------------------------------------------------------------------------------------------------------------- */
      /* Check whether product is getting created or edited */
  /* ------------------------------------------------------------------------------------------------------------------------- */
      var productId = $location.path().split('/')[4];
      if (!productId) {
        productId = $location.path().split('/')[3];
        if (productId == 'add')
          productId = undefined;
        else if (productId == 'edit')
          $window.location.href = 'https://tourgecko.com/not-found';
      }
      if(productId) {
        fetchSessionsOfThisProduct(productId)
        vm.saveBtnDisabled = false;
        $http.get('/api/host/product/'+ productId).success(function (response) {

            vm.tour = response[0];
            $scope.productTimeSlotsAvailability = vm.tour.productTimeSlotsAvailability;

            if (vm.tour.productTimeSlotsAvailability == 'Fixed Slots' && vm.tour.productTimeSlots.length > 0) {
              createTimeslotsEditMode(vm.tour.productTimeSlots);
              $scope.timeslots = vm.tour.productTimeSlots;
            }
            
            vm.productAvailabilityType = vm.tour.productAvailabilityType;

            if(vm.tour.productAvailabilityType == 'Fixed Departure')
              openFixedDeparturePanel();
            else if (vm.tour.productAvailabilityType == 'Open Date')
              openOpenDeparturePanel();
            else
              openUnavailableDeparturePanel();

            vm.itineraries = vm.tour.productItineraryDescription;
            vm.pricingParams = vm.tour.productPricingOptions;
            vm.isAddonAvailable = vm.tour.areAddonsAvailable;
            vm.addonParams.params = vm.tour.productAddons;
            vm.isDepositApplicable = vm.tour.isDepositNeeded;
            vm.productDurationType = vm.tour.productDurationType;
            vm.productScheduledDates = vm.tour.productScheduledDates;
            vm.productScheduledTimestamps = vm.tour.productScheduledTimestamps;
            vm.isProductAvailabileAllTime = vm.tour.isProductAvailabileAllTime;
            vm.productGrade = vm.tour.productGrade;
            // vm.tourActionCanBePerformed = vm.tour.productTitle.length > 15 ? vm.tour.productTitle.splice(0,15) + '...' : vm.tour.productTitle;
            angular.copy(vm.tour.productPricingOptions, previousPricingOption);
              
            vm.showCreatedItinerary = true;

            for(var index = 0; index < vm.tour.productTags.length; index++) {
              if(!standardTagSet.has(vm.tour.productTags[index])) {
                var option=jQuery("<option>").attr("value",vm.tour.productTags[index].toString()).html(vm.tour.productTags[index]);
                jQuery("#productTagging").append(option);
              }
            }
            $timeout(function() {
                $("#productTagging").val(vm.tour.productTags).trigger('change');
            });
            for (var index = 0; index < vm.tour.productPictureURLs.length; index ++) {
              var tempFilePath = vm.tour.productPictureURLs[index].url.split('/');
              var tempFileObject = {uuid: tempFilePath[tempFilePath.length - 1], size: vm.tour.productPictureURLs[index].size, name: vm.tour.productPictureURLs[index].name}
              $scope.uploadedProductPicturesForThisProduct.push(tempFileObject);
            }
            
            var maxVal = findDayCounterValue();
            if (maxVal == '-Infinity')
              vm.dayCounter = 1;
            else
              vm.dayCounter = maxVal + 1;
            setRichTextData();
        });
      } else {
        openUnavailableDeparturePanel();
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
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
    $('#loadingDivHostSide').css('display', 'none');
    $('#tourgeckoBody').removeClass('waitCursor');
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
        if(!vm.pricingParams[index].price || vm.pricingParams[index].price == '') {
          toasty.error({
              title: 'Price amount!',
              msg: 'Please enter a price for ' + vm.pricingParams[index].pricingType,
              sound: false
            });
            return false;
        }
        var indexTracker;
        var lastGroupOption;
        if(vm.pricingParams[index].pricingType == 'Group') {
          if(vm.pricingParams[index].minGroupSize === undefined) {
            toasty.error({
              title: 'Group range!',
              msg: 'Please enter a valid range of the group!',
              sound: false
            });
            return false;
          }
          if(vm.pricingParams[index].minGroupSize !== undefined && vm.pricingParams[index].maxGroupSize !== undefined && parseInt(vm.pricingParams[index].minGroupSize) >= parseInt(vm.pricingParams[index].maxGroupSize)) {
            toasty.error({
              title: 'Group Size!',
              msg: 'Group max size should be greater than group min size!',
              sound: false
            });
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
                toasty.error({
                  title: 'Group size!',
                  msg: 'Max size option of previous group should be less than the min size option of current group !',
                  sound: false
                });
                return false;
              } else if (parseInt(lastGroupOption.maxGroupSize) <= parseInt(lastGroupOption.minGroupSize)) {
                toasty.error({
                  title: 'Group size!',
                  msg: 'Group max size should be greater than group min size in previous group option!',
                  sound: false
                });
                return false;
              }
            }
          }
        } else {
          if (vm.pricingParams[index] && vm.pricingParams[index].pricingType == 'Everyone') {
            if (index > 0) {
              toasty.error({
                title: 'Pricing type!',
                msg: 'If you want same price for Everyone then Please remove all the options and keep only Price for Everyone!',
                sound: false
              });
              return false;
            } else {
                toasty.error({
                title: 'Pricing type!',
                msg: 'You have already added price for Everyone. No other option is valid now!',
                sound: false
              });
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
        vm.pricingValid = true;
        vm.pricingPresent = true;
        vm.groupPricingValid = true;
        vm.everyonePricingValid = true;
        var everyonePricingErrorIndex;
        var groupPricingErrorIndexStorage = [];
        var groupPricingErrorIndex = [];
        for (index = 0; index < vm.pricingParams.length; index++ ) {
          if (vm.pricingParams[index].pricingType == 'Everyone') {
            isEveryonePricingPresent = true;
            everyonePricingErrorIndex = index;
          }
          if (vm.pricingParams[index].pricingType == 'Group') {
            groupPricingErrorIndexStorage.push(index);
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
              vm.groupPricingValid = false;
              if ((index + 1)  % 2 != 0)
                groupPricingErrorIndex.push(groupPricingErrorIndexStorage[(index) / 2]);
              else
                groupPricingErrorIndex.push(groupPricingErrorIndexStorage[(index + 1) / 2]);
            }
          }
        } else
          vm.groupPricingValid = true;

        if(isEveryonePricingPresent == true && vm.pricingParams.length > 1) {
          vm.pricingValid = false;
          vm.everyonePricingValid = false;
          $("#pricingOption" + everyonePricingErrorIndex).css("border", "1px solid #a94442");
        } else  {
          vm.everyonePricingValid = true;
        }

        if(vm.pricingParams.length == 1 && (!vm.pricingParams[0].price || vm.pricingParams[0].price == '' || vm.pricingParams[0].price == null)) {
          vm.pricingPresent = false;
          vm.pricingValid = false;
        }
        for (var index = 0; index < groupPricingErrorIndex.length; index++)
          $("#pricingOption"+groupPricingErrorIndex[index]).css("border", "1px solid #a94442");
        return vm.pricingValid;
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
      var doneAlreadyClicked = false;
      vm.doneClicked = false;
      vm.createItinerary = function(done) {
        if(vm.productDurationType == 'Hours' && done != true) {
          toasty.warning({
            title: 'Hourly tour!',
            msg: 'Your tour is hourly, Are you sure you want to enter more itineraries!',
            sound: false
          });
          return false;
        }
        if (!doneAlreadyClicked) {
          vm.calculatedDay = true;
          vm.itineraries.push({'title': vm.heading, 'description': CKEDITOR.instances.tourItinerary.getData(), 'day': vm.dayCounter});
          vm.itineraries.sort(function(obj1, obj2) {
            return obj1.day - obj2.day;
          });

          vm.dayCounter = findDayCounterValue() + 1;
          vm.showCreatedItinerary = true;
          CKEDITOR.instances.tourItinerary.setData('');
          vm.heading = '';
        } else {
          vm.doneClicked = false;
          doneAlreadyClicked = false;
        }

        if (done) {
          vm.doneClicked = true;
          doneAlreadyClicked = true;
        }

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
        vm.showCreatedItinerary = true;
        CKEDITOR.instances[idOfEditor].setData('');
        vm.editHeading = '';

        if (CKEDITOR.instances[idOfEditor]) 
          CKEDITOR.instances[idOfEditor].destroy();
      }

      vm.cancelItineraryEdit = function (index) {
        var idOfEditor = 'editItinerary'+index;
        if (CKEDITOR.instances[idOfEditor]) 
          CKEDITOR.instances[idOfEditor].destroy();
        vm.showEditItineraryElements = false;
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
    if((vm.tour === undefined || (vm.tour && vm.tour.productTitle === undefined)) && (vm.pricingParams.length == 1 && vm.pricingParams[0].price === undefined)) {
      toasty.error({
        title: 'Tour name and Pricing required!',
        msg: 'Please enter tour name and pricing details before creating departure session!',
        sound: false
      });
      return false;
    } else if((vm.tour === undefined || (vm.tour && vm.tour.productTitle === undefined)) && (vm.pricingParams.length > 1 && vm.pricingValid == false)) {
      toasty.error({
        title: 'Tour name and valid Pricing required!',
        msg: 'Please enter tour name and valid pricing details before creating departure session!',
        sound: false
      });
      return false;
    } else if(vm.tour === undefined || (vm.tour && vm.tour.productTitle === undefined)) {
      toasty.error({
        title: 'Tour name required!',
        msg: 'Please enter tour name before creating departure session!',
        sound: false
      });
      return false;
    } else if (vm.pricingParams.length == 1 && vm.pricingParams[0].price === undefined) {
      toasty.error({
        title: 'Pricing required!',
        msg: 'Please enter pricing details before creating departure session!',
        sound: false
      });
      return false;
    } else if (vm.pricingParams.length > 1 && vm.pricingValid == false) {
      toasty.error({
        title: 'Pricing required!',
        msg: 'Please enter valid pricing details before creating departure session!',
        sound: false
      });
      return false;
    } else {
      vm.showTheList = false;
      $('ul.nav-tabs a[href="#session_dt"]').tab('show');
      var showLastSession = false;
      var modalOpened = true;
      if (!vm.editingTheSession) {
        vm.sessionName = '';
        vm.sessionPricing = []
        angular.copy(vm.pricingParams, vm.sessionPricing);
        vm.sessionSeatsLimitType = 'select';
        vm.fixedDepartureSessionCounter = vm.fixedProductSchedule.length;
        var newSchedule = {'repeatBehavior':'Do not repeat', 'isFixedTourTimeSlotAvailable': false}
        vm.fixedProductSchedule[vm.fixedDepartureSessionCounter] = newSchedule;
        var newCapacityObject = {sessionSeatLimit: '', isSessionAvailabilityVisibleToGuests: false};
        vm.fixedProductScheduleCapacities[vm.fixedDepartureSessionCounter] = newCapacityObject;
        $(".ds_repeat_daily").hide();
        $('#weeksRepeatOn').multiselect('deselectAll', true);
        $('#dailyExcept').multiselect('deselectAll', true);
        $('.ds_repeat_daily_except button span').html('Select Days');
        $('.ds_repeat_daily_except input:checkbox').removeAttr('checked');
        $('.dsRepeatWeekly button span').html('Select Days');
      }
      
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

      $('#departureSession').fadeIn();
    }
  }

  vm.markAsSessionNotCreated = function () {
    if (!vm.editingTheSession)
      vm.fixedProductSchedule.splice((vm.fixedProductSchedule.length - 1), 1);
    else {
      if (vm.oldSessionEditing)
        vm.fixedProductSchedule.splice((vm.fixedProductSchedule.length - 1), 1);
      vm.editingTheSession = false;
      vm.oldSessionEditing = false;
      vm.onlyCapacityEditAllowed = false;
    }
    vm.showTheList = true;
  }


  var createdSessionTracker = new Set();
  vm.createDepartureSession = function () {
    if (vm.sessionName == '' && vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate === undefined) {
      toasty.error({
        title: 'Session name and start date required!',
        msg: 'Please give some name to the session and select start date for creating a departure session!',
        sound: false
      });
      return false;
    } else if (vm.sessionName == '') {
      toasty.error({
        title: 'Session name required!',
        msg: 'Please give some name to the session!',
        sound: false
      });
      return false;
    } else if(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate === undefined) {
      toasty.error({
        title: 'Start date required!',
        msg: 'Please select start date for creating a departure session!',
        sound: false
      });
      return false;
    } else if (vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].isFixedTourTimeSlotAvailable == true && ($('#dsTimeSlot').val() === undefined || $('#dsTimeSlot').val() == null || $('#dsTimeSlot').val() == '')) {
      toasty.error({
        title: 'Time slots!',
        msg: 'You have opted for time slot. Please create time slot or opt out the same!',
        sound: false
      });
      return false;
    } else if ((vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Daily' ||
                vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Weekly') &&
                vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatTillDate === undefined) {
      toasty.error({
        title: 'End date required!',
        msg: "Please select the 'Repeat until' date of this session!",
        sound: false
      });
      return false;
    } else if (new Date(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatTillDate).getTime() <= new Date(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate).getTime()) {
      toasty.error({
        title: 'Invalid dates!',
        msg: "Repeat till date should be greater than the session start date!",
        sound: false
      });
      return false;
    }
    if ((vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Weekly') && 
        (vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatOnDays === undefined || vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatOnDays.length == 0)){
      toasty.error({
        title: 'Week days!',
        msg: 'Please select the week days on which this tour will repeat!',
        sound: false
      });
      return false;
    }
    if (vm.sessionSeatsLimitType == 'select') {
      toasty.error({
        title: 'Provide capacity details!',
        msg: 'Please provide capacity details for this session!',
        sound: false
      });
      return false;
    } else if (vm.sessionSeatsLimitType == 'limited' && !vm.fixedProductScheduleCapacities[vm.fixedDepartureSessionCounter].sessionSeatLimit) {
      toasty.error({
        title: 'Provide seat limit!',
        msg: 'You have selected limited seats. Please provide the limit!',
        sound: false
      });
      return false;
    } else if (vm.sessionSeatsLimitType == 'Limited' && !Number.isInteger(parseInt(vm.fixedProductScheduleCapacities[vm.fixedDepartureSessionCounter].sessionSeatLimit)) || parseInt(vm.fixedProductScheduleCapacities[vm.fixedDepartureSessionCounter].sessionSeatLimit) <= 0) {
      toasty.error({
        title: 'Seats capacity!',
        msg: 'Please enter valid seat capacity for departure session!',
        sound: false
      });
      return false
    }

    if (vm.editingTheSession && vm.oldSessionEditing) {
      if (vm.onlyCapacityEditAllowed) {
        if (vm.sessionSeatsLimitType == 'limited') {
          if (vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior != 'Do not repeat') {
            toasty.error({
              title: 'Capacity cannot be changed!',
              msg: 'You cannot change the capacity of repeative session. Please contact tourgecko support.',
              sound: false
            });
            return false
          } else {
            $http.get('/api/host/countNumOfSeatsForParticularSession/' + vm.fixedProductScheduleUniqueId[vm.fixedDepartureSessionCounter] + '/' + vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate).success(function (response) {
              if (parseInt(vm.fixedProductScheduleCapacities[vm.fixedDepartureSessionCounter].sessionSeatLimit) < response.numOfSeats) {
                toasty.error({
                  title: 'Capacity cannot be saved!',
                  msg: 'This session already have booking more than ' + vm.fixedProductScheduleCapacities[vm.fixedDepartureSessionCounter].sessionSeatLimit,
                  sound: false
                });
                return false
              } else
                return createDepartureSession(true);
            }).error(function (err) {
              toasty.error({
                title: 'Something went wrong!',
                msg: 'Capacity cannot be edited. Please try again',
                sound: false
              });
              return false
            });
          }
        }
      } else
        return createDepartureSession(true);
    } else {
      return createDepartureSession(false);
    }
  }
  /* ------------------------------------------------------------------------------------------------------------------------- */    
      /* Fixed Date departure session validation function, ends here */
  /* ------------------------------------------------------------------------------------------------------------------------- */
  var weekDaysNumber = new Map();
  weekDaysNumber.set('Sunday', 0);
  weekDaysNumber.set('Monday', 1);
  weekDaysNumber.set('Tuesday', 2);
  weekDaysNumber.set('Wednesday', 3);
  weekDaysNumber.set('Thursday', 4);
  weekDaysNumber.set('Friday', 5);
  weekDaysNumber.set('Saturday', 6);
  function createDepartureSession (alreadySavedSession) {
    vm.fixedProductScheduleCapacities[vm.fixedDepartureSessionCounter].sessionSeatsLimitType = vm.sessionSeatsLimitType;
    // if any tour is repeted, then populate the calendar accordingly
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
    var validatorDate = new Date(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate);
    //eventDate = new Date(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate(),  eventDate.getUTCHours(), eventDate.getUTCMinutes(), eventDate.getUTCSeconds());
    var monthTracker = new Set();
    var monthsCovered = [];
    
    for (var index = 0; index <= repeatedDays; index ++) {
      if((vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Daily' && !notAllowedDays.has(validatorDate.getDay())) || 
        (vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Weekly' && allowedDays.has(eventDate.getDay())) ||
        vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Do not repeat') {
        var sessionCreatedTimestamp;
          if ($('#dsTimeSlot').val() == undefined || $('#dsTimeSlot').val() == '' || $('#dsTimeSlot').val() == ' ')
            sessionCreatedTimestamp = new Date(validatorDate).getTime().toString() + 'NA';
          else
            sessionCreatedTimestamp = new Date(validatorDate).getTime().toString() + $('#dsTimeSlot').val().toString();

          if (createdSessionTracker.has(sessionCreatedTimestamp) || vm.productScheduledTimestamps.indexOf(sessionCreatedTimestamp) != -1) {
            toasty.error({
              title: 'Duplicate Session!',
              msg: 'Session with same timestamp already created',
              sound: false
            });
            return false;
          }
      }
      validatorDate = new Date (validatorDate);
      validatorDate = validatorDate.setDate(validatorDate.getDate() + 1);
      validatorDate = new Date (validatorDate);
    }

    vm.isProductScheduled = true;
    vm.sessionInternalNames[vm.fixedDepartureSessionCounter] = vm.sessionName;
    $("#departureSession").fadeOut();
    $('.modal-backdrop').remove();
    


    for (var index = 0; index <= repeatedDays; index ++) {
      var needToSave = true;
      if(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Daily' && notAllowedDays.has(eventDate.getDay()) || 
        vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].repeatBehavior == 'Repeat Weekly' && !allowedDays.has(eventDate.getDay()) ||
        eventDate > firstDate)
        needToSave = false;
      
      if (needToSave) {
        var sessionCreatedTimestamp;
        if ($('#dsTimeSlot').val() == undefined || $('#dsTimeSlot').val() == '' || $('#dsTimeSlot').val() == ' ')
          sessionCreatedTimestamp = new Date(eventDate).getTime().toString() + 'NA';
        else
          sessionCreatedTimestamp = new Date(eventDate).getTime().toString() + $('#dsTimeSlot').val().toString();
        createdSessionTracker.add(sessionCreatedTimestamp);
        vm.productScheduledTimestamps.push(sessionCreatedTimestamp);
        var uniqueString = eventDate.getMonth().toString() + eventDate.getUTCFullYear().toString();
        if (!monthTracker.has(uniqueString)) {
          monthTracker.add(uniqueString);
          monthsCovered.push(uniqueString);
        }
      }

      if (needToSave)
        vm.productScheduledDates.push(eventDate);
      eventDate = new Date (eventDate);
      eventDate = eventDate.setDate(eventDate.getDate() + 1);
      eventDate = new Date (eventDate);
    }
    
    sessionMonthsCovered[vm.fixedDepartureSessionCounter] = monthsCovered;
    vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startTime = $('#dsTimeSlot').val();
    // vm.productScheduledDates.push(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter].startDate);
    vm.sessionSpecialPricing[vm.fixedDepartureSessionCounter] = vm.sessionPricing;
    
    if (currentSessionHasSpecialPricing == true) {
      currentSessionHasSpecialPricing = false;
      specialPricingIndexTracker.add(vm.fixedDepartureSessionCounter);
    }

    $(".ds_repeat_daily").hide();
    $(".dsChangePrice").hide();
    vm.sessionSeatsLimitType = 'select';
    vm.showTheList = true;
    if (!vm.editingTheSession) {
      vm.fixedProductScheduleVisibility[vm.fixedDepartureSessionCounter] = true;
      $('#sessionsCreatedAndUnsaved').click();
      return true;
    } else if (vm.editingTheSession && !vm.oldSessionEditing) {
      vm.editingTheSession = false;
      vm.onlyCapacityEditAllowed = false;
      vm.fixedProductScheduleVisibility[vm.fixedDepartureSessionCounter] = true;
      $('#sessionsCreatedAndUnsaved').click();
      return true;
    } else {
      vm.fixedProductScheduleVisibility[vm.fixedDepartureSessionCounter] = false;
        $http.post('/api/host/deleteParticularSession/' + productId + '/' + vm.fixedProductScheduleUniqueIdOld[vm.oldEditedSessionIndex], {removedTimeStampsOFDeletedSessionArr: vm.productScheduledTimestamps}).success(function (response) {
          vm.fixedProductScheduleOld.splice(vm.oldEditedSessionIndex, 1);
          vm.sessionSpecialPricingOld.splice(vm.oldEditedSessionIndex, 1);
          vm.sessionInternalNamesOld.splice(vm.oldEditedSessionIndex, 1);
          vm.fixedProductScheduleCapacitiesOld.splice(vm.fixedProductScheduleUniqueIdOld[index], 1);

          vm.fixedProductScheduleOld.push(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter]);
          vm.sessionSpecialPricingOld.push(vm.sessionSpecialPricing[vm.fixedDepartureSessionCounter]);
          vm.sessionInternalNamesOld.push(vm.sessionInternalNames[vm.fixedDepartureSessionCounter]);
          vm.fixedProductScheduleCapacitiesOld.push(vm.fixedProductScheduleCapacities[vm.fixedDepartureSessionCounter]);
          saveTheProduct();
          //$('#sessionsCreatedAndSaved').click();
        }).error(function (error) {
          toasty.error({
            title: 'Something went wrong!',
            msg: 'The duplicate session has been created. Please delete it or contact tourgecko support',
            sound: false
          });
          return false;
        });
    }
    vm.showTheList = true;
  }

  /* ------------------------------------------------------------------------------------------------------------------------- */    
      /* Save function */
  /* ------------------------------------------------------------------------------------------------------------------------- */
      vm.errorContent = [];
      vm.showErrorsOnTop = false;
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      var weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      vm.save = function (isValid) {
        if (vm.saveBtnDisabled)
          return;
        if (vm.errorContent.length > 0)
          vm.errorContent.length = 0;

        var isPricingCorrect = finalValidateOfPricing();
        if (isPricingCorrect == false) {
          vm.showErrorsOnTop = true;
          if (!isValid) {
            vm.showErrorsOnTop = true;
            $scope.$broadcast('show-errors-check-validity', 'vm.form.tourForm');
            if(vm.form.tourForm.name_of_the_tour.$error.required)
              vm.errorContent.push(errorContentData['tourName']);
            if(vm.form.tourForm.tour_main_destination.$error.required)
              vm.errorContent.push(errorContentData['tourDestination']);
            if(vm.form.tourForm.tours_sa_date_time.$error.required)
              vm.errorContent.push(errorContentData['tourDuration']);
          }
          if (!vm.pricingPresent)
            vm.errorContent.push(errorContentData['onePricingOptionRequired']);
          if (!vm.groupPricingValid) {          
            vm.errorContent.push(errorContentData['groupPricingFinalValidation']);
          }
          if (!vm.everyonePricingValid) {
            vm.errorContent.push(errorContentData['everyonePricingFinalValidation']);
          }
          if(vm.productAvailabilityType == 'Open Date' && $scope.productTimeSlotsAvailability == 'Fixed Slots' && $scope.timeslots.length == 0)
            vm.errorContent.push(errorContentData['openDatTimeSlotNotPresent']);
          return false;
        }

        if (!isValid) {
          vm.showErrorsOnTop = true;
          $scope.$broadcast('show-errors-check-validity', 'vm.form.tourForm');
          if(vm.form.tourForm.name_of_the_tour.$error.required)
            vm.errorContent.push(errorContentData['tourName']);
          if(vm.form.tourForm.tour_main_destination.$error.required)
            vm.errorContent.push(errorContentData['tourDestination']);
          if(vm.form.tourForm.tours_sa_date_time.$error.required)
            vm.errorContent.push(errorContentData['tourDuration']);
            
          return false;
        }
        if(vm.productAvailabilityType == 'Open Date' && $scope.productTimeSlotsAvailability == 'Fixed Slots' && $scope.timeslots.length == 0)
          vm.errorContent.push(errorContentData['openDatTimeSlotNotPresent']);
        
        if(productId !== undefined) {
          var areSessionsPresent = false;
          var isPriceSame = true;
          isPriceSame = angular.equals(previousPricingOption, vm.pricingParams);        
          if (!isPriceSame && vm.productScheduledDates.length > 0) {
            var today = (new Date().getDate()).toString() + ' ' + months[new Date().getMonth()] + ' ' + (new Date().getFullYear()).toString();
            today = new Date (today);
            for (var index = 0; index < vm.productScheduledDates.length; index++) {
              var iteratorDay = new Date (vm.productScheduledDates[index]);

              if (iteratorDay.getTime() > today.getTime()) {
                areSessionsPresent = true;
                break;
              }
            }

            if (areSessionsPresent)
              $('#pricingApplicability').click();
            else {
              $('#loadingDivHostSide').css('display', 'block');
              $('#tourgeckoBody').addClass('waitCursor');
              setProductInformation();
              saveTheProduct();
            }
          } else {
            $('#loadingDivHostSide').css('display', 'block');
            $('#tourgeckoBody').addClass('waitCursor');
            setProductInformation();
            saveTheProduct();
          }
        } else {
          $('#loadingDivHostSide').css('display', 'block');
          $('#tourgeckoBody').addClass('waitCursor');
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
            for (var index = 0; index < vm.sessionSpecialPricing.length; index++)
              vm.sessionSpecialPricing[index] = vm.pricingParams;
          }
          $('#loadingDivHostSide').css('display', 'block');
          $('#tourgeckoBody').addClass('waitCursor');
          setProductInformation();
          saveTheProduct();
        }
      }

      vm.saveTheEditedProduct = function (applyPriceToNewSessions) {
        /*if (applyPriceToNewSessions == false) {
          for (var index = 0; index < vm.sessionSpecialPricing.length; index ++) {
            if (!specialPricingIndexTracker.has(index)) {
              vm.sessionSpecialPricing[index] = vm.pricingParams;
            }
          }
        }*/
        vm.isNewPricingApplicableOnNewSessions = applyPriceToNewSessions;
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        setProductInformation();
        saveTheProduct();
      }

      function saveTheProduct () {
        console.log('abbba hujur ' + JSON.stringify(vm.tour.productTags));
        if(productId) {
          $http.post('/api/host/editproduct/', {tour: vm.tour,
                                                toursessions: vm.fixedProductSchedule, 
                                                sessionPricings: vm.sessionSpecialPricing,
                                                monthsCovered: sessionMonthsCovered,
                                                sessionInternalNames: vm.sessionInternalNames,
                                                sessionCapacities: vm.fixedProductScheduleCapacities,
                                                changePreviouslyCreatedSessionPricing: vm.isNewPricingApplicableOnOldSessions,
                                                changeNewlyCreatedSessionPricing: vm.isNewPricingApplicableOnNewSessions})
          .success(function (response) {
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
            if (!vm.editingTheSession)
              $state.go('host.showProduct', {productId: response._id, showSuccessMsg: false, showEditSuccessMsg: true});
            if (vm.editingTheSession) {
              $('#tours_sa_Selector').click();
              //$('#sessionsCreatedAndSaved').click();
              vm.showTheList = true;
              vm.fixedProductScheduleCapacities.length = 0;
              vm.fixedProductSchedule.length = 0;
              vm.sessionSpecialPricing.length = 0;
              vm.sessionInternalNames.length = 0;
            }
            if (!vm.editingTheSession && $state.previous.state.name == 'host.showProduct' || $state.previous.state.name == 'host.editProduct')
              $state.reload();
            $rootScope.productCreationOrEditDirtyDataPresent = false;
            vm.editingTheSession = false;
            vm.oldSessionEditing = false;
          }).error(function (response) {
            vm.error = response.message;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
            if (vm.editingTheSession) {
              toasty.error({
                title: 'Session cannot be edited!',
                msg: 'The session cannot be edited. Please contact tourgecko support before changing anything!',
                sound: false
              });
              return false;
            }
            vm.editingTheSession = false;
            vm.oldSessionEditing = false;
          });
        } else {
          vm.tour.isPublished = true;
          $http.post('/api/host/product/', {tour: vm.tour,
                                            toursessions: vm.fixedProductSchedule,
                                            sessionPricings: vm.sessionSpecialPricing,
                                            monthsCovered: sessionMonthsCovered,
                                            sessionInternalNames: vm.sessionInternalNames,
                                            sessionCapacities: vm.fixedProductScheduleCapacities})
          .success(function (response) {
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
            $state.go('host.showProduct', {productId: response._id, showSuccessMsg: true, showEditSuccessMsg: false});
            $rootScope.productCreationOrEditDirtyDataPresent = false;
            //success
          }).error(function (response) {
            vm.error = response.message;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
          });
        }
      }

  /* ------------------------------------------------------------------------------------------------------------------------- */    
      /* Assign form data to product record properly */
  /* ------------------------------------------------------------------------------------------------------------------------- */
      function setProductInformation() {
        vm.productScheduledDates = vm.productScheduledDates.sort();
        vm.tour.productScheduledDates = vm.productScheduledDates;
        vm.tour.destination = document.getElementById('tour_main_destination').value;
        vm.tour.productGrade = vm.productGrade;
        vm.tour.productAvailabilityType = vm.productAvailabilityType;
        vm.tour.productScheduledTimestamps = vm.productScheduledTimestamps;
        vm.tour.productDurationType = vm.productDurationType;
        vm.tour.productSummary = CKEDITOR.instances.describe_tour_briefly.getData();
        vm.tour.productCancellationPolicy = CKEDITOR.instances.cancellationPolicies.getData();
        vm.tour.productGuidelines = CKEDITOR.instances.tour_guidelines.getData();
        vm.tour.productInclusions = CKEDITOR.instances.tour_inclusions.getData();
        vm.tour.productExclusions = CKEDITOR.instances.tour_exclusions.getData();
        vm.tour.productItineraryDescription = vm.itineraries;
        if ($window.localStorage.getItem('productType') != '')
          vm.tour.productType = $window.localStorage.getItem('productType');
        $window.localStorage.setItem('productType', '');
        vm.tour.productPricingOptions = vm.pricingParams;
        vm.tour.areAddonsAvailable = vm.isAddonAvailable;
        vm.tour.productAddons = vm.addonParams.params;
        vm.tour.isDepositNeeded = vm.isDepositApplicable;
        //angular.copy($scope.timeslots, vm.tour.productTimeSlots);
        vm.tour.productTimeSlots = $scope.timeslots;
        vm.tour.isProductScheduled = vm.isProductScheduled;
        vm.tour.productTimeSlotsAvailability = $scope.productTimeSlotsAvailability;
        // Maps upload are not present in beta
        //setUploadedMapsUrls();
        setUploadedPcituresUrls(false);
        vm.tour.isProductAvailabileAllTime = vm.isProductAvailabileAllTime;
        if (vm.tour.isProductAvailabileAllTime && vm.tour.productUnavailableMonths)
          vm.tour.productUnavailableMonths.length = 0;
      }
  /* ------------------------------------------------------------------------------------------------------------------------- */    
      /* Assign form data to product record properly, ends here */
  /* ------------------------------------------------------------------------------------------------------------------------- */
      
      $scope.setUploadedPcituresUrls = function (saveIt) {
        setUploadedPcituresUrls(saveIt);
      }

      function setUploadedPcituresUrls (saveIt) {
        var modifiedUploadedProductPicturesForThisProduct = [];
        var productPictureConstPath = '/modules/hosts/client/pictures/products/tours/photos/'
        for (var index = 0; index < $scope.uploadedProductPicturesForThisProduct.length; index++) {
          var tempFileObject = {url: productPictureConstPath + $scope.uploadedProductPicturesForThisProduct[index].uuid, size: $scope.uploadedProductPicturesForThisProduct[index].size, name: $scope.uploadedProductPicturesForThisProduct[index].name}
          modifiedUploadedProductPicturesForThisProduct.push(tempFileObject);
        }
        if (!saveIt)
          vm.tour.productPictureURLs =  modifiedUploadedProductPicturesForThisProduct;
        else {
          $http.post('/api/host/editproduct/productpictureurls', {productId: vm.tour._id, productPictureURLs: modifiedUploadedProductPicturesForThisProduct})
          .success(function (response) {
            //success
          }).error(function (response) {
          });
        }
      }

      /* Map uploads are not present in beta */
      /*
      function setUploadedMapsUrls () {
        var modifiedUploadedProductMapsForThisProduct = [];
        var productPictureConstPath = '/modules/hosts/client/pictures/products/tours/maps/'
        for (var index = 0; index < $scope.uploadedProductMapsForThisProduct.length; index++) {
          modifiedUploadedProductMapsForThisProduct.push(productPictureConstPath + $scope.uploadedProductMapsForThisProduct[index]);
        }

        vm.tour.productMapURLs = modifiedUploadedProductMapsForThisProduct;
      } */
      
      vm.enableSaveButton = function () {
        vm.saveBtnDisabled = false;
        $rootScope.productCreationOrEditDirtyDataPresent = true;
      }

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
        if (!vm.tour || (vm.tour && !vm.tour.productTitle)) {
          toasty.error({
            title: 'Tour name required!',
            msg: 'Please enter at least title of the tour before checking preview!',
            sound: false
          });
          return false;
        }
        if (productId) {
          var winPreview = $window.open($state.href('hostAndGuest.tourPreview', {productId: productId}),'_blank','heigth=600,width=600');
          winPreview.document.body.innerHTML = "<div style='position:fixed;top:45%;left:46%;width:100%;height:100%;background-color:transparent;color:#40C4FF;font-size:20px;z-index: 9999 !important;pointer-events: none;filter: alpha(opacity=40);'>Please wait ...</div>"
        } else {
          setProductInformation();
          $window.localStorage.setItem('productData', JSON.stringify(vm.tour));
          $window.open($state.href('hostAndGuest.previewBeforeSave'),'_blank','heigth=600,width=600');
        }
      }

      vm.showTourPreview = function() {
        var winPreview = $window.open($state.href('hostAndGuest.tourPreview', {productId: productId}),'_blank','heigth=600,width=600');
        winPreview.document.body.innerHTML = "<div style='position:fixed;top:45%;left:46%;width:100%;height:100%;background-color:transparent;color:#40C4FF;font-size:20px;z-index: 9999 !important;pointer-events: none;filter: alpha(opacity=40);'>Please wait ...</div>"
      }

      vm.getDepartureDateOfSession = function (startDate) {
        var displayDate = '-';
        if (startDate) {
          var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
          var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          var date = new Date(startDate);
          displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
        }
        return displayDate;
      }
      vm.viewThisSession = function (index, alreadySavedSession) {
        if (productId && alreadySavedSession) {
          if (vm.fixedProductScheduleOld[index].repeatBehavior != 'Do not repeat') {
            $('#confirm-navigation-to-sessions-btn').click();
            return;
          }
          var sessionStartDate = new Date(vm.fixedProductScheduleOld[index].startDate).getTime().toString();
          $state.go('host.sessionDetails', {productSessionId: vm.fixedProductScheduleUniqueIdOld[index], sessionStartDate: sessionStartDate});
        } else {
          toasty.error({
            title: 'Session is not saved!',
            msg: 'Please save the tour first to view the sessions',
            sound: false
          });
          return false;
        }
      }

      var unWatchTheTour = false;
      vm.deleteThisSession = function (index, alreadySavedSession) {
        if (productId && alreadySavedSession) {
          $http.get('/api/host/counBookingForParticularSession/' + vm.fixedProductScheduleUniqueIdOld[index]).success(function (response) {
            if (response.bookingCount > 0) {
              toasty.error({
                title: 'Session has bookings!',
                msg: 'This session already have some bookings. It cannot be deleted.',
                sound: false
              });
              return false;
            } else {
              if (!$rootScope.productCreationOrEditDirtyDataPresent)
                unWatchTheTour = true;
              refreshThePreviouslyCreatedTimeStamp(index, true);
              $http.post('/api/host/deleteParticularSession/' + productId + '/' + vm.fixedProductScheduleUniqueIdOld[index], {removedTimeStampsOFDeletedSessionArr: vm.productScheduledTimestamps}).success(function (response) {
                if (response == 'errorInDelete') {
                  toasty.error({
                    title: 'Error in delete!',
                    msg: 'The session could not be deleted. Please try again',
                    sound: false
                  });
                  return false;
                }
                vm.fixedProductScheduleOld.splice(index, 1);
                vm.sessionSpecialPricingOld.splice(index, 1);
                vm.sessionInternalNamesOld.splice(index, 1);
                vm.fixedProductScheduleCapacitiesOld.splice(index, 1);
                vm.fixedProductScheduleUniqueIdOld.splice(index, 1);
                toasty.success({
                  title: 'Session deleted!',
                  msg: 'The session has been deleted successfully.',
                  sound: false
                });
                if (unWatchTheTour) {
                  $rootScope.productCreationOrEditDirtyDataPresent = false;
                  unWatchTheTour = false;
                }
                return false;
              }).error(function (response) {
                toasty.error({
                  title: 'Error in delete!',
                  msg: 'The session could not be deleted. Please try again',
                  sound: false
                });
                return false;
                if (unWatchTheTour) {
                  $rootScope.productCreationOrEditDirtyDataPresent = false;
                  unWatchTheTour = false;
                }
              });

            }
          }).error(function (response) {
            toasty.error({
              title: 'Error in delete!',
              msg: 'The session could not be deleted. Please try again',
              sound: false
            });
            return false;
          });
        } else {
          refreshThePreviouslyCreatedTimeStamp(index, false);
          vm.fixedProductSchedule.splice(index, 1);
          vm.sessionSpecialPricing.splice(index, 1);
          vm.sessionInternalNames.splice(index, 1);
          vm.fixedProductScheduleCapacities.splice(index, 1);
        }
      }

      vm.editThisSession = function (index, alreadySavedSession) {
        if (productId && alreadySavedSession) {
          $http.get('/api/host/counBookingForParticularSession/' + vm.fixedProductScheduleUniqueIdOld[index]).success(function (response) {
            if (response.bookingCount > 0) {
              // only capacity edit allowed
              vm.onlyCapacityEditAllowed = true;
              vm.editingTheSession = true;
              vm.editingOldSession = true;
              vm.oldEditedSessionIndex = index;
              vm.fixedDepartureSessionCounter = vm.fixedProductSchedule.length;
              setTheSessionDetailsToEdit(index, true);
            } else {
              vm.editingTheSession = true;
              vm.editingOldSession = true;
              vm.oldEditedSessionIndex = index;
              vm.fixedDepartureSessionCounter = vm.fixedProductSchedule.length;
              setTheSessionDetailsToEdit(index, true);
            }
            vm.oldSessionEditing = true;
          }).error(function (err) {

          });
        } else {
          vm.editingTheSession = true;
          vm.editingOldSession = false;
          vm.fixedDepartureSessionCounter = index;
          setTheSessionDetailsToEdit(index, false);
        }
      }

      function setTheSessionDetailsToEdit(index, alreadySavedSession) {
        refreshThePreviouslyCreatedTimeStamp(index, alreadySavedSession);
        vm.fixedSchedule = [];
        if (alreadySavedSession) {
          vm.sessionName = vm.sessionInternalNamesOld[index];
          vm.sessionPricing = vm.sessionSpecialPricingOld[index];
          vm.sessionSeatsLimitType =  vm.fixedProductScheduleCapacitiesOld[index].sessionSeatsLimitType;
          angular.copy(vm.fixedProductScheduleOld, vm.fixedSchedule);
          vm.fixedProductSchedule.push(vm.fixedProductScheduleOld[index]);
          vm.sessionSpecialPricing.push(vm.sessionSpecialPricingOld[index]);
          vm.fixedProductScheduleCapacities.push(vm.fixedProductScheduleCapacitiesOld[index])
        } else {
          vm.sessionName = vm.sessionInternalNames[index];
          vm.sessionPricing = vm.sessionSpecialPricing[index];
          vm.sessionSeatsLimitType =  vm.fixedProductScheduleCapacities[index].sessionSeatsLimitType;
          angular.copy(vm.fixedProductSchedule, vm.fixedSchedule);
        }
        
        if(vm.fixedSchedule[index].repeatBehavior == "Do not repeat"){
          $(".ds_repeat_daily").hide();
          $(".dsRepeatWeekly").hide();
          $(".ds_repeat_daily_except").hide();
        } else if(vm.fixedSchedule[index].repeatBehavior == "Repeat Daily"){
          $(".ds_repeat_daily").show();
          $(".ds_repeat_daily_except").show();
          $(".dsRepeatWeekly").hide();
        } else if(vm.fixedSchedule[index].repeatBehavior == "Repeat Weekly"){
          $(".ds_repeat_daily").show();
          $(".dsRepeatWeekly").show();
          $(".ds_repeat_daily_except").hide();
        }

        $timeout(function(){
          $('#fixedDepartureSessionCreationModalTrigger').click();
          $('ul.nav-tabs a[href="#session_dt"]').tab('show');
          console.log(JSON.stringify(vm.fixedProductSchedule[vm.fixedDepartureSessionCounter]));
        });     
      }

      function refreshThePreviouslyCreatedTimeStamp(sessionIndex, alreadySavedSession) {
        vm.fixedSchedule = [];
        if (alreadySavedSession)
          angular.copy(vm.fixedProductScheduleOld, vm.fixedSchedule);
        else
          angular.copy(vm.fixedProductSchedule, vm.fixedSchedule);
        var repeatedDays = 0;
        var notAllowedDays = new Set();
        var allowedDays = new Set();
        if(vm.fixedSchedule[sessionIndex].repeatBehavior == 'Repeat Daily' ||
          vm.fixedSchedule[sessionIndex].repeatBehavior == 'Repeat Weekly') {
          var firstDate = new Date(vm.fixedSchedule[sessionIndex].repeatTillDate);
          var secondDate = new Date(vm.fixedSchedule[sessionIndex].startDate);
          var oneDay = 24 * 60 * 60 * 1000;
          repeatedDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
          repeatedDays = repeatedDays + 1;

          if (vm.fixedSchedule[sessionIndex].repeatBehavior == 'Repeat Daily' && vm.fixedSchedule[sessionIndex].notRepeatOnDays) {
            for (var index = 0; index < vm.fixedSchedule[sessionIndex].notRepeatOnDays.length; index++)
              notAllowedDays.add(weekDaysNumber.get(vm.fixedSchedule[sessionIndex].notRepeatOnDays[index]));
          }
          if (vm.fixedSchedule[sessionIndex].repeatBehavior == 'Repeat Weekly' && vm.fixedSchedule[sessionIndex].repeatOnDays) {
            for (var index = 0; index < vm.fixedSchedule[sessionIndex].repeatOnDays.length; index++)
              allowedDays.add(weekDaysNumber.get(vm.fixedSchedule[sessionIndex].repeatOnDays[index]));
          }
        }


        var eventDate = new Date(vm.fixedSchedule[sessionIndex].startDate);
        var validatorDate = new Date(vm.fixedSchedule[sessionIndex].startDate);
        var monthTracker = new Set();
        var monthsCovered = [];
    
        for (var index = 0; index <= repeatedDays; index ++) {
          if((vm.fixedSchedule[sessionIndex].repeatBehavior == 'Repeat Daily' && !notAllowedDays.has(validatorDate.getDay())) || 
            (vm.fixedSchedule[sessionIndex].repeatBehavior == 'Repeat Weekly' && allowedDays.has(eventDate.getDay())) ||
            vm.fixedSchedule[sessionIndex].repeatBehavior == 'Do not repeat') {
            var sessionCreatedTimestamp;
              if ($('#dsTimeSlot').val() == undefined || $('#dsTimeSlot').val() == '' || $('#dsTimeSlot').val() == ' ')
                sessionCreatedTimestamp = new Date(validatorDate).getTime().toString() + 'NA';
              else
                sessionCreatedTimestamp = new Date(validatorDate).getTime().toString() + $('#dsTimeSlot').val().toString();

              createdSessionTracker.delete(sessionCreatedTimestamp)
              vm.productScheduledTimestamps.splice(vm.productScheduledTimestamps.indexOf(sessionCreatedTimestamp), 1);
          }
          validatorDate = new Date (validatorDate);
          validatorDate = validatorDate.setDate(validatorDate.getDate() + 1);
          validatorDate = new Date (validatorDate);
        }
      }

      vm.checkVisibilityCondition = function (index) {
        if (index == vm.fixedProductSchedule.length - 1 && !showLastSession)
          return false

        return true;
      }

      vm.pastSessionPresent = false;
      vm.checkISThisPast = function (date) {
        var today = new Date().getDate().toString() + ' ' + months[new Date().getMonth()] + ' ' + new Date().getFullYear().toString();
        if (new Date(date).getTime() < new Date(today).getTime()) {
          vm.pastSessionPresent = true;
          return true;
        }
        return false;
      }

      vm.futureSessionPresent = false;
      vm.checkISThisFuture = function (date) {
        var today = new Date().getDate().toString() + ' ' + months[new Date().getMonth()] + ' ' + new Date().getFullYear().toString();
        if (new Date(date).getTime() >= new Date(today).getTime()) {
          vm.futureSessionPresent = true;
          return true;
        }

        return false;
      }
      vm.fixedProductScheduleOld = [];
      vm.sessionSpecialPricingOld = [];
      vm.sessionInternalNamesOld = [];
      vm.fixedProductScheduleCapacitiesOld = [];
      vm.fixedProductScheduleUniqueIdOld = [];
      $scope.setTheSessionListItem = function (sessions) {
        for (var index = 0; index < sessions.length; index ++) {
          vm.fixedProductScheduleOld[index] = sessions[index].sessionDepartureDetails;
          vm.sessionSpecialPricingOld[index] = sessions[index].sessionPricingDetails;
          vm.sessionInternalNamesOld[index] = sessions[index].sessionInternalName;
          vm.fixedProductScheduleCapacitiesOld[index] = sessions[index].sessionCapacityDetails;
          vm.fixedProductScheduleUniqueIdOld[index] = sessions[index]._id;
          $scope.$apply();
        }
      }
    }
  }());
