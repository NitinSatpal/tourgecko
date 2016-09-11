(function () {
  'use strict';

  angular
    .module('users', [])
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$state', '$stateParams', '$http', '$location', '$window', 'Authentication', 'PasswordValidator'];

  function AuthenticationController($scope, $state, $stateParams, $http, $location, $window, Authentication, PasswordValidator) {
    var vm = this;

    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.signupDetails = signupDetails;
    vm.callOauthProvider = callOauthProvider;
    vm.terms = false;

    // For now allowing all the numbers starting from 1 and just checking 10 digits for Indian mobile numbers. We can become more
    // strcit and just allow number starting from 7, 8, 9 as in India number series starts only from these numbers.
    $scope.regEx = '^[1-9][0-9]{9}$';

    // Get an eventual error defined in the URL query string:
    vm.error = $location.search().err;

    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      // $location.path('/');
    }

    // Signup function
    function signup(isValid) {
      vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      } else if (vm.terms === false) {
        alert('Please read and agree to terms and conditions');
        return false;
      }

      $http.post('/api/auth/signup', vm.credentials).success(function (response) {
        // And redirect to the Details page with the id of the user
        console.log('kaka hai kya tu ' + response._id);
        $state.go('hostDetails.details', { id: response._id });
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    // Signup step 2 or more details
    function signupDetails(isValid) {
      vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userDetailsForm');
        return false;
      }
      var detailsInfo = { 'detailsObj': vm.credentialsDetails, 'userId': $stateParams };
      $http.post('/api/auth/signupDetails', detailsInfo).success(function (response) {
        // And redirect to the Signup Done page
        $state.go('hostDetails.signupDone');
      }).error(function (response) {
        vm.error = response.message;
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

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
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
