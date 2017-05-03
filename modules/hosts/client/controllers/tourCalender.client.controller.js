(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourCalendarController', TourCalendarController)

  TourCalendarController.$inject = ['$scope', '$window'];

  function TourCalendarController($scope, $window) {
    var vm = this;
    
    $('#tourgeckoBody').removeClass('waitCursor');
  }
}());
