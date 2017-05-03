(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('MessageController', MessageController)

  MessageController.$inject = ['$scope'];

  function MessageController($scope) {
    var vm = this;
    $('#loadingDivHostSide').css('display', 'none');
	$('#tourgeckoBody').removeClass('waitCursor');
  }
}());
