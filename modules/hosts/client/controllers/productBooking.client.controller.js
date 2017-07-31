
(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('ProductBookingController', ProductBookingController)

  ProductBookingController.$inject = ['$state', '$scope', '$stateParams', '$window', '$timeout', '$http'];

  function ProductBookingController($state, $scope, $stateParams, $window, $timeout, $http) {
    var vm = this;
    vm.numberOfItemsInOnePage = '10';
    vm.currentPageNumber = 1;
    vm.pageFrom = 0;
    vm.showAtLast = true;
    vm.rememberFilterPreferences = false;
    vm.noSearchQueryFired = true;

    vm.selectedFiltersForBookingRecords = [false, false, false, false, false];

    var filterMapping = new Map();
    filterMapping.set(0, 'Pending');
    filterMapping.set(1, 'Confirmed');
    filterMapping.set(2, 'Declined');
    filterMapping.set(3, 'Cancelled');
    filterMapping.set(4, 'Expired');

    var reverseFilterMapping = new Map()
    reverseFilterMapping.set('Pending', 0);
    reverseFilterMapping.set('Confirmed', 1);
    reverseFilterMapping.set('Declined', 2);
    reverseFilterMapping.set('Cancelled', 3);
    reverseFilterMapping.set('Expired', 4);
    

    $scope.selectedCategorizedKeys = [];
    var totalBookingRecords;
    if ($window.innerWidth > 767) 
      vm.paginationWindow = 5;
    else
      vm.paginationWindow = 3;

    var previousKeysPresence = $window.localStorage.getItem('arePreviousFiltersPresent');
    var preferenceRememberence = $window.localStorage.getItem('shallRememberFilterPreference');
    if (previousKeysPresence == 'present' && preferenceRememberence == 'Yes') {
      var previousFilterKeys = JSON.parse($window.localStorage.getItem("bookingFilters"));
      if ($window.localStorage.getItem('alreadySelectedItemsPerPage') != null)
        vm.numberOfItemsInOnePage = $window.localStorage.getItem('alreadySelectedItemsPerPage');
      for (var index = 0; index < previousFilterKeys.length; index++)
        vm.selectedFiltersForBookingRecords[reverseFilterMapping.get(previousFilterKeys[index])] = true;
      vm.rememberFilterPreferences = true;
      categorizedBooking(previousFilterKeys, true);
    } else {
      if ($window.localStorage.getItem('alreadySelectedItemsPerPage') != null)
        vm.numberOfItemsInOnePage = $window.localStorage.getItem('alreadySelectedItemsPerPage');
      fetchAllBookingRecords();
    }


    function fetchAllBookingRecords () {
      $http.get('/api/host/allBookings/' + parseInt(vm.numberOfItemsInOnePage)).success(function (response) {
        vm.bookings = response.bookingArray;
        if(vm.bookings.length == 0)
          $('#listViewOfBookings').hide();
        else
          $('#listViewOfBookings').show();
        vm.totalPages = Math.ceil(response.bookingsCount / parseInt(vm.numberOfItemsInOnePage));
        if(vm.totalPages <= vm.paginationWindow)
          vm.pageTo = vm.totalPages;
        else
          vm.pageTo = vm.paginationWindow;
        vm.pageCounterArray = new Array(vm.totalPages);
        totalBookingRecords = response.bookingsCount;
        if(vm.currentPageNumber > vm.totalPages) {
          vm.currentPageNumber = vm.totalPages;
          vm.showAtLast = false;
          vm.pageTo = vm.currentPageNumber;
          if(vm.pageTo - vm.paginationWindow >= 0)
            vm.pageFrom = vm.pageTo - vm.paginationWindow;
        } else {
          if ((vm.currentPageNumber - vm.paginationWindow) > 0)
            vm.pageFrom = Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
          else
            vm.pageFrom = 0;
          if ((vm.pageFrom + vm.paginationWindow) <= vm.totalPages)
            vm.pageTo = vm.pageFrom + vm.paginationWindow;
          else
            vm.pageTo = vm.totalPages;
          if (vm.pageTo + 1 < vm.totalPages)
            vm.showAtLast = true;
          else
            vm.showAtLast = false;
        }
        if (vm.pageFrom == 0)
          vm.showAtLast = true;
        if(vm.pageTo == vm.totalPages)
          vm.showAtLast = false;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }
    vm.validPricingOptions = [];
    if($stateParams.bookingId != null) {
      $http.get('/api/host/booking/'+ $stateParams.bookingId).success(function (response) {
        vm.specificBookingDetails = response;
        vm.bookingOptionsSelected = vm.specificBookingDetails.selectedpricingoptionindexandquantity;
        vm.addonOptionsSelected = vm.specificBookingDetails.selectedaddonoptionsindexandquantity;

        if (vm.specificBookingDetails.isOpenDateTour)
          vm.validPricingOptions = vm.specificBookingDetails.product.productPricingOptions;
        else if (vm.specificBookingDetails.productSession.isSessionPricingValid)
          vm.validPricingOptions = vm.specificBookingDetails.productSession.sessionPricingDetails;
        else
          vm.validPricingOptions = vm.specificBookingDetails.product.productPricingOptions;

        // vm.specificBookingDetails.actualSessionDate is nothing but milliseconds in string format
        // unary operator '+' is conveting it to number format to create the date
        var date = new Date(+vm.specificBookingDetails.actualSessionDate);
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        var dateValue = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var startDateOfTheTour =  year + '-' + month.toString() + '-' + dateValue.toString();
        $('#startDateOfTheTour').attr("value", startDateOfTheTour);

        var hourPart = vm.specificBookingDetails.actualSessionTime.split(':')[0];
        var minutePart = vm.specificBookingDetails.actualSessionTime.split(':')[1].split(' ')[0];
        var dayTime = vm.specificBookingDetails.actualSessionTime.split(':')[1].split(' ')[1];
        if (dayTime == 'AM') {
          if (parseInt(hourPart) == 12 || hourPart == '00')
            hourPart = '00';
          else
            hourPart = parseInt(hourPart) < 10 ? '0' + hourPart : hourPart;
        } else {
          if (parseInt(hourPart) < 12)
            hourPart = 12 + parseInt(hourPart);
        }

        var startTimeOfTheTour = hourPart.toString() + ':' + minutePart.toString();
        $('#startTimeOfTheTour').attr("value", startTimeOfTheTour);

        if (!vm.specificBookingDetails.isOpenDateTour && vm.specificBookingDetails.productSession.sessionDepartureDetails.startTime != '') {
          var hourPart = vm.specificBookingDetails.productSession.sessionDepartureDetails.startTime.split(':')[0];
          var minutePart = vm.specificBookingDetails.productSession.sessionDepartureDetails.startTime.split(':')[1].split(' ')[0];
          var dayTime = vm.specificBookingDetails.productSession.sessionDepartureDetails.startTime.split(':')[1].split(' ')[1];
          if (dayTime == 'AM') {
            if (parseInt(hourPart) == 12)
              hourPart = '00';
            else
              hourPart = parseInt(hourPart) < 10 ? '0' + hourPart : hourPart;
          } else {
            if (parseInt(hourPart) < 12)
              hourPart = 12 + parseInt(hourPart);
          }

          var startTimeOfTheTour = hourPart.toString() + ':' + minutePart.toString();
          $('#startTimeOfTheTour').attr("value", startTimeOfTheTour);
        }
      });

      $http.get('/api/host/booking/tracelog/'+ $stateParams.bookingId).success(function (response) {
        vm.log = response;
      });

      $http.get('/api/host/booking/payment/'+ $stateParams.bookingId).success(function (response) {
        vm.paymentsOfThisBooking = response;
      });
    }

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    vm.getDisplayDate = function (isoDate) {
      var date = new Date(isoDate);
      if (date == 'Invalid Date')
        date = new Date(+isoDate);
      var displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
      return displayDate;
    }

    vm.goToBookingDetailScreen = function (index) {
      $state.go('host.bookingdetails', {bookingId: vm.bookings[index]._id});
    }

    vm.getEmailIdToDisplay = function (email) {
      if (email) {
        if ($window.innerWidth > 767) {
          if (email.length >= 25)
            return email.slice(0,15) + '\n' + email.slice(15, email.length);
          else
            return email;
        } else
          return email;
      }
    }

    vm.modifyBooking = function (status) {
      if (vm.specificBookingDetails.bookingStatus != 'Pending')
        return;
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      var bookingModificationData = {bookingId: $stateParams.bookingId, bookingStatus: status, bookingComments: vm.bookingComments}
      $http.post('/api/host/modifyBooking/', bookingModificationData).success(function (response) {
        $('.modal-backdrop').remove();
        // After confirming or declining booking, if we go to bookings tab, its a bit cimplicated to bring the same booking there.
        // Reason can be, filters already had applied pagination page changes after the action etc.
        // Hence for Beta, we will just bring the user back to the booking and will ask him to click Bookings to go to Bookings.
        //$state.go('host.allBookings');
        $state.reload();
      }).error(function (error) {
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    };

    vm.askActionConfirmation = function (bookingStatus, anchorId, modalId) {
      if (bookingStatus != 'Pending')
        return;
      else
        $(anchorId).attr("data-target", modalId);
    };

    vm.askRefundConfirmation = function (bookingStatus, anchorId, modalId) {
      $(anchorId).attr("data-target", modalId);
    };

    vm.refundTheGivenAmount = function () {
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      
      if (vm.specificBookingDetails.hostCompany.paymentGatewayBehavior == 'internal') {
        // This if and its respective else if block will get removed once we fix which internal gateway we are using finally
        if(vm.specificBookingDetails.hostCompany.paymentGateway == 'instamojo') {
          var refundData = {host: vm.specificBookingDetails.hostOfThisBooking, paymentId: vm.specificBookingDetails.paymentId, paymentRequestId: vm.specificBookingDetails.paymentRequestId, refundAmount: vm.refundAmount};
          $http.post('/api/payment/instamojo/refund/', refundData).success (function (response) {
            $('.modal-backdrop').remove();
            $state.reload();
          }).error(function (error) {
            $("#refund-confirmation").toggle("slow");
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
            $('.modal-backdrop').remove();
          });
        } else if(vm.specificBookingDetails.hostCompany.paymentGateway == 'razorpay') {
          var refundData = {host: vm.specificBookingDetails.hostOfThisBooking, paymentId: vm.specificBookingDetails.paymentId, refundAmount: vm.refundAmount};
          $http.post('/api/payment/razorpay/refund/', refundData).success (function (response) {
            $('.modal-backdrop').remove();
            $state.reload();
          }).error(function (error) {
            $("#refund-confirmation").toggle("slow");
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
            $('.modal-backdrop').remove();
          });
        }
      } else {
        // here we will check the paymentgateway and will call the api's accordingly.
      }
    }

    vm.changeItemsPerPage = function (itemsPerPage) {
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        vm.totalPages = Math.ceil(totalBookingRecords / parseInt(itemsPerPage));
        vm.pageCounterArray = new Array(vm.totalPages);
        $window.localStorage.setItem('alreadySelectedItemsPerPage', itemsPerPage);
        // This will only be possible if user is changing items per page from lestt to more
        if(vm.currentPageNumber > vm.totalPages) {
          vm.currentPageNumber = vm.totalPages;
          vm.showAtLast = false;
          vm.pageTo = vm.currentPageNumber;
          if(vm.pageTo - vm.paginationWindow >= 0)
            vm.pageFrom = vm.pageTo - vm.paginationWindow;
        } else {
          if ((vm.currentPageNumber - vm.paginationWindow) > 0 )
            vm.pageFrom = Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
          else
            vm.pageFrom = 0;

          if(vm.pageFrom + vm.paginationWindow <= vm.totalPages)
            vm.pageTo = vm.pageFrom + vm.paginationWindow;
          else
            vm.pageTo = vm.totalPages;
          if (vm.pageTo + 1 < vm.totalPages)
            vm.showAtLast = true;
          else
            vm.showAtLast = false;
        }
        if (vm.pageFrom == 0)
          vm.showAtLast = true;
        if(vm.pageTo == vm.totalPages)
          vm.showAtLast = false;

        if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + parseInt(itemsPerPage)).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(0);
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
          }).error(function (response) {
              vm.error = response.message;
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
          });
        } else {
          categorizedBooking($scope.selectedCategorizedKeys, true);
        }
    }

    vm.changePageNumber = function (clickedIndex) {
        if (vm.currentPageNumber == clickedIndex + 1) {
          $('html, body').scrollTop(0);
          return;
        }
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        vm.currentPageNumber = clickedIndex + 1;
        if (vm.currentPageNumber == vm.pageCounterArray.length) {
          vm.showAtLast = false;
          vm.pageTo = vm.currentPageNumber;
          if (vm.pageCounterArray.length >= vm.paginationWindow)
            vm.pageFrom = Math.ceil((vm.pageTo - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
          else
            vm.pageFrom = 0;
        }

        if(vm.currentPageNumber == 1) {
          vm.showAtLast = true;
          vm.pageFrom = 0
          if (vm.pageCounterArray.length >= vm.paginationWindow)
            vm.pageTo = vm.paginationWindow;
          else
            vm.pageTo = vm.pageCounterArray.length;
        }

        if (vm.pageFrom == 0)
          vm.showAtLast = true;
        if(vm.pageTo == vm.totalPages)
          vm.showAtLast = false;

        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(0);
              $window.changeCSSForBookingFilterButton();
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
          }).error(function (response) {
              vm.error = response.message;
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
          });
        } else {
            categorizedBooking($scope.selectedCategorizedKeys, true);
        }
    }


    var isWindowSizeReached = false;
    var windowSizeIncremented = false;
    vm.incrementPageNumber = function () {

        // if we are at last page number then just return
        if (vm.currentPageNumber == vm.totalPages)
            return;
        $('#loadingDivHostSide').css('display', 'block');
        $('#tourgeckoBody').addClass('waitCursor');
        // If we are at multiple of 5 or crossed the first multiple of 5, handle things differently
        if (vm.currentPageNumber % vm.paginationWindow == 0 || isWindowSizeReached) {
          isWindowSizeReached = true;

          // if we ar at multiple of 5 page number, then set off the variable to enter in the nect if loop
          if (vm.currentPageNumber % vm.paginationWindow == 0)
            windowSizeIncremented = false;

          // increment the page number
          vm.currentPageNumber = vm.currentPageNumber + 1;

          // if we are not in last window and the window is not changed, go inside.
          if (vm.showAtLast && !windowSizeIncremented) {
            // if we are two pages short of total pages, change the '....' to the starting side and set the from and to limits From: -4 here
            if (vm.currentPageNumber + 1 == vm.pageCounterArray.length) {
              vm.showAtLast = false;
              vm.pageFrom = vm.currentPageNumber - vm.paginationWindow - 1;
              vm.pageTo = vm.currentPageNumber + 1;
            } else {
              // if we are not two pages short of total pages, just set the from and to limits From : -5 here
              vm.pageFrom = vm.currentPageNumber - vm.paginationWindow;
              vm.pageTo = vm.currentPageNumber;
            }
          }
        } else {
          // If we are not at multiple of 5 or never crossed the first multiple of 5, just increment the page number
          vm.currentPageNumber = vm.currentPageNumber + 1;
        }

        if (vm.pageFrom == 0)
          vm.showAtLast = true;
        if(vm.pageTo == vm.totalPages)
          vm.showAtLast = false;

        var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
        if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
          $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
              vm.bookings = response;
              $('html, body').scrollTop(0);
              $window.changeCSSForBookingFilterButton();
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
          }).error(function (response) {
              vm.error = response.message;
              $('#loadingDivHostSide').css('display', 'none');
              $('#tourgeckoBody').removeClass('waitCursor');
          });
        } else {
            categorizedBooking($scope.selectedCategorizedKeys, true);
        }
    }

    vm.incrementWindowSize = function () {
      if (vm.currentPageNumber == vm.totalPages || vm.pageTo == vm.pageCounterArray.length)
        return;
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      windowSizeIncremented = true;
      if (Math.ceil(vm.currentPageNumber / vm.paginationWindow) * vm.paginationWindow + vm.paginationWindow <= vm.pageCounterArray.length) {
        vm.pageFrom = Math.ceil(vm.currentPageNumber / vm.paginationWindow) * vm.paginationWindow;
        vm.pageTo = vm.pageFrom + vm.paginationWindow;
        vm.showAtLast = true;
      } else {
        if (Math.ceil(vm.currentPageNumber / vm.paginationWindow) * vm.paginationWindow <= vm.pageCounterArray.length) {
          vm.pageFrom = Math.ceil(vm.currentPageNumber / vm.paginationWindow) * vm.paginationWindow;
          vm.pageTo = vm.pageCounterArray.length;
          vm.showAtLast = false;
        } else {
          vm.pageFrom = vm.currentPageNumber;
          vm.pageTo = vm.pageCounterArray.length;
          vm.showAtLast = false;
        }
      }

      if (vm.pageFrom == 0)
        vm.showAtLast = true;
      if(vm.pageTo == vm.totalPages)
        vm.showAtLast = false;

      vm.currentPageNumber = vm.pageFrom + 1;
      var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.bookings = response;
            $window.changeCSSForBookingFilterButton();
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        });
      } else {
          categorizedBooking($scope.selectedCategorizedKeys, false);
      }
    }

    vm.decrementPageNumber = function () {
      if (vm.currentPageNumber == 1)
          return;
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      vm.currentPageNumber = vm.currentPageNumber - 1;

      if (!vm.showAtLast) {
        var lastMultipleOfFive =  Math.ceil((vm.pageCounterArray.length - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
        if (vm.currentPageNumber == lastMultipleOfFive)
          vm.showAtLast = true;
      }

      if (vm.currentPageNumber % vm.paginationWindow == 0) {
        vm.pageFrom = vm.currentPageNumber - vm.paginationWindow;
        vm.pageTo = vm.currentPageNumber;
      }

      if (vm.pageFrom == 0)
        vm.showAtLast = true;
      if(vm.pageTo == vm.totalPages)
        vm.showAtLast = false;

      var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
          vm.bookings = response;
          $('html, body').scrollTop(0);
          $window.changeCSSForBookingFilterButton();
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        });
      } else {
          categorizedBooking($scope.selectedCategorizedKeys, true);
      }
    }

    vm.decrementWindowSize = function () {
      if (vm.currentPageNumber == 1 || vm.pageFrom == 0)
        return;
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      if (Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow > 0) {
        vm.pageTo = Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
        vm.pageFrom = vm.pageTo - vm.paginationWindow;
        vm.showAtLast = true;
      } else {
        if (vm.pageCounterArray.length >= vm.paginationWindow) {
          vm.pageFrom = 0;
          vm.pageTo = vm.paginationWindow;
          vm.showAtLast = true;
        } else {
          vm.pageFrom = 0;
          vm.pageTo = vm.pageCounterArray.length;
          vm.showAtLast = true;
        }
      }

      if (vm.pageFrom == 0)
        vm.showAtLast = true;
      if(vm.pageTo == vm.totalPages)
        vm.showAtLast = false;

      vm.currentPageNumber = vm.pageTo;
      var itemsPerPage = parseInt(vm.numberOfItemsInOnePage);
      if (!$scope.selectedCategorizedKeys || $scope.selectedCategorizedKeys.length == 0) {
        $http.get('/api/host/bookingsForCurrentPage/' + vm.currentPageNumber +'/' + itemsPerPage).success(function (response) {
            vm.bookings = response;
            $window.changeCSSForBookingFilterButton();
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        }).error(function (response) {
            vm.error = response.message;
            $('#loadingDivHostSide').css('display', 'none');
            $('#tourgeckoBody').removeClass('waitCursor');
        });
      } else {
          categorizedBooking($scope.selectedCategorizedKeys, false);
      }
    }
    vm.filterApplied = false;
    vm.applySelectedFiltersOnBookingRecords = function () {
      vm.filterApplied = true;
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      $scope.selectedCategorizedKeys.length = 0;
      for(var index = 0; index < vm.selectedFiltersForBookingRecords.length; index++) {
        if(vm.selectedFiltersForBookingRecords[index])
          $scope.selectedCategorizedKeys.push(filterMapping.get(index));
      }
      if ($scope.selectedCategorizedKeys.length > 0) {
        $window.localStorage.setItem('bookingFilters', JSON.stringify($scope.selectedCategorizedKeys));
        $window.localStorage.setItem('arePreviousFiltersPresent', 'present');
      }
      categorizedBooking($scope.selectedCategorizedKeys, true);
      $('#filter-dropdown-button').click();
    }

    vm.clearAllFilterOnBookingRecords = function () {
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      vm.selectedFiltersForBookingRecords = [false, false, false, false, false];
      $scope.selectedCategorizedKeys.length = 0;
      $window.localStorage.setItem('bookingFilters', ' ');
      $window.localStorage.setItem('arePreviousFiltersPresent', 'notPresent');
      vm.rememberFilterPreferences = false;
      $window.localStorage.setItem('shallRememberFilterPreference', 'No');
      fetchAllBookingRecords();
      vm.noSearchQueryFired = true;
      vm.BookingReferenceToBeSearched = null;
      $('#filter-dropdown-button').click();
    }

    vm.categorizedBooking = function (filterKeys, startFromTop) {
      vm.filterApplied = true;
      categorizedBooking(filterKeys, startFromTop);
    }

    function categorizedBooking (filterKeys, startFromTop) {
      vm.BookingReferenceToBeSearched = '';
      vm.bookings.length = 0;
      if (filterKeys == 'All') {
        fetchAllBookingRecords();
        return;
      }
      var itemsPerPageSelected = parseInt(vm.numberOfItemsInOnePage);
      $http.post('/api/host/categorizedBooking/' ,{categoryKeys: filterKeys,
        pageNumber: vm.currentPageNumber,
        itemsPerPage: itemsPerPageSelected
      })
      .success(function (response) {
        vm.bookings = response.bookingArray;
        if(vm.bookings.length == 0)
          $('#listViewOfBookings').hide();
        else
          $('#listViewOfBookings').show();
        vm.totalPages = Math.ceil(response.bookingsCount/itemsPerPageSelected);
        vm.pageCounterArray = new Array(vm.totalPages);
        totalBookingRecords = response.bookingsCount;
        if(vm.currentPageNumber > vm.totalPages) {
          vm.currentPageNumber = vm.totalPages;
          vm.showAtLast = false;
          vm.pageTo = vm.currentPageNumber;
          if(vm.pageTo - vm.paginationWindow >= 0)
            vm.pageFrom = vm.pageTo - vm.paginationWindow;
        } else {
          if ((vm.currentPageNumber - vm.paginationWindow) > 0)
            vm.pageFrom = Math.ceil((vm.currentPageNumber - vm.paginationWindow) / vm.paginationWindow) * vm.paginationWindow;
          else
            vm.pageFrom = 0;

          if (vm.pageFrom + vm.paginationWindow <= vm.totalPages)
            vm.pageTo = vm.pageFrom + vm.paginationWindow;
          else
            vm.pageTo = vm.totalPages;
          if (vm.pageTo + 1 < vm.totalPages)
            vm.showAtLast = true;
          else
            vm.showAtLast = false;
        }
        if (vm.pageFrom == 0)
          vm.showAtLast = true;
        if(vm.pageTo == vm.totalPages)
          vm.showAtLast = false;

        if (startFromTop)
          $('html, body').scrollTop(0);
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }).error(function (err) {
        vm.filterApplied = false;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }

    vm.searchThisBooking = function (bookingReference) {
      $(".nav-bookings").find(".active").removeClass("active");
      $http.get('/api/host/booking/search/' + bookingReference).success(function (response) {
        vm.noSearchQueryFired = false;
        vm.bookings = response;
      });
    }

    vm.setFilterPreferences = function () {
      if (vm.rememberFilterPreferences == true)
        $window.localStorage.setItem('shallRememberFilterPreference', 'Yes');
      else
        $window.localStorage.setItem('shallRememberFilterPreference', 'No');
    }

    vm.getCSSClassForBigScreens = function () {
      if ($window.innerWidth > 767)
        return "col-lg-6";
    }

    vm.goToBookingDetails = function (id) {
      $state.go('host.bookingdetails', {bookingId: id});
    }

    vm.checkIfTheBookingOptionIsSelected = function (index) {
      if (parseInt(vm.bookingOptionsSelected[index]) > 0 && vm.bookingOptionsSelected[index] != 'Please Select')
        return true;
      else
        return false;
    }

    vm.areAddonsSelected = function () {
      if (vm.addonOptionsSelected) {
        for (var index = 0; index < vm.addonOptionsSelected.length; index ++ ) {
          if (vm.addonOptionsSelected[index] > 0)
            return true;
        }

        return false;
      }
    }
  }
}());
