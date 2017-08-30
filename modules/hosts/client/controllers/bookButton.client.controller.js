(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('BookButtonController', BookButtonController);

  BookButtonController.$inject = ['$state', '$scope', '$window', '$http'];

  function BookButtonController($state, $scope, $window, $http) {
    var vm = this;
    $scope.hostToursiteName = '';
    $scope.bookButtonLabelName = '';
    vm.bookButtonForSpecificTour = false;
    vm.bookButtonForMultipleTours = false;
    vm.selectedSingleTour;
    vm.selectedMultipleTours = [];
    vm.singleTourSelected = false;
    $scope.redirectTo = 'redirectToTourDetailsPage';

    vm.changePreferenceOfBookButton = function (preference) {
      if (preference == 'single') {
        vm.bookButtonForSpecificTour = true;
        vm.bookButtonForMultipleTours = false;
      } else {
        vm.bookButtonForSpecificTour = false;
        vm.bookButtonForMultipleTours = true;
      }
    }
    vm.createDynamicBookButton = function () {
      if (vm.bookButtonForSpecificTour) {
        var anchorTag = document.createElement('a');
        $(anchorTag).attr("type", "button")
        $(anchorTag).addClass('btn');
        $(anchorTag).addClass('btn-primary');
        $(anchorTag).css('background-color', $('.jscolor').val());
        $(anchorTag).attr("target", "_blank");
        var bookButtonLabel = '';
        if (!$scope.bookButtonLabelName)
          bookButtonLabel = 'Book Now';
        else
          bookButtonLabel = $scope.bookButtonLabelName;
        var redirectURL = ''
        if ($scope.redirectTo == 'redirectToTourDetailsPage')
          redirectURL = 'https://' + $scope.hostToursiteName + '.tourgecko.com/tour/' + vm.selectedSingleTour;
        else
          redirectURL = 'https://' + $scope.hostToursiteName + '.tourgecko.com/tour/book/' + vm.selectedSingleTour;
        $(anchorTag).attr("href", redirectURL);
        anchorTag.innerHTML = bookButtonLabel;
        vm.scriptToEmbed = '<!--Start of tourgecko embed code-->\n' +
                            anchorTag.outerHTML + '\n' +
                            '<!--End of tourgecko embed code-->'
        $('#book-button-copy-content-trigger').click();
      } else {
        var dynamicallyAddedAttribute = ' ';
        var bookButtonLabel = '';
        if (!$scope.bookButtonLabelName)
          bookButtonLabel = 'Browse Tours';
        else
          bookButtonLabel = $scope.bookButtonLabelName;

        var toursiteName = $scope.hostToursiteName;
        toursiteName = toursiteName.toString();
        console.log(toursiteName);
        console.log($scope.hostToursiteName);
        var redirectURL = 'https://' + $scope.hostToursiteName + '.tourgecko.com/integrations/tours';
        var bookButtonColor = $('.jscolor').val();
        dynamicallyAddedAttribute = dynamicallyAddedAttribute +
                                  '\ts1.setAttribute("toursite", ' +
                                  ' "' + toursiteName + '");\n' +
                                  '\ts1.setAttribute("linkURL", ' +
                                  ' "' + redirectURL + '");\n' +
                                  '\ts1.setAttribute("tourIds", ' +
                                  ' "' + vm.selectedMultipleTours +'");\n' +
                                  '\ts1.setAttribute("bookButtonLabel", ' +
                                  ' "' + bookButtonLabel.toString() + '");\n' +
                                  '\ts1.setAttribute("bookButtonColor",' + ' "#' +
                                  bookButtonColor.toString() + '");\n';

        vm.scriptToEmbed = 'window.TG = window.TG || {};\n' +
                            '(function (window, document) {\n' +
                            '\tvar s1 = document.createElement("script")\n' +
                            '\tvar s0 = document.getElementsByTagName("script")[0];\n' +
                            '\ts1.async = true;\n' +
                            '\ts1.src = "https://tourgecko.com/lib/integrations/book-button/bookButton.js";\n' +
                            '\ts1.charset = "UTF-8";\n' +
                            '\ts1.setAttribute("id" , "bookButtonIntegration");\n' +
                            dynamicallyAddedAttribute +
                            '\ts0.parentNode.insertBefore(s1,s0);\n' +
                          '})(window, document);';  

        $('#book-button-copy-content-trigger').click();
      }
    }    
  }
}());
