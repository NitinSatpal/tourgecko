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
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


var auth = {
  auth: {
    api_key: 'key-e6a1e08ff51928e50ab79a7d3559beb9',
    domain: 'tourgecko.info'
  }
}

var nodemailerMailgun = nodemailer.createTransport(mg(auth));

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
    res.json(textMsgRecipients);
  });
};

