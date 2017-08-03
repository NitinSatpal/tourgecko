(function () {
  'use strict';

  angular.module('core')
    .directive('disallowSpaces', disallowSpaces);

  function disallowSpaces() {
  	return {
	    restrict: 'A',

	    link: function($scope, $element) {
	      	$element.bind('input', function() {
	        	$(this).val($(this).val().replace(/ /g, ''));
	      	});
	    }
	};
  }
}());