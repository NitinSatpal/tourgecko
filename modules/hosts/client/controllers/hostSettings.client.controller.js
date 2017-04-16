(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('HostSettingsController', HostSettingsController);

  HostSettingsController.$inject = ['$scope', '$state', '$http', '$timeout', '$window', 'Authentication', 'HostCompanyService', 'LanguageService', 'SpecificUserService', 'Upload'];

  function HostSettingsController($scope, $state, $http, $timeout, $window, Authentication, HostCompanyService, LanguageService, SpecificUserService, Upload) {
    var vm = this;
    vm.user = Authentication.user;
    vm.authentication = Authentication;

    vm.companyDetails = HostCompanyService.query();
    vm.contactDetails = vm.companyDetails;
    vm.paymentDetails = vm.companyDetails;
    vm.toursiteDetails = vm.companyDetails;
    vm.accountDetails = vm.companyDetails;
    vm.userDetails = SpecificUserService.query();
    vm.regionalDetails = vm.companyDetails;

    vm.languagesSupported = LanguageService.query();
    vm.languages = vm.languagesSupported.supportedLanguages;
    vm.beneficiaryBankCountry = 'India';
    vm.preferredCurrency = 'INR';
    $scope.regExForMobileValidity = '^[1-9][0-9]{9}$';
      
    vm.passwordRelatedError= '';
    var initializing = true;
    var isCompanyDetailsChanged = false;
    var isContactDetailsChanged = false;
    var isPaymentDetailsChanged = false;
    var isToursiteDetailsChanged = false;
    var isAccountrDetailsChanged = false;
    var isRegionalDetailsChanged = false;
    var isPasswordDetailsChanged = false;
    var imageUploaded = false;
    
    /* We can watch each and every value and can check whether the value is in changed state at the time of 'Save' button is clicked
      e.g. if field 'How do you describe yourself?' is by default 'Tour Operator' and use is changing it to 'Activity Provider'
      and again user changed it to 'Tour Operator'. And there is no other change user has done, then ideally the state is not changed
      and we can avoid calling rest api to do the POST request. But this concept is deep diving in $watch and it can degrade the
      performance. So, even if user changes something and later make it the same, we will assume it's changed and call the rest api
      POST method. As that will be much better than checking each value.
    */
    $scope.$watch('vm.companyDetails', function() {
      if (initializing) {
        $timeout(function() { initializing = false; });
      } else {
        isCompanyDetailsChanged = true;
      }
    }, true);

    $scope.$watch('vm.contactDetails', function() {
      if (initializing) {
        $timeout(function() { initializing = false; });
      } else {
        isContactDetailsChanged = true;
      }
    }, true);

    $scope.$watch('vm.paymentDetails', function() {
      if (initializing) {
        $timeout(function() { initializing = false; });
      } else {
        isPaymentDetailsChanged = true;
      }
    }, true);

    $scope.$watch('vm.toursiteDetails', function() {
      if (initializing) {
        $timeout(function() { initializing = false; });
      } else {
        isToursiteDetailsChanged = true;
      }
    }, true);

    $scope.$watch('vm.regionalDetails', function() {
      if (initializing) {
        $timeout(function() { initializing = false; });
      } else {
        isRegionalDetailsChanged = true;
      }
    }, true);

    // Company Profile settings
    vm.saveCompanyProfileSettings = function () {
      vm.error = null;
      if (!isCompanyDetailsChanged && imageUploaded)
        $window.location.reload();
      else if (isCompanyDetailsChanged == true) {
        $http.post('/api/host/company', vm.companyDetails).success(function (response) {
          $window.location.reload();
        }).error(function (response) {
          vm.error = response.message;
        });
      } else {
        alert('you have not changed anything');
      }
    };

    // Upload company logo
    vm.uploadCompanyLogo = function (dataUrl, name) {
      vm.success = vm.error = null;
      imageUploaded = true;
      Upload.upload({
        url: 'api/host/company/logo',
        data: {
          newLogo: Upload.dataUrltoBlob(dataUrl, name)
        }
      }).then(function (response) {
        $timeout(function () {
          onSuccessItem(response.data);
        });
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      });
    };

    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(response) {
      // Show success message
      vm.success = true;

      // Populate user object
      vm.user = Authentication.user = response;

      // Reset form
      vm.logoPicSelected = false;
      vm.progress = 0;
      $state.reload();
    }

    // Called after the user has failed to uploaded a new picture
    function onErrorItem(response) {
      vm.logoPicSelected = false;

      // Show error message
      vm.error = response.message;
    }




    // Contact settings
    vm.saveContactSettings = function (isValid) {
      vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.contactForm');
        return false;
      }

      if (isContactDetailsChanged == true || (vm.inquiryTime != 'Anytime' && vm.inquiryTime !== undefined)) {
        var fb;
        var tweet;
        var insta;
        if(vm.contactDetails[0].hostSocialAccounts && vm.contactDetails[0].hostSocialAccounts.facebook)
          fb = vm.contactDetails[0].hostSocialAccounts.facebook.split('/')[3];
        if(vm.contactDetails[0].hostSocialAccounts && vm.contactDetails[0].hostSocialAccounts.twitter)
          tweet = vm.contactDetails[0].hostSocialAccounts.twitter.split('/')[3];
        if(vm.contactDetails[0].hostSocialAccounts && vm.contactDetails[0].hostSocialAccounts.instagram)
          insta = vm.contactDetails[0].hostSocialAccounts.instagram.split('/')[3];

        if (fb)
          vm.contactDetails[0].hostSocialAccounts.facebook = fb;
        if (tweet)
          vm.contactDetails[0].hostSocialAccounts.twitter = tweet;
        if (insta)
          vm.contactDetails[0].hostSocialAccounts.instagram = insta;

        $http.post('/api/host/contact', vm.contactDetails).success(function (response) {
          $window.location.reload();

        }).error(function (response) {
          vm.error = response.message;
        });
      } else {
        alert('you have not changed anything');
      }
    };

    // Payment Settings
    vm.savePaymentSettings = function () {
      vm.paymentAccountDetails = {otherAccDetails: vm.paymentDetails, accCountryDetails: vm.beneficiaryBankCountry}
      vm.error = null;
      if (isPaymentDetailsChanged == true || (vm.beneficiaryBankCountry != 'India' && vm.beneficiaryBankCountry !== undefined)) {
        $http.post('/api/host/payment', vm.paymentAccountDetails).success(function (response) {
          $window.location.reload();
        }).error(function (response) {
          vm.error = response.message;
        });
      } else {
        alert('you have not changed anything');
      }
    }

    // Toursite settings
    vm.saveToursiteSettings = function () {
      vm.error = null;
      if (isToursiteDetailsChanged == true) {
        $http.post('/api/host/toursite', vm.toursiteDetails).success(function (response) {
          $window.location.reload();
        }).error(function (response) {
          vm.error = response.message;
        });
      } else {
        alert('you have not changed anything');
      }
    };

    // Account settings
    // For now account modifiction is not present
    /* vm.saveAccountSettings = function (isValid) {
      vm.error = null;
      var isErrorPresent = false;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.accountForm');
        return false;
      }

      if (isUserDetailsChanged == true) {
        $http.post('/api/host/userAccount', vm.userDetails).success(function (response) {

          $window.location.reload();
        }).error(function (response) {
          vm.error = response.message;
        });
      } else {
        if (isPasswordDetailsChanged == false)
          alert('you have not changed anything');
      }

      if (isPasswordDetailsChanged == true) {
        $http.post('/api/users/password', vm.passwordDetails).success(function (response) {
          // If successful show success message and clear form
          vm.success = true;
          vm.passwordDetails = null;
          $window.location.reload();
        }).error(function (response) {
          vm.showPasswordRelatedError = response.message;
          vm.error = response.message;
        });
      }
    }; */

    vm.saveRegionalSettings = function () {
      vm.error = null;
      
      if (isRegionalDetailsChanged == true) {
        $http.post('/api/host/region', vm.regionalDetails).success(function (response) {
          $window.location.reload();
        }).error(function (response) {
          vm.error = response.message;
        });
      } else {
        alert('you have not changed anything');
      }
    };
  }
}());
