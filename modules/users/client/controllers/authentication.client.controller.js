(function () {
  'use strict';

  angular
    .module('users', [])
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$state', '$stateParams', '$http', '$location', '$window', '$timeout', 'Authentication', 'PasswordValidator'];

  function AuthenticationController($scope, $state, $stateParams, $http, $location, $window, $timeout, Authentication, PasswordValidator) {
    var vm = this;

    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.signupDetails = signupDetails;
    vm.resendActivationEmail = resendActivationEmail;
    vm.callOauthProvider = callOauthProvider;
    vm.terms = false;
    vm.hostType = 'Tour Operator';
    vm.country = 'India';
    vm.toursite = '';
    // For now allowing all the numbers starting from 1 and just checking 10 digits for Indian mobile numbers. We can become more
    // strcit and just allow number starting from 7, 8, 9 as in India number series starts only from these numbers.
    $scope.regExForMobileValidity = '^[1-9][0-9]{9}$';
    // Maximum number of digits in this world is currenlty 10 it seems.
    $scope.regExForPostalCode = '^[0-9]{1,10}$';
    // City name and state name will be consisting of alphabets only. Assumption for now.
    // One more assumption is no city or state name will be greater than 50 alphabets.
    $scope.regExForStateAndCity = '^[a-z | A-Z]{1,50}$';
    // Get an eventual error defined in the URL query string:
    vm.error = $location.search().err;

    // If user is signed in then redirect back home
    if (vm.authentication.user &&  vm.authentication.user.roles[0] == 'hostAdmin') {
      $location.path('/host/admin');
    } else if (vm.authentication.user &&  vm.authentication.user.roles[0] == 'user') {
      $location.path('/guest/home');
    } else if (vm.authentication.user &&  vm.authentication.user.roles[0] == 'admin') {
      $location.path('/admin/home');
    }

    // Signup function
    function signup(isValid, ishostSignup) {
      vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      } else if (vm.terms === false) {
        alert('Please read and agree to terms and conditions');
        return false;
      }
      vm.signupDateStore = {signupData: vm.credentials, toursite: vm.toursite, isHost: ishostSignup}
      $window.localStorage.setItem('signingupUserEmail', vm.credentials.email);
      $('#loadingDivAuthenticationSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      $http.post('/api/auth/signup', vm.signupDateStore).success(function (response) {
        // And redirect to the Details page with the id of the user
        if (response.company)
          $state.go('hostDetails.details', { id: response._id});
        else
          $state.go('authentication.guestSignupDone');
        $('#loadingDivAuthenticationSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivAuthenticationSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }

    // Signup step 2 or more details
    function signupDetails(isValid) {
      vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userDetailsForm');
        return false;
      }
      var detailsInfo = { 'detailsObj': vm.credentialsDetails, 'userId': $stateParams.id };
      $('#loadingDivAuthenticationSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      $http.post('/api/auth/signupDetails', detailsInfo).success(function (response) {
        $state.go('hostDetails.signupDone');
        $('#loadingDivAuthenticationSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivAuthenticationSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }

    vm.userEmail = $window.localStorage.getItem('signingupUserEmail');
    vm.showErrorMsgOnTop = false;
    vm.showSuccessMsgOnTop = false;
    vm.errorMsgs = [];
    vm.successMsgs = [];
    function resendActivationEmail () {
      $('#loadingDivAuthenticationSide').css('display', 'block');
      $('#tourgeckoBody').addClass('waitCursor');
      $http.post('/api/auth/resendverificationemail', {email: vm.userEmail}).success(function (response) {
        vm.successMsgs.length = 0;
        vm.errorMsgs.length = 0;
        console.log(vm.authentication.user);
        console.log(vm.authentication);
        if (response == 'User Already Activated') {
          vm.successMsgs.push('The user with email emailId is already activated. Redirecting...');
          vm.showSuccessMsgOnTop = true;
          $timeout(function() {
            $state.go('host.hostHome')
          }, 2000);
        } else if (response == 'failure') {
          vm.errorMsgs.push('There is some error. Please contact tourgecko support.');
          vm.showErrorMsgOnTop = true;
        } else {          
          vm.successMsgs.push('Email has been sent successfully at ' + vm.userEmail);
          vm.showSuccessMsgOnTop = true;
        }
        $('#loadingDivAuthenticationSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      }).error(function (response) {
        vm.error = response.message;
        $('#loadingDivAuthenticationSide').css('display', 'none');
        $('#tourgeckoBody').removeClass('waitCursor');
      });
    }
    // Signin function
    function signin(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }
      $http.post('/api/auth/signin', vm.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        vm.authentication.user = response;
        // And redirect to the host home page
        if (vm.authentication.user.roles[0] === 'hostAdmin') {
          if ($state.previous.state.name != 'abstractHome.home')
            $state.go($state.previous.state.name || 'host.hostHome');
          else
            $state.go('host.hostHome');
        } else  if (vm.authentication.user.roles[0] === 'user')
          $state.go($state.previous.state.name || 'guest.guestHome');
        else  if (vm.authentication.user.roles[0] === 'admin')
          $state.go($state.previous.state.name || 'admin.home', $state.previous.params);
        else
          console.log('something is wrong');
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    // OAuth provider request
    function callOauthProvider(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }
  }
}());
