'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  momentTimezone = require('moment-timezone'),
  request= require('request'),
  urlencode=require('urlencode'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


// Capture the payment.
exports.sendBookingDoneSms = function (smsBody, recepient, callback) {
  var username = config.textlocal.username;
  var hash = config.textlocal.hash;
  var sender = config.textlocal.sender;
  var numbers = recepient;
  
  var msg = encodeURIComponent('Thank you abc for booking pqr with us! Your booking id is xyz and is awaiting confirmation from us. You will hear from us soon.- Team anb');
  console.log(msg);
  var uri = 'username='+username+'&hash='+hash+'&sender='+sender+'&numbers='+numbers+'&message='+msg;
  request.get({
    headers : this.HEADERSWITHTOKEN,
    url     : 'http://api.Textlocal.in/send/?' + uri
  }, function(error, response, body) {
    console.log(JSON.stringify(response));
    console.log(JSON.stringify(body));
    var result = JSON.parse(body);
  });
}
