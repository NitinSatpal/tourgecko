(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('ContactUsController', ContactUsController);

  ContactUsController.$inject = ['$scope', '$state', '$stateParams', '$http' , '$window', '$location', 'toasty'];

  function ContactUsController($scope, $state, $stateParams, $http, $window, $location, toasty) {
    var vm = this;
    var toursite = $stateParams.toursite;
    if (toursite == null)
      toursite = $location.host().split('.')[0];
    $http.get('/api/host/toursitedata/' + toursite).success(function (response) {
        vm.toursitedata = response.productArray;
        vm.companyData = response.companyData;
        $scope.hostAddress =  vm.companyData.hostCompanyAddress.streetAddress.toString() + '+' + vm.companyData.hostCompanyAddress.city .toString()
                         + '+' + vm.companyData.hostCompanyAddress.state.toString() + '+' + vm.companyData.hostCompanyAddress.country.toString();
        //$('#hostPinnedAddressMap').attr('src', '//www.google.com/maps/embed/v1/place?q='+ hostAddress +'&zoom=17&key=AIzaSyC8QX0vYZ8GdosLz3mHlHHuwyOYVqz5TxI');
        if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.facebook && vm.companyData.hostSocialAccounts.facebook != "")
          vm.facebookLink = 'https://www.facebook.com/' + vm.companyData.hostSocialAccounts.facebook;
        if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.twitter && vm.companyData.hostSocialAccounts.twitter != "")
          vm.twitterLink = 'https://www.twitter.com/' + vm.companyData.hostSocialAccounts.twitter;
        if (vm.companyData.hostSocialAccounts && vm.companyData.hostSocialAccounts.instagram && vm.companyData.hostSocialAccounts.instagram != "")
          vm.instagramLink = 'https://www.instagram.com/' + vm.companyData.hostSocialAccounts.instagram;
        if (response.productArray.length > 0)
          vm.userData = response.productArray[0].user;
    }).error(function (response) {
      vm.error = response.message;
    });

    vm.getInquiryHours = function () {
      if (vm.companyData) {
        if (vm.companyData.inquiryTime == 'Anytime')
          return '(24 hours)';
        else
          return '(' + vm.companyData.inquiryTimeRangeFrom + ' ' + vm.companyData.inquiryTimeRangeTo + ')';
      }
    }

    vm.getDynamicCSSForToursiteNav = function () {
      if(window.innerWidth > 767)
        return 'nav-toursite';
    }

    vm.getDynamicLeftMarginForCompanyLogo = function () {
      var leftMargin = ($window.innerWidth - 70) / 2 - 60 -15;
      var cssObject = {
        "margin-left" : leftMargin
      }
      if(window.innerWidth <= 767)
        return cssObject;
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

    vm.sendContentToHost = function (isValid) {
      /*vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.contentToHostForm');
        return false;
      }*/
      $('#loadingDivToursite').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      var communicationParams = {guestDetails: vm.contentToHost, hostMail: vm.companyData.inquiryEmail}
      $http.post('/api/host/sendContentToHostFromContactUs/', communicationParams).success(function (response) {
        // mail sent successfully
        $('#loadingDivToursite').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
        toasty.success({
          title: 'Message sent!',
          msg: 'Your message has been sent!',
          sound: false
        });
        vm.contentToHost = {};
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivToursite').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
        toasty.error({
          title: 'Something went wrong!',
          msg: 'Mail could not be send. Please contact Tourgecko!',
          sound: false
        });
      });
    }

    vm.getHostAddressToPinOnMap = function () {
      return '//www.google.com/maps/embed/v1/place?q=Harrods,Brompton%20Rd,%20UK&zoom=17&key=AIzaSyC8QX0vYZ8GdosLz3mHlHHuwyOYVqz5TxI';
    }
  }
}());
