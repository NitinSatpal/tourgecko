(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('TourCalendarController', TourCalendarController)

  TourCalendarController.$inject = ['$scope', '$window'];

  function TourCalendarController($scope, $window) {
    var vm = this;
    
    if ($('#calendar').is(':empty')) {
      $('#loaderForCalendarSideNav').show();
    }

    vm.getLoaderPositionForTabCalendar = function () {
      var leftMargin = ($('.home-content').width() - 34.297) / 2;
      var topMargin = ($window.innerHeight - 40) / 3;
      var cssObject = {
        "left" : leftMargin,
        "top" : topMargin,
        "color": '#ff9800'
      }
      return cssObject; 
    }
  }
}());
