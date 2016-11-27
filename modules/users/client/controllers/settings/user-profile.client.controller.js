(function () {
  'use strict';

  angular
    .module('users')
    .controller('UserProdileController', UserProdileController);

  UserProdileController.$inject = ['$scope', '$state', '$http', '$timeout', '$window', 'Authentication', 'SpecificUserService'];

  function UserProdileController($scope, $state, $http, $timeout, $window, Authentication, SpecificUserService) {
    var vm = this;
    vm.user = Authentication.user;
    vm.authentication = Authentication;

    vm.userDetails = SpecificUserService.query();
      
    vm.passwordRelatedError= '';
    var initializing = true
    var isUserDetailsChanged = false;
    var isPasswordDetailsChanged = false;
    
    
    /* We can watch each and every value and can check whether the value is in changed state at the time of 'Save' button is clicked
      e.g. if field 'How do you describe yourself?' is by default 'Tour Operator' and use is changing it to 'Activity Provider'
      and again user changed it to 'Tour Operator'. And there is no other change user has done, then ideally the state is not changed
      and we can avoid calling rest api to do the POST request. But this concept is deep diving in $watch and it can degrade the
      performance. So, even if user changes something and later make it the same, we will assume it's changed and call the rest api
      POST method. As that will be much better than checking each value.
    */
    $scope.$watch('vm.userDetails', function() {
      if (initializing) {
        $timeout(function() { initializing = false; });
      } else {
        isUserDetailsChanged = true;
      }
    }, true);

    $scope.$watch('vm.passwordDetails', function() {
      if (initializing) {
        $timeout(function() { initializing = false; });
      } else {
        isPasswordDetailsChanged = true;
      }
    }, true);


    // USer profile 
    vm.saveUserSettings = function (isValid) {
      vm.error = null;
      var isErrorPresent = false;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      }

      if (isUserDetailsChanged == true) {
        $http.post('/api/users/profile', vm.userDetails).success(function (response) {

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
    };
  }
}());
