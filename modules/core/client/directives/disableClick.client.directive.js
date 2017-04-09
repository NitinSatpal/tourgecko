(function () {
  'use strict';

  angular.module('core')
    .directive('disableclick', disableclick);

  function disableclick() {
  	var directive = {
      	restrict: 'A',
	  	priority: 1000,
	  	compile: compile
    };

    return directive;

    function compile(element, attr) {
    	attr.ngClick = null;
    }
  }
}());