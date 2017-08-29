(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('BookButtonController', BookButtonController);

  BookButtonController.$inject = ['$state', '$scope', '$window', '$http'];

  function BookButtonController($state, $scope, $window, $http) {
    var vm = this;
    $scope.hostToursiteName = '';

    vm.generateBookButtonForSpecificTour = function () {
      if (vm.tourSelected) {
        var dynamicallyAddedAttribute = '';
        var linkURL = "https://" + $scope.hostToursiteName + ".tourgecko.com/tour/book/" + vm.tourSelected;
        var bookButtonLabel = '';
        if (!$scope.bookButtonLabelName)
          bookButtonLabel = 'Book Now';
        else
          bookButtonLabel = $scope.bookButtonLabelName;
        var bookButtonColor = $('.jscolor').val();
       dynamicallyAddedAttribute = dynamicallyAddedAttribute + 
                                  '\ts1.setAttribute("linkURL", ' +
                                  ' "' + linkURL.toString() +'");\n' +
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

    vm.generateBookButtonToursite = function () {
      vm.bookButtonForSpecificTour = false;
      var dynamicallyAddedAttribute = ' ';
      var linkURL = "https://" + $scope.hostToursiteName + ".tourgecko.com/tours";
      var bookButtonLabel = '';
      if (!$scope.bookButtonLabelName)
        bookButtonLabel = 'Browse Tours';
      else
        bookButtonLabel = $scope.bookButtonLabelName;
      var bookButtonColor = $('.jscolor').val();
      dynamicallyAddedAttribute = dynamicallyAddedAttribute + 
                                  '\ts1.setAttribute("linkURL", ' +
                                  ' "' + linkURL.toString() +'");\n' +
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
}());
