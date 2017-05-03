'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Booking = mongoose.model('Booking'),
  config = require(path.resolve('./config/config')),
  nodemailer = require('nodemailer'),
  mg = require('nodemailer-mailgun-transport'),
  http = require('http'),
  urlencode = require('urlencode'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


var nodemailerMailgun = nodemailer.createTransport(mg(config.mailgun));

exports.sendMassMailForTheSession = function (req, res) {
  var mailRecipients = '';
  Booking.find({productSession: req.body.sessionId}).sort('-created').populate('hostCompany').exec(function (err, bookings) {
    if (err) {
      return false;
    }
    bookings.forEach(function(item) {
      mailRecipients = mailRecipients + item.providedGuestDetails.email + ',';
    });
    
    var msgFrom = bookings[0].hostCompany.inquiryEmail;
    var replyTo = bookings[0].hostCompany.inquiryEmail;
    nodemailerMailgun.sendMail({
      from: msgFrom,
      to: mailRecipients, // An array if you have multiple recipients.
      //cc:'',
      //bcc:'',
      subject: 'Hey you, awesome!',
      'h:Reply-To': replyTo,
      //You can use "html:" to send HTML email content. It's magic!
      html: req.body.message,
      //You can use "text:" to send plain-text content. It's oldschool!
      text: 'Mailgun rocks, pow pow!'
    }, function (err, info) {
      if (err) {
        console.log('the error is ' +err);
        res.json('unknown error occurred. Please try again.')
      }
      else {
        res.json('mails sent successfully');
      }
    });
  });
};

exports.sendMassMessagesForTheSession = function (req, res) {
  var textMsgRecipients = [];
  Booking.find({productSession: req.body.sessionId}).sort('-created').exec(function (err, bookings) {
    if (err) {
      return false;
    }
    bookings.forEach(function(item) {
      textMsgRecipients.push(item.providedGuestDetails.mobile);
    });
    var username = urlencode('nitin@tourgecko.com');
    var hash = urlencode('913c80bf51d363fea997045c8e29bbf2719428af3f17e18b2deb91d44d4cd41d');
    var number = urlencode('+919535519640');
    var sender = urlencode('tourgecko');
    var msg = urlencode(req.body.message);
    var data = urlencode('username='+username+'&hash='+hash+'&sender='+sender+'&numbers='+number+'&message='+msg);
    var options = {
      host: 'api.textlocal.in',
      path: '/send?'+data
    };
    console.log(options);
    console.log('till here');
    http.request(options, callback).end();
    callback = function(response, error) {
      console.log(error);
      var str = '';
      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });
      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        console.log(str);
      });
    }
  });
};

