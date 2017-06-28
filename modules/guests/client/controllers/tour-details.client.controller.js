(function () {
  'use strict';

  angular
    .module('guests')
    .controller('TourDetailsController', TourDetailsController)
    .filter('htmlData', function($sce) {
        return function(val) {
          return $sce.trustAsHtml(val);
        };
    });

  TourDetailsController.$inject = ['$scope', '$state', '$window', '$http', '$location', 'Authentication'];

  function TourDetailsController($scope, $state, $window, $http, $location, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
    var productId = $location.path().split('/')[3];
    vm.productDetails;
    vm.productImageURLs = [];
    vm.sessionPricing = [];

    var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    
    $http.get('/api/guest/product/' + productId).success(function (response) {
      if(response == 'No tour found with this id') {
        vm.error = response;
        $('#tourDetailsScreen').hide();
        return;
      }
      vm.productDetails = response[0];
      vm.companyDetails = response[0].hostCompany;
      
      $http.get('/api/host/product/productsession/' + productId).success(function (response) {
        vm.sessionsOfThisProduct = response;
        setSessionPricingOptions (response);
      }).error(function(response) {
        vm.error = response.message;
        $('#loadingDivTourDetails').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
      
      vm.companyData = response[0].hostCompany;
      if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.facebook && vm.companyData.hostSocialAccounts.facebook != "")
        vm.facebookLink = 'https://www.facebook.com/' + vm.companyData.hostSocialAccounts.facebook;
      if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.twitter && vm.companyData.hostSocialAccounts.twitter != "")
        vm.twitterLink = 'https://www.twitter.com/' + vm.companyData.hostSocialAccounts.twitter;
      if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.instagram && vm.companyData.hostSocialAccounts.instagram != "")
        vm.instagramLink = 'https://www.instagram.com/' + vm.companyData.hostSocialAccounts.instagram;
        
      vm.productImageURLs = response[0].productPictureURLs
      
      $('#loadingDivTourDetails').css('display', 'none');
      $('#tourgeckoBody').removeClass('waitCursor');
    }).error(function (response) {
      vm.error = response.message;
      $('#loadingDivTourDetails').css('display', 'none');
      $('#tourgeckoBody').removeClass('waitCursor');
    });

    var sessionDateTimePrice = new Map();
    function setSessionPricingOptions (sessions) {
      var sessionDates = new Map();
      
      for (var index = 0; index < sessions.length; index ++) {
        var isSavingRequired = true;
        if (sessions[index].sessionDepartureDetails.startTime != '' && sessions[index].sessionDepartureDetails.startTime !== undefined) {
          if (!sessionDates.has(new Date(sessions[index].sessionDepartureDetails.startDate).getTime())) {
            var sessionTimes = [];
            sessionTimes.push(sessions[index].sessionDepartureDetails.startTime);
            sessionDates.set(new Date(sessions[index].sessionDepartureDetails.startDate).getTime(), sessionTimes);
          } else {
            isSavingRequired = false;
            var sessionTimes = sessionDates.get(new Date(sessions[index].sessionDepartureDetails.startDate).getTime());
            sessionTimes.push(sessions[index].sessionDepartureDetails.startTime);
            sessionDates.set(new Date(sessions[index].sessionDepartureDetails.startDate).getTime(), sessionTimes);
          }
          var key = new Date(sessions[index].sessionDepartureDetails.startDate).getTime().toString() + sessions[index].sessionDepartureDetails.startTime.toString();
            key = key.replace(/\s/g,'');
            if (sessions[index].isSessionPricingValid)
              sessionDateTimePrice.set(key, sessions[index].sessionPricingDetails);
            else
              sessionDateTimePrice.set(key, vm.productDetails.productPricingOptions);
        }
        if (isSavingRequired) {
          var sessionPricingObject = {};
          var duration;
          var startDate = new Date(sessions[index].sessionDepartureDetails.startDate);
          var endDate = new Date(sessions[index].sessionDepartureDetails.startDate);
          if (vm.productDetails.productDurationType == 'Days')
            duration = vm.productDetails.productDuration;
          else
            duration = 1;
          endDate =  new Date(endDate.setDate(endDate.getDate() + duration - 1));
          sessionPricingObject['fromDay'] = weekdays[startDate.getDay()];
          sessionPricingObject['toDay'] = weekdays[endDate.getDay()];
          sessionPricingObject['startDate'] = startDate.getDate() + ' ' + months[startDate.getMonth()] + ' ' + startDate.getFullYear();
          sessionPricingObject['endDate'] = endDate.getDate() + ' ' + months[endDate.getMonth()] + ' ' + endDate.getFullYear();
          sessionPricingObject['sessionTimes'] = sessionDates.get(new Date(sessions[index].sessionDepartureDetails.startDate).getTime());
          if (sessions[index].isSessionPricingValid)
            sessionPricingObject['pricing'] = sessions[index].sessionPricingDetails;
          else
            sessionPricingObject['pricing'] = vm.productDetails.productPricingOptions;

          vm.sessionPricing.push(sessionPricingObject);
        }
      }
    }
    var activeIndex = new Map();
    vm.getPricingDetailsOfGivenTimeSlot = function (parentIndex, index, timeslot) {
      var key = new Date(vm.sessionsOfThisProduct[parentIndex].sessionDepartureDetails.startDate).getTime().toString() + timeslot.toString();
      key = key.replace(/\s/g,'');
      vm.sessionPricing[parentIndex].pricing = sessionDateTimePrice.get(key);
      if (!activeIndex.has(parentIndex))
        $("#timeslotValue" + parentIndex + '0').removeClass("timeslotValueActive0");
      else
        $("#timeslotValue" + parentIndex + activeIndex.get(parentIndex)).removeClass("timeslotValueActive0");

      console.log("#timeslotValue" + parentIndex + index);
      $("#timeslotValue" + parentIndex + index).addClass("timeslotValueActive0");
      activeIndex.set(parentIndex, index);
    }

    vm.getHtmlTrustedData = function(htmlData){
      return $sce.trustAsHtml(htmlData);
    };

    vm.getMinimumPricing = function (productDetails) {
      if (productDetails)
        return findMinimum(productDetails);
      else {
        vm.priceTobeShown = '';
        return '';
      }
    }

    vm.getDynamicCSSForBorderIssue = function (index) {
      var cssObject = {
        "border-bottom": "none"
      };
      if (vm.sessionPricing.length > 5 && index == 4 || vm.sessionPricing.length <=5 && index == vm.sessionPricing.length -1 || index == 'noBorder')
        return cssObject;
    }

    function findMinimum (productDetails) {
      vm.minimumTillNow = Number.POSITIVE_INFINITY;
      vm.priceTobeShown = -1;
      
      for (var index = 0; index < productDetails.productPricingOptions.length; index ++) {
        if (productDetails.productPricingOptions[index].price < vm.minimumTillNow)
          vm.minimumTillNow =  productDetails.productPricingOptions[index].price;
        
        if (productDetails.productPricingOptions[index].pricingType == 'Everyone' || productDetails.productPricingOptions[index].pricingType == 'Adult')
          vm.priceTobeShown = productDetails.productPricingOptions[index].price;
      }
      
      if (vm.minimumTillNow == 'Infinity')
        vm.minimumTillNow = '';
      if (vm.priceTobeShown == -1)
        vm.priceTobeShown = vm.minimumTillNow;

      if(productDetails.productAdvertisedprice !== undefined)
        return vm.productDetails.productAdvertisedprice;
      else
        return vm.minimumTillNow;      
    }

    vm.getDepartureDates = function (isoDate) {
      var date = new Date (isoDate);
      // date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
      var displayDate = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();

      return displayDate;
    }

    vm.getDynamicCSSForStripedTable = function (index) {
      var oddCSS = {
        "background-color" : "#fff",
      };
      var evenCSS = {
        "background-color" : "#eee",
      };
      if (index % 2 == 1)
        return oddCSS;
      else
        return evenCSS;
    }

    vm.setMarginDynamically = function () {
      if ($window.innerWidth <= 767) {
        var cssObject = {
          "margin-left": "0%",
          "margin-right": "3%"
        }
        return cssObject;
      } else {
        var cssObject = {
          "margin-left": "15%",
          "margin-right": "15%"
        }
        return cssObject;
      }
    }

    vm.getLoaderPositionForTourDetails = function () {
      var leftMargin = ($window.innerWidth - 34.297) / 2;
      var topMargin = ($window.innerHeight - 40) / 2;
      var cssObject = {
        "left" : leftMargin,
        "top" : topMargin,
        "color": '#ff9800'
      }
      return cssObject;
    }

    vm.goToBookingPage = function () {
      $('#bookTheTour').attr("data-target", '#askForLogin');
      // ui-sref="guest.booking({productId: vm.productDetails._id})" 
    }

    vm.getInquiryHours = function () {
      if (vm.companyData) {
        if (vm.companyData.inquiryTime == 'Anytime')
          return '(24 hours)';
        else
          return vm.companyData.inquiryTimeRangeFrom + ' to ' + vm.companyData.inquiryTimeRangeTo;
      }
    }

    vm.goTobookingPageOfThisProduct = function () {
      if($location.search().via == 'bookButton')
        $state.go('guest.booking', {productId: vm.productDetails._id, via: 'bookButton'});
      else
        $state.go('guest.booking', {productId: vm.productDetails._id});
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
  }
}());
