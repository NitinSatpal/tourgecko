(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourCalendarController', TourCalendarController)

  TourCalendarController.$inject = ['$scope', '$window'];

  function TourCalendarController($scope, $window) {
    var vm = this;
    
    $('#loadingDivHostSide').css('display', 'none');
    $('#tourgeckoBody').removeClass('waitCursor');
  }
}());
