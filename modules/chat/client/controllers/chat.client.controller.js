(function () {
  'use strict';

  angular
    .module('chat')
    .controller('ChatController', ChatController);

  ChatController.$inject = ['$scope', '$state', '$http', 'Authentication', 'Socket'];

  function ChatController($scope, $state, $http, Authentication, Socket) {
    var vm = this;

    vm.messages = [];
    vm.messageText = '';
    vm.sendMessage = sendMessage;

    init();

    function init() {
      // If user is not signed in then redirect back home
      if (!Authentication.user) {
        $state.go('home');
      }

      // Make sure the Socket is connected
      if (!Socket.socket) {
        Socket.connect();
      }

      // Add an event listener to the 'chatMessage' event
      Socket.on('chatMessage', function (message) {
        vm.messages.unshift(message);
      });

      // Remove the event listener when the controller instance is destroyed
      $scope.$on('$destroy', function () {
        Socket.removeListener('chatMessage');
      });
    }

    // Create a controller method for sending messages
    function sendMessage() {
      // Create a new message object
      var message = {
        text: vm.messageText
      };
      var messageDetails = { 'messageFrom': 'kanna@manna.com', 'messageTo': 'nitinsatpal@gmail.com', 'messageType': 'query', 'messageBody': message.text, 'messageStatus': 'open' };
      $http.post('/api/message/', messageDetails).success(function (response) {
        console.log('saved');
      }).error(function (response) {
        vm.error = response.message;
      });
      // Emit a 'chatMessage' message event
      Socket.emit('chatMessage', message);
      // Clear the message text
      vm.messageText = '';
    }
  }
}());
