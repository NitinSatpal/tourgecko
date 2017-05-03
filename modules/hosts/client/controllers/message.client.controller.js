(function () {
  'use strict';

  angular
    .module('hosts')
    .controller('MessageController', MessageController)

  MessageController.$inject = ['$scope'];

  function MessageController($scope) {
    var vm = this;
    $('#tourgeckoBody').removeClass('waitCursor');
  }
}());
