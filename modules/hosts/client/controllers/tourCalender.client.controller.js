(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourCalendarController', TourCalendarController)

  TourCalendarController.$inject = ['$scope'];

  function TourCalendarController($scope) {
    var vm = this;
    
    if ($('#calendar').is(':empty')) {
      $('#loaderForCalendarSideNav').show();
    }
  }
}());
