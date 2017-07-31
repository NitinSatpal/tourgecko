(function () {
  'use strict';

  angular
    .module('users')
    .controller('UserProfileController', UserProfileController);

  UserProfileController.$inject = ['$scope', '$state', '$http', '$timeout', '$window', 'Authentication', 'Upload', 'SpecificUserService'];

  function UserProfileController($scope, $state, $http, $timeout, $window, Authentication, Upload, SpecificUserService) {
    var vm = this;
    vm.user = Authentication.user;
    vm.authentication = Authentication;

    vm.userDetails = SpecificUserService.query(function (data) {
      $('#loadingDivHostSide').css('display', 'none');
      $('#tourgeckoBody').removeClass('waitCursor');
    }, function (error) {
      $('#loadingDivHostSide').css('display', 'none');
      $('#tourgeckoBody').removeClass('waitCursor');
    });
      
    vm.passwordRelatedError= '';
    var initializing = true
    var isUserDetailsChanged = false;
    var isPasswordDetailsChanged = false;
    var imageUploaded = false;
    
    
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
      $('#loadingDivUserSettingSide').css('display', 'block');
      document.body.style.cursor='wait';
      if (isUserDetailsChanged == true) {
        $http.post('/api/users/profile', vm.userDetails).success(function (response) {
          $window.location.reload();
        }).error(function (response) {
          vm.error = response.message;
          $('#loadingDivUserSettingSide').css('display', 'none');
          document.body.style.cursor='default';
        });
      } else if (imageUploaded == true) {
        $window.location.reload();
      } else {
        $window.location.reload();
        $('#loadingDivUserSettingSide').css('display', 'none');
        document.body.style.cursor='default';
      }

      if (isPasswordDetailsChanged == true) {
        $('#loadingDivUserSettingSide').css('display', 'block');
        document.body.style.cursor='wait';
        $http.post('/api/users/password', vm.passwordDetails).success(function (response) {
          // If successful show success message and clear form
          vm.success = true;
          vm.passwordDetails = null;
          $window.location.reload();
        }).error(function (response) {
          vm.showPasswordRelatedError = response.message;
          vm.error = response.message;
          $('#loadingDivUserSettingSide').css('display', 'none');
          document.body.style.cursor='default';
        });
      }
    };


    vm.upload = function (dataUrl, name) {
      $('#loadingDivUserSettingSide').css('display', 'block');
      document.body.style.cursor='wait';
      vm.success = vm.error = null;
      imageUploaded = true;
      Upload.upload({
        url: 'api/users/picture',
        data: {
          newProfilePicture: Upload.dataUrltoBlob(dataUrl, name)
        }
      }).then(function (response) {
        $timeout(function () {
          onSuccessItem(response.data);
        });
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      }, function (evt) {
        vm.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      });
    };

    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(response) {
      // Show success message
      vm.success = true;

      // Populate user object
      vm.user = Authentication.user = response;

      // Reset form
      vm.profilePicSelected = false;
      vm.progress = 0;
      $('#loadingDivUserSettingSide').css('display', 'none');
      document.body.style.cursor='default';
    }

    // Called after the user has failed to uploaded a new picture
    function onErrorItem(response) {
      vm.profilePicSelected = false;

      // Show error message
      vm.error = response.message;
      $('#loadingDivUserSettingSide').css('display', 'none');
      document.body.style.cursor='defaultd';
    }
  }
}());
