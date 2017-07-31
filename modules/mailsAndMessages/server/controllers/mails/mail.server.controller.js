'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  Booking = mongoose.model('Booking'),
  momentTimezone = require('moment-timezone'),
  request= require('request'),
  nodemailer = require('nodemailer'),
  mg = require('nodemailer-mailgun-transport'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  config = require(path.resolve('./config/config'));

var nodemailerMailgun = nodemailer.createTransport(mg(config.mailgun));

var weekdays = ['Sunday' , 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

// Capture the payment.
exports.sendBookingEmailsToGuestAndHost = function (booking, req, res, requestType) {
  var startDate;
  var endDate;
  var startTimeOFTheBooking;
  if(!booking.isOpenDateTour) {
    startDate = new Date(booking.productSession.sessionDepartureDetails.startDate);
    endDate = new Date(booking.productSession.sessionDepartureDetails.startDate);
    startTimeOFTheBooking = booking.productSession.sessionDepartureDetails.startTime;
  } else {
    startDate = new Date(booking.openDatedTourDepartureDate);
    endDate = new Date(booking.openDatedTourDepartureDate);
    startTimeOFTheBooking = booking.actualSessionTime
  }
  if (startTimeOFTheBooking == 'No Time')
    startTimeOFTheBooking = '';
  var duration;
  if (booking.product.productDurationType == 'Days')
    duration = booking.product.productDuration;
  else
    duration = 1;
  
  endDate =  new Date(endDate.setDate(endDate.getDate() + duration - 1));

  var startDateOfTheBooking = weekdays[startDate.getDay()] + ', ' + startDate.getDate() + ' ' + months[startDate.getMonth()] + ' ' + startDate.getFullYear();
  var endDateOfTheBooking = weekdays[endDate.getDay()] + ', ' + endDate.getDate() + ' ' + months[endDate.getMonth()] + ' ' + endDate.getFullYear();


  var bookingOptionsSelected = booking.selectedpricingoptionindexandquantity;
  var addonOptionsSelected = booking.selectedaddonoptionsindexandquantity;

  var calculatedSeatPriceForselectedBookingOptions = booking.selectedpricingoptionindexandprice;
  var calculatedAddonPriceForSelectedAddonOptions = booking.selectedaddonoptionsindexandprice;

  var validPricingOptions;
  if(booking.isOpenDateTour)
    validPricingOptions = booking.product.productPricingOptions;
  else if (booking.productSession.isSessionPricingValid)
    validPricingOptions = booking.productSession.sessionPricingDetails;
  else
    validPricingOptions = booking.product.productPricingOptions;

  var bookingPricingObject = [];
  for (var index = 0; index < bookingOptionsSelected.length; index ++) {
    if (parseInt(bookingOptionsSelected[index]) > 0 && bookingOptionsSelected[index] != 'Please Select') {
      var pricingObject;
      if (validPricingOptions[index].pricingType == 'Custom') {
        pricingObject = {pricingType: validPricingOptions[index].customLabel, price: validPricingOptions[index].price, quantity: bookingOptionsSelected[index], totalPrice: calculatedSeatPriceForselectedBookingOptions[index]};
        bookingPricingObject.push(pricingObject);
      } else if (validPricingOptions[index].pricingType == 'Group') {
        var type = 'Group of ' + validPricingOptions[index].minGroupSize + ' to ' +  validPricingOptions[index].maxGroupSize;
        var price =  validPricingOptions[index].price + ' (' +  validPricingOptions[index].groupOption + ')';
        pricingObject = {pricingType: type, price: price, quantity: bookingOptionsSelected[index], totalPrice: calculatedSeatPriceForselectedBookingOptions[index]};
        bookingPricingObject.push(pricingObject);
      } else {
        pricingObject = {pricingType: validPricingOptions[index].pricingType, price: validPricingOptions[index].price, quantity: bookingOptionsSelected[index], totalPrice: calculatedSeatPriceForselectedBookingOptions[index]};
        bookingPricingObject.push(pricingObject);
      }
    }
  }

  var bookingAddonObject = [];
  for (var index = 0; index < addonOptionsSelected.length; index++) {
    if (parseInt(addonOptionsSelected[index]) > 0 && booking.product.productAddons[index].name != '') {
      var price = booking.product.productAddons[index].price + ' (' + booking.product.productAddons[index].applyAs + ')';
      var addOnject = {name: booking.product.productAddons[index].name, price: price, quantity: addonOptionsSelected[index], totalPrice: calculatedAddonPriceForSelectedAddonOptions[index]};
      bookingAddonObject.push(addOnject);
    }
  }
  
  var totalDueAmount = booking.totalAmountToBePaid - booking.totalAmountPaid;
  if (requestType == 'bookingDone') {
    res.render(path.resolve('modules/hosts/server/templates/booking-pending-guest-email'), {
      customerName: booking.providedGuestDetails.firstName,
      bookingId: booking.bookingReference,
      hostName: booking.hostCompany.companyName,
      tourName: booking.product.productTitle,
      hostNotificationEmail: booking.hostCompany.inquiryEmail,
      hostNotificationPhone: booking.hostCompany.inquiryMobile,
      startDate: startDateOfTheBooking,
      startTime: startTimeOFTheBooking,
      endDate: endDateOfTheBooking,
      customerEmail: booking.providedGuestDetails.email,
      customerMobile: booking.providedGuestDetails.mobile,
      bookingStatus: booking.bookingStatus,
      bookingPricingObject: bookingPricingObject,
      bookingAddonObject: bookingAddonObject,
      totalAmountForProduct: booking.totalAmountForProduct,
      totalAmountForAddons: booking.totalAmountForAddons,
      totalAmountPaid: booking.totalAmountPaid,
      totalDueAmount: totalDueAmount
    }, function (err, emailHTML) {
      var fromName = booking.hostCompany.companyName.toString();
      var fromEmail = booking.hostOfThisBooking.email;
      var replyTo = booking.hostCompany.inquiryEmail;
      nodemailerMailgun.sendMail({
            from: fromName + ' <'+ fromEmail + '>',
            to: booking.providedGuestDetails.email, // An array if you have multiple recipients.
            //cc:'',
            //bcc:'',
            subject: 'Booking Successful!',
            'h:Reply-To': replyTo,
            //You can use "html:" to send HTML email content. It's magic!
            html: emailHTML,
            //You can use "text:" to send plain-text content. It's oldschool!
            // text: req.body.guestDetails.guestMessage
          }, function (err, info) {
            if (err) {
              return err;
            } else {
              return 'success';
            }
          });
    });

    var httpTransport = 'http://';
    if (config.secure && config.secure.ssl === true) {
      httpTransport = 'https://';
    }
    var host = req.headers.host.split('.');
    var hostPart = '';
    for (var index = 0; index < host.length; index ++) {
      if (index > 0) {
        hostPart = hostPart + host[index];
        if (index != host.length - 1)
          hostPart = hostPart + '.';
      }
    }


    var baseUrl = httpTransport + hostPart;
    var bookingURL = baseUrl + '/host/booking/' + booking._id;
    res.render(path.resolve('modules/hosts/server/templates/booking-created-host-email'), {
      customerName: booking.providedGuestDetails.firstName,
      bookingId: booking.bookingReference,
      hostName: booking.hostCompany.companyName,
      tourName: booking.product.productTitle,
      bookingURL: bookingURL,
      hostNotificationEmail: booking.hostCompany.inquiryEmail,
      hostNotificationPhone: booking.hostCompany.inquiryMobile,
      startDate: startDateOfTheBooking,
      startTime: startTimeOFTheBooking,
      endDate: endDateOfTheBooking,
      customerEmail: booking.providedGuestDetails.email,
      customerMobile: booking.providedGuestDetails.mobile,
      bookingStatus: booking.bookingStatus,
      bookingPricingObject: bookingPricingObject,
      bookingAddonObject: bookingAddonObject,
      totalAmountForProduct: booking.totalAmountForProduct,
      totalAmountForAddons: booking.totalAmountForAddons,
      totalAmountPaid: booking.totalAmountPaid,
      totalDueAmount: totalDueAmount
    }, function (err, emailHTML) {
      nodemailerMailgun.sendMail({
            from: 'tourgecko <noreply@tourgecko.com>',
            to: booking.hostCompany.notificationEmail, // An array if you have multiple recipients.
            //cc:'',
            //bcc:'',
            subject: 'Booking Request!',
            //You can use "html:" to send HTML email content. It's magic!
            html: emailHTML,
            //You can use "text:" to send plain-text content. It's oldschool!
            // text: req.body.guestDetails.guestMessage
          }, function (err, info) {
            if (err) {
              return err;
            } else {
              return 'success';
            }
          });
    });
  } else if (requestType == 'Confirmed') {
    res.render(path.resolve('modules/hosts/server/templates/booking-confirm-guest-email'), {
      customerName: booking.providedGuestDetails.firstName,
      bookingId: booking.bookingReference,
      hostName: booking.hostCompany.companyName,
      tourName: booking.product.productTitle,
      bookingURL: bookingURL,
      hostNotificationEmail: booking.hostCompany.inquiryEmail,
      hostNotificationPhone: booking.hostCompany.inquiryMobile,
      startDate: startDateOfTheBooking,
      startTime: startTimeOFTheBooking,
      endDate: endDateOfTheBooking,
      customerEmail: booking.providedGuestDetails.email,
      customerMobile: booking.providedGuestDetails.mobile,
      bookingStatus: booking.bookingStatus,
      bookingPricingObject: bookingPricingObject,
      bookingAddonObject: bookingAddonObject,
      totalAmountForProduct: booking.totalAmountForProduct,
      totalAmountForAddons: booking.totalAmountForAddons,
      totalAmountPaid: booking.totalAmountPaid,
      totalDueAmount: totalDueAmount
    }, function (err, emailHTML) {
      var fromName = booking.hostCompany.companyName.toString();
      var fromEmail = booking.hostOfThisBooking.email;
      var replyTo = booking.hostCompany.inquiryEmail;
      nodemailerMailgun.sendMail({
            from: fromName + '<' + fromEmail + '>',
            to: booking.providedGuestDetails.email, // An array if you have multiple recipients.
            //cc:'',
            //bcc:'',
            subject: 'Booking Confirmed!',
            'h:Reply-To': replyTo,
            //You can use "html:" to send HTML email content. It's magic!
            html: emailHTML,
            //You can use "text:" to send plain-text content. It's oldschool!
            // text: req.body.guestDetails.guestMessage
          }, function (err, info) {
            if (err) {
              return err;
            } else {
              return 'success';
            }
          });
    });
  } else {
    res.render(path.resolve('modules/hosts/server/templates/booking-cancel-declined-guest-email'), {
      customerName: booking.providedGuestDetails.firstName,
      bookingId: booking.bookingReference,
      hostName: booking.hostCompany.companyName,
      tourName: booking.product.productTitle,
      bookingURL: bookingURL,
      hostNotificationEmail: booking.hostCompany.inquiryEmail,
      hostNotificationPhone: booking.hostCompany.inquiryMobile,
      startDate: startDateOfTheBooking,
      startTime: startTimeOFTheBooking,
      endDate: endDateOfTheBooking,
      customerEmail: booking.providedGuestDetails.email,
      customerMobile: booking.providedGuestDetails.mobile,
      bookingStatus: booking.bookingStatus,
      bookingPricingObject: bookingPricingObject,
      bookingAddonObject: bookingAddonObject,
      totalAmountForProduct: booking.totalAmountForProduct,
      totalAmountForAddons: booking.totalAmountForAddons,
      totalAmountPaid: booking.totalAmountPaid,
      totalDueAmount: totalDueAmount
    }, function (err, emailHTML) { 
      var fromName = booking.hostCompany.companyName.toString();
      var fromEmail = booking.hostOfThisBooking.email;
      var replyTo = booking.hostCompany.inquiryEmail;    
      nodemailerMailgun.sendMail({
            from: fromName + '<' + fromEmail + '>',
            to: booking.providedGuestDetails.email, // An array if you have multiple recipients.
            //cc:'',
            //bcc:'',
            subject: 'Booking ' + booking.bookingStatus +'!',
            'h:Reply-To': replyTo,
            //You can use "html:" to send HTML email content. It's magic!
            html: emailHTML,
            //You can use "text:" to send plain-text content. It's oldschool!
            // text: req.body.guestDetails.guestMessage
          }, function (err, info) {
            if (err) {
              return err;
            } else {
              return 'success';
            }
          });
    });
  }
}


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
      // html: req.body.message,
      //You can use "text:" to send plain-text content. It's oldschool!
      text: req.body.message
    }, function (err, info) {
      if (err) {
        res.json('unknown error occurred. Please try again.')
      }
      else {
        res.json('mails sent successfully');
      }
    });
  });
};

exports.sendContactUsContentToHost = function (req, res) {  
  nodemailerMailgun.sendMail({
    from: req.body.guestDetails.guestEmail,
    to: req.body.hostMail, // An array if you have multiple recipients.
    //cc:'',
    //bcc:'',
    subject: req.body.guestDetails.guestSubject,
    //You can use "html:" to send HTML email content. It's magic!
    // html: req.body.guestDetails.guestMessage,
    //You can use "text:" to send plain-text content. It's oldschool!
    text: req.body.guestDetails.guestMessage
  }, function (err, info) {
    if (err) {
      res.json('unknown error occurred. Please try again.')
    }
    else {
      res.json('mails sent successfully');
    }
  });
}