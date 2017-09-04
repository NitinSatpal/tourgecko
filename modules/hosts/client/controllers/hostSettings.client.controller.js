(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('HostSettingsController', HostSettingsController)
    .constant('paymentSettingcErrorContentData', {
      "bankBenificieryName" : "Please enter your name registered with bank account",
      "bankIFSCCode" : "Please enter IFSC code of your bank",
      "bankAccountNumber" : "Please enter your bank account number",
      "bankAccountNumberConfirmed" : "Please re-enter your bank account number",
      "pan_number": "Please enter the Permanent account number"
    });

  HostSettingsController.$inject = ['$scope', '$state', '$http', '$timeout', '$window', '$location', 'Authentication', 'HostCompanyService', 'LanguageService', 'SpecificUserService', 'Upload', 'paymentSettingcErrorContentData'];

  function HostSettingsController($scope, $state, $http, $timeout, $window,$location, Authentication, HostCompanyService, LanguageService, SpecificUserService, Upload, paymentSettingcErrorContentData) {
    var vm = this;
    vm.user = Authentication.user;
    vm.authentication = Authentication;
    vm.showErrorsPaymentSettings = false;
    vm.showSuccessPaymentSettings= false;
    vm.paymentActivated = false;
    
    $http.get('/api/host/company/').success(function (response)  {
      vm.companyDetails = response;
      if ($location.path() == '/host/settings/companyprofile')
        CKEDITOR.instances.about_business.setData(vm.companyDetails[0].aboutHost);
      vm.noLogoPresent = !vm.companyDetails[0].isLogoPresent;
      if (vm.companyDetails[0].isLogoPresent) {
        $("#noLogoPresent").css("display", "none");
        $("#hostLogoContainer").css("display", "block");
      }
      else {
        $("#noLogoPresent").css("display", "block");
        $("#hostLogoContainer").css("display", "none");
      }
      vm.contactDetails = vm.companyDetails;
      vm.noSocialCheck = !vm.companyDetails[0].areSocialAccountsPresent;
      vm.paymentDetails = vm.companyDetails;
      if(vm.paymentDetails[0].paymentActivated) {
        vm.paymentActivated = true;
        $(".activated").removeClass("inactive");
        $('.bank-account-details').find('input, textarea, select').attr('readonly', 'readonly');
      }
      vm.toursiteDetails = vm.companyDetails;
      if (vm.toursiteDetails[0].themeColor)
        $('.jscolor').val(vm.toursiteDetails[0].themeColor);
      else
        $('.jscolor').val('#FF9800');
      jscolor.installByClassName("jscolor");
      vm.accountDetails = vm.companyDetails;
      vm.regionalDetails = vm.companyDetails;
    });

    
    vm.userDetails = SpecificUserService.query();
    
    vm.languagesSupported = LanguageService.query();
    vm.languages = vm.languagesSupported.supportedLanguages;
    vm.beneficiaryBankCountry = 'India';
    vm.preferredCurrency = 'INR';
    $scope.regExForMobileValidity = '^[1-9][0-9]{9}$';
      
    vm.passwordRelatedError= '';
    var initializing = true;
    var isPasswordDetailsChanged = false;
    var imageUploaded = false;
    $('#loadingDivHostSide').css('display', 'none');
    $('#tourgeckoBody').removeClass('waitCursor');
    
    /* We can watch each and every value and can check whether the value is in changed state at the time of 'Save' button is clicked
      e.g. if field 'How do you describe yourself?' is by default 'Tour Operator' and use is changing it to 'Activity Provider'
      and again user changed it to 'Tour Operator'. And there is no other change user has done, then ideally the state is not changed
      and we can avoid calling rest api to do the POST request. But this concept is deep diving in $watch and it can degrade the
      performance. So, even if user changes something and later make it the same, we will assume it's changed and call the rest api
      POST method. As that will be much better than checking each value.
    */
    // Company Profile settings
    vm.saveCompanyProfileSettings = function () {
      vm.error = null;
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      if(vm.noLogoPresent)
        vm.companyDetails[0].logoURL = $(".company_logo .img_info img").attr("src");
      else
        vm.companyDetails[0].logoURL = $("#hostLogoContainer .company_logo .img_info img").attr("src");
      
      vm.companyDetails[0].aboutHost = CKEDITOR.instances.about_business.getData();
      
      $http.post('/api/host/company', vm.companyDetails).success(function (response) {
          $window.location.reload();
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
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


    vm.socialPresence = function () {
      vm.contactDetails[0].areSocialAccountsPresent = !vm.contactDetails[0].areSocialAccountsPresent;
    }

    // Contact settings
    vm.saveContactSettings = function (isValid) {
      vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.contactForm');
        return false;
      }

      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
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
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    };

    // Payment Settings
    vm.paymentBankAccError = [];
    vm.savePaymentSettings = function (isValid) {
      vm.error = null;
      vm.paymentBankAccError.length = 0;
      if (!isValid) {
        vm.showErrorsPaymentSettings = true;
        vm.showSuccessPaymentSettings = false;
        $scope.$broadcast('show-errors-check-validity', 'vm.form.paymentSettingForm');
        if(vm.form.paymentSettingForm.host_name_on_bank_acc.$error.required)
          vm.paymentBankAccError.push(paymentSettingcErrorContentData['bankBenificieryName']);
        if(vm.form.paymentSettingForm.bank_ifsc_code.$error.required)          
          vm.paymentBankAccError.push(paymentSettingcErrorContentData['bankIFSCCode']);
        if(vm.form.paymentSettingForm.bank_acc_number.$error.required)
          vm.paymentBankAccError.push(paymentSettingcErrorContentData['bankAccountNumber']);
        if(vm.form.paymentSettingForm.bank_acc_number_confirm.$error.required)
          vm.paymentBankAccError.push(paymentSettingcErrorContentData['bankAccountNumberConfirmed']);
        if(vm.form.paymentSettingForm.pan_number.$error.required)
          vm.paymentBankAccError.push(paymentSettingcErrorContentData['pan_number']);
        return false;
      }
      if (vm.paymentDetails[0].hostBankAccountDetails && vm.paymentDetails[0].hostBankAccountDetails.beneficiaryAccNumber != vm.paymentDetails[0].hostBankAccountDetails.beneficiaryAccNumberConfirmed) {
        vm.showErrorsPaymentSettings = true;
        vm.showSuccessPaymentSettings = false;
        vm.paymentBankAccError.push('Account number does not match');
        return false;
      }
      vm.paymentAccountDetails = {otherAccDetails: vm.paymentDetails, accCountryDetails: vm.beneficiaryBankCountry}
      
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      $http.post('/api/host/payment', vm.paymentAccountDetails).success(function (response) {
        if (response.status == 'failure') {
          vm.paymentBankAccError = response.messages;
          vm.showErrorsPaymentSettings = true;
          vm.showSuccessPaymentSettings = false;
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        } else {
          vm.paymentActivated = true;
          $(".activated").removeClass("inactive");
          vm.showSuccessPaymentSettings = true;
          vm.showErrorsPaymentSettings = false;
          //$window.location.reload();
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        }
        $('html, body').animate({scrollTop : 0},800);
      }).error(function (response) {
        vm.showErrorsPaymentSettings = true;
        vm.showSuccessPaymentSettings = false;
        vm.paymentBankAccError = response.messages;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
        $('html, body').animate({scrollTop : 0},800);
      });
    }

    vm.saveCanBeEditedPaymentSettings = function () {
      vm.error = null;
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      $http.post('/api/host/canBeEditedPayment', vm.paymentDetails).success(function (response) {
        if (response.status == 'failure') {
          vm.paymentBankAccError = response.messages;
          vm.showErrorsPaymentSettings = true;
          vm.showSuccessCanBeEditedPaymentSettings = false;
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        } else {
          vm.showSuccessCanBeEditedPaymentSettings = true;
          vm.showErrorsPaymentSettings = false;
          $('#loadingDivHostSide').css('display', 'none');
          $('#tourgeckoBody').removeClass('waitCursor');
        }
      }).error(function (response) {
        vm.showErrorsPaymentSettings = true;
        vm.showSuccessCanBeEditedPaymentSettings = false;
        vm.paymentBankAccError = response.messages;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }

    // Toursite settings
    vm.saveToursiteDomainSettings = function () {
      vm.error = null;
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      $http.post('/api/host/toursite', vm.toursiteDetails).success(function (response) {
        $window.location.reload();
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    };

    vm.saveToursiteThemeSettings = function () {
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      var themeColor = {themeColor: '#' + $('.jscolor').val()};
      $http.post('/api/host/toursite/theme', themeColor).success(function (response) {
        $window.location.reload();
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }
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
      $('#loadingDivHostSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      $http.post('/api/host/region', vm.regionalDetails).success(function (response) {
        $window.location.reload();
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivHostSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    };

    vm.getLastLoginToDisplay = function (date) {
      var tempDate = date.split(' ');
      var dateToReturn = '';
      for (var index = 0; index < tempDate.length - 1; index++)
        dateToReturn = dateToReturn + ' ' + tempDate[index];
      
      return dateToReturn;
    }

    vm.showNoLogoContainer = function (isLogoAbsent) {
      if (isLogoAbsent) {
        $("#noLogoPresent").css("display", "block");
        $("#hostLogoContainer").css("display", "none");
      } else{
        $("#noLogoPresent").css("display", "none");
        $("#hostLogoContainer").css("display", "block");
      }
    }

    $scope.changeLogoStatus = function () {
      vm.noLogoPresent = false;
      $scope.$apply();
    }

    /* This is the dirty way. From banner uploader callback, if I am trying to display the messages, nothing is visible.
     * The reason is digest cycle. I have to manually trigger $scope.$apply. Hence I am calling this function from
     * fineuploader onError callback, and applying digest cycle manually. Even in this case, the best approach was to
     * call this function once all file uploads are done, so that we can start digest cycle for everything together.
     * But onAllcomplete callback of fineuploader is not working the way it should work. It's not getting called, if all
     * the images upladed are failed. In that case, no error will be shown. Hence, we are calling this function for each
     * image. Maximum five times (banner upload maximum file limit is 5). For this reason, I have to set both
     * vm.singleBannereUploadError and vm.multipleBannerUploadError everytime, else both singular and plural message will be shown
    */
    $scope.bannerUploadErrorContent = [];
    $scope.showBannerUploadErrors = function (error) {
      $scope.bannerUploadErrorContent.push(error);
      $scope.showBannerUploadErrorsBlock = true;
      if ($scope.bannerUploadErrorContent.length == 1) {
        vm.singleBannereUploadError = true;
        vm.multipleBannerUploadError = false;
      }  else {
        vm.singleBannereUploadError = false;
        vm.multipleBannerUploadError = true;
      }
      $scope.$apply();
    }
    vm.initializeBannerUploadErrorContent = function () {
      $scope.showBannerUploadErrorsBlock = false;
    }
    
    vm.saveToursiteBannersSettings = function () {
      $state.reload();
    }
  }
}());
