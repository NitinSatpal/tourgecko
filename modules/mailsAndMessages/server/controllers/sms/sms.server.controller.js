'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  Booking = mongoose.model('Booking'),
  User = mongoose.model('User'),
  momentTimezone = require('moment-timezone'),
  request= require('request'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  config = require(path.resolve('./config/config'));


// Capture the payment.
exports.sendBookingDoneSms = function (smsBody, recepient, callback) {
  var username = config.textlocal.username;
  var hash = config.textlocal.hash;
  var sender = config.textlocal.sender;
  var numbers = recepient;
  var msg = encodeURIComponent(smsBody);
  var uri = 'username='+username+'&hash='+hash+'&sender='+sender+'&numbers='+numbers+'&message='+msg;
  /*request.get({
    headers : this.HEADERSWITHTOKEN,
    url     : 'http://api.Textlocal.in/send/?' + uri
  }, function(error, response, body) {
    var result = JSON.parse(body);
  });*/
}


exports.sendMassMessagesForTheSession = function (req, res) {
  res.json('coming up');
  /*var username = 'nitin@tourgecko.com';
          var hash = '913c80bf51d363fea997045c8e29bbf2719428af3f17e18b2deb91d44d4cd41d';
          var numbers = '9535519640';
          var sender = 'TXTLCL';
          var msg = response.msgBody;
          var uri = 'username='+username+'&hash='+hash+'&sender='+sender+'&numbers='+numbers+'&message='+msg;
          $http.get('http://api.Textlocal.in/send/?'+uri).success(function (res) {
            console.log(res);
            // success
          }).error(function (err) {
            console.log(err);
            // error
          });
  var textMsgRecipients = [];
  Booking.find({productSession: req.body.sessionId}).sort('-created').exec(function (err, bookings) {
    if (err) {
      return false;
    }
    bookings.forEach(function(item) {
      textMsgRecipients.push(item.providedGuestDetails.mobile);
    });

    res.json({recepients: textMsgRecipients, msgBody: req.body.message});
    
  }); */
};


exports.sendMobileVerificationCode = function (req, res) {
  User.findOne({_id: req.user._id}).exec(function (err, user) {
    if (!user.mobileVerificationToken) {
      user.mobileVerificationToken = Math.floor(10000 + Math.random() * 89999);
      user.mobileVerificationTokenExpires = Date.now() + 900000; // 15 minutes
      user.save(function (userSaveErr) {
        var username = config.textlocal.username;
        var hash = config.textlocal.hash;
        var sender = config.textlocal.sender;
        var numbers = user.mobile;
        var smsBody = 'Your tourgecko account phone verification key is ' + user.mobileVerificationToken;
        var msg = encodeURIComponent(smsBody);
        var uri = 'username='+username+'&hash='+hash+'&sender='+sender+'&numbers='+numbers+'&message='+msg;
        request.get({
          //headers : this.HEADERSWITHTOKEN,
          url : 'http://api.Textlocal.in/send/?' + uri
        }, function(error, response, body) {
          var result = JSON.parse(body);
        });
      });
    }
  });
}
