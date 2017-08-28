(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('BookButtonController', BookButtonController);

  BookButtonController.$inject = ['$state', '$scope', '$window', '$http'];

  function BookButtonController($state, $scope, $window, $http) {
    var vm = this;
    $scope.hostToursiteName = '';
    vm.bookingButtonCSS = 'https://tourgecko.com/lib/book-button/css/bookButton.css';
    vm.bookingButtonJS = 'https://tourgecko.com/lib/book-button/js/bookButton.js'
    vm.bookingButtonJquery = "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js";
    vm.generateBookButtonForSpecificTour = function () {
      if (vm.tourSelected) {
        var div = document.createElement('div');
        $(div).addClass("tourgeckoSpecificTourBookButton");
        $(div).css("background-color", $('.jscolor').val());
        var anchorTag = document.createElement('a');
        $(anchorTag).attr("type", "button")
        $(anchorTag).addClass('btn');
        $(anchorTag).addClass('btn-primary');
        $(anchorTag).attr("href", "https://" + $scope.hostToursiteName + '.tourgecko.com/tour/book/' + vm.tourSelected);
        if (!$scope.bookButtonLabelName)
          anchorTag.innerHTML = 'Book Now';
        else
          anchorTag.innerHTML = $scope.bookButtonLabelName;
        $(div).append(anchorTag);
        vm.bookButtonContent = div.outerHTML;
        $('#book-button-copy-content-trigger').click();
      }
    }

    vm.generateBookButtonToursite = function () {
      vm.bookButtonForSpecificTour = false;
      var div = document.createElement('div');
      $(div).addClass("tourgeckoToursiteBookButton");
      $(div).css("background-color", $('.jscolor').val());
      var anchorTag = document.createElement('a');
      $(anchorTag).attr("type", "button")
      $(anchorTag).addClass('btn');
      $(anchorTag).addClass('btn-primary');
      $(anchorTag).attr("href", "https://" + $scope.hostToursiteName + '.tourgecko.com/tours');
      if (!$scope.bookButtonLabelName)
        anchorTag.innerHTML = 'Browse Tours';
      else
        anchorTag.innerHTML = $scope.bookButtonLabelName;
      $(div).append(anchorTag);
      vm.bookButtonContent = div.outerHTML;
      $('#book-button-copy-content-trigger').click();
    }
  }
}());
