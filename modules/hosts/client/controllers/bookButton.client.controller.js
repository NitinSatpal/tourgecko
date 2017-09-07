(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('BookButtonController', BookButtonController);

  BookButtonController.$inject = ['$state', '$scope', '$window', '$http', 'toasty'];

  function BookButtonController($state, $scope, $window, $http, toasty) {
    var vm = this;
    $scope.hostToursiteName = '';
    $scope.bookButtonLabelName = '';
    vm.bookButtonForSpecificTour = false;
    vm.bookButtonForMultipleTours = false;
    vm.selectedSingleTour;
    vm.selectedMultipleTours = [];
    vm.singleTourSelected = false;    
    vm.errorContent = [];
    vm.initialColor = "FF9800";
    $scope.redirectTo = 'redirectToTourDetailsPage';

    vm.changePreferenceOfBookButton = function (preference) {
      if (preference == 'single') {
        vm.bookButtonForSpecificTour = true;
        vm.bookButtonForMultipleTours = false;
        if($("#multiTourBookButtonPreview:visible"))
          $("#multiTourBookButtonPreview").hide();
      } else {
        vm.singleTourSelected = false;
        vm.bookButtonForSpecificTour = false;
        vm.bookButtonForMultipleTours = true;
      }
    }
    vm.createDynamicBookButton = function () {
      vm.errorContent.length = 0;
      if (!vm.bookButtonType) {
        $("#showErrorsOnTopForBookButton").show();    
        vm.errorContent.push("Please select option 'Create button for'");
        return false;
      } else {
        if (vm.bookButtonType == 'bookButtonForSpecificTour' && !vm.singleTourSelected) {
          $("#showErrorsOnTopForBookButton").show();    
          vm.errorContent.push("Please select tour for which the button has to be created");
          return false;
        }
      }
      if (vm.bookButtonForSpecificTour) {        
        var anchorTag = document.createElement('a');
        $(anchorTag).attr("type", "button")
        $(anchorTag).addClass('btn');
        $(anchorTag).addClass('btn-primary');
        $(anchorTag).css('background-color', $('.jscolor').val());
        $(anchorTag).css('padding', "12px 38px");
        $(anchorTag).css('color', "#fff");
        $(anchorTag).css('border-radius', "4px");
        $(anchorTag).css('font-family', "Arial, Helvetica, sans-serif");
        $(anchorTag).css('font-weight', "400");
        $(anchorTag).css('font-style', "normal");
        $(anchorTag).css('font-size', "18px");
        $(anchorTag).css('text-decoration', "none");
        $(anchorTag).attr("target", "_blank");
        var bookButtonLabel = '';
        if (!$scope.bookButtonLabelName)
          bookButtonLabel = 'Book Now';
        else
          bookButtonLabel = $scope.bookButtonLabelName;
        var redirectURL = ''
        if ($scope.redirectTo == 'redirectToTourDetailsPage')
          redirectURL = 'https://' + $scope.hostToursiteName + '.tourgecko.com/integrations/tour/' + vm.selectedSingleTour;
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
        var redirectURL = 'https://' + $scope.hostToursiteName + '.tourgecko.com/integrations/tours';
        var bookButtonColor = $('.jscolor').val();
        dynamicallyAddedAttribute = dynamicallyAddedAttribute +
                                  '\ts1.setAttribute("bookButtonLabel", ' +
                                  ' "' + bookButtonLabel.toString() + '");\n' +
                                  '\ts1.setAttribute("bookButtonColor",' + ' "#' +
                                  bookButtonColor.toString() + '");\n';

        vm.scriptToEmbed =  '<!--Start of tourgecko embed code-->\n' + 
                            '<script>\n' +
                            'window.TG = window.TG || {};\n' +
                            '(function (window, document) {\n' +
                            '\tvar s1 = document.createElement("script")\n' +
                            '\tvar s0 = document.getElementsByTagName("script")[0];\n' +
                            '\ts1.async = true;\n' +
                            '\ts1.src = "https://tourgecko.com/lib/integrations/book-button/bookButton.js";\n' +
                            '\ts1.charset = "UTF-8";\n' +
                            '\ts1.setAttribute("id" , "bookButtonIntegration");\n' +
                            dynamicallyAddedAttribute +
                            '\ts0.parentNode.insertBefore(s1,s0);\n' +
                          '})(window, document);\n' +
                          '</script>\n' + 
                          '<!--End of tourgecko embed code-->';  

        $('#book-button-copy-content-trigger').click();
      }
    }

    vm.showDynamicBookButtonPreview = function () {
        if (vm.bookButtonForSpecificTour) {
          var bookButtonLabel = '';
          if (!$scope.bookButtonLabelName)
            bookButtonLabel = 'Book Now';
          else
            bookButtonLabel = $scope.bookButtonLabelName;
          $("#singleTourPreviewButton").text(bookButtonLabel);
          $(".hostHome.bookButton").addClass("overlayStyle");
          $("#singleTourBookButtonPreview").css("display", "block");
        } else if (vm.bookButtonForMultipleTours) {
          var bookButtonLabel = '';
          if (!$scope.bookButtonLabelName)
            bookButtonLabel = 'Browse Tours';
          else
            bookButtonLabel = $scope.bookButtonLabelName;
          var redirectURL = 'https://' + $scope.hostToursiteName + '.tourgecko.com/integrations/tours';
          $("#multiTourBookButton").text(bookButtonLabel);
          $("#multiTourBookButton").attr("href", redirectURL);
          $(".tourgeckoBookButton").css("background-color", $('.jscolor').val());
          $("#multiTourBookButtonPreview").css("display", "block");
        } else {
          toasty.error({
              title: 'Book button type!',
              msg: "Please provide details in 'create button for'",
              sound: false
            });
            return false;
        }
    }

    vm.closePreviewSectionForSingleTour = function () {
      $('.hostHome.bookButton').removeClass("overlayStyle");
      $("#singleTourBookButtonPreview").css("display", "none");
      $("#multiTourBookButtonPreview").css("display", "none");
    }

    vm.changePreviewbuttonColor = function () {
      $(".tourgeckoBookButton").css("background-color", $('.jscolor').val());
    }

    vm.changePreviewbuttonLabel = function () {
      $("#multiTourBookButton").text($scope.bookButtonLabelName);
    }
    vm.getStyleForBookButtonPreview = function () {
      var cssObject = {
        "margin-top": $(".overlayStyle").height() / 3,
        "margin-bottom": $(".overlayStyle").height() / 3
      }
      return cssObject;
    }   
  }
}());
