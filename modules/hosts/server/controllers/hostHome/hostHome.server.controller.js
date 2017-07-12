'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),  
  Pin = mongoose.model('PinboardPins'),
  Goal = mongoose.model('PinboardGoals'),
  Booking = mongoose.model('Booking'),
  ProductSession = mongoose.model('ProductSession'),
  Message = mongoose.model('Message'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


// Fetch all bookings
exports.fetchCompanyBookingDetailsForAnalyticsAndLatestData = function (req, res) {
  if (req.user) {
    var startDate = new Date();
    startDate = new Date (startDate.setDate(startDate.getDate() - 31));
    var endDate = new Date();
    Booking.find({hostOfThisBooking: req.user._id, isPaymentDone: true, created: {$gt: startDate}, created: {$lte: endDate}}).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
      	if (err) {
        	return res.status(400).send({
          		message: errorHandler.getErrorMessage(err)
        	});
      	}
      	var totalRevenue = 0;
      	for (var index = 0; index < bookings.length; index ++)
        	totalRevenue = totalRevenue + parseInt(bookings[index].totalAmountPaid);
      	res.json({bookings: bookings, totalRevenue: totalRevenue});
    });
  }
};


exports.countCompanyProductSessions =function (req, res) {
	var startDate = new Date();
  startDate = new Date (startDate.setDate(startDate.getDate() - 31));
  var endDate = new Date();
	if(req.user) {
  	ProductSession.find({ 'hostCompany': req.user.company, sessionDepartureDate: {$gt: startDate},  sessionDepartureDate: {$lte: endDate}}, function(error, sessions) {
    		if (error) {
      		return res.status(400).send({
        			message: errorHandler.getErrorMessage(error)
      		});
    		}
    		var weekDaysNumber = new Map();
      	weekDaysNumber.set('Sunday', 0);
      	weekDaysNumber.set('Monday', 1);
      	weekDaysNumber.set('Tuesday', 2);
      	weekDaysNumber.set('Wednesday', 3);
      	weekDaysNumber.set('Thursday', 4);
      	weekDaysNumber.set('Friday', 5);
      	weekDaysNumber.set('Saturday', 6);

      	var finalCounter = 0;
    		for (var index = 0; index < sessions.length; index++) {
      		if(sessions[index].sessionDepartureDetails.repeatBehavior == 'Repeat Daily' || sessions[index].sessionDepartureDetails.repeatBehavior == 'Repeat Weekly') {
				    var firstDate = new Date();
    			  var secondDate = new Date(sessions[index].sessionDepartureDetails.startDate);
        		var oneDay = 24 * 60 * 60 * 1000;
        		var repeatedDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
        		var notAllowedDays = new Set();
	        	var allowedDays = new Set();
        		if (sessions[index].sessionDepartureDetails.repeatBehavior == 'Repeat Daily' && sessions[index].sessionDepartureDetails.notRepeatOnDays) {
			      	for (var dailyIndex = 0; dailyIndex < sessions[index].sessionDepartureDetails.notRepeatOnDays.length; dailyIndex++)
			        	notAllowedDays.add(weekDaysNumber.get(sessions[index].sessionDepartureDetails.notRepeatOnDays[dailyIndex]));
			    }
			    if (sessions[index].sessionDepartureDetails.repeatBehavior == 'Repeat Weekly' && sessions[index].sessionDepartureDetails.repeatOnDays) {
			      	for (var weeklyIndex = 0; weeklyIndex < sessions[index].sessionDepartureDetails.repeatOnDays.length; weeklyIndex++)
			        	allowedDays.add(weekDaysNumber.get(sessions[index].sessionDepartureDetails.repeatOnDays[weeklyIndex]));
			    }
			    for (var counterIndex = 0; counterIndex <= repeatedDays; counterIndex++) {
			    	if(sessions[index].sessionDepartureDetails.repeatBehavior == 'Repeat Daily' && notAllowedDays.has(eventDate.getDay()) ||
			          sessions[index].sessionDepartureDetails.repeatBehavior == 'Repeat Weekly' && !allowedDays.has(eventDate.getDay()))
			    		repeatedDays = repeatedDays - 1;
			    }
			    finalCounter = finalCounter + repeatedDays;
			  } else
				finalCounter = finalCounter + 1;
		  }
    	res.json(finalCounter);
  	});
	}
}


exports.fetchMessageCountForAnalyticsAndLatestData = function (req, res) {
  if (req.user) {
  	var startDate = new Date();
    startDate = new Date (startDate.setDate(startDate.getDate() - 31));
    var endDate = new Date();
  	Message.count({'messageToId': req.user._id, created: {$gt: startDate}, created: {$lte: endDate}}).sort('-created').exec(function (err, count) {
	    Message.find({'messageToId': req.user._id, created: {$gt: startDate}, created: {$lte: endDate}}).limit(5).sort('-created').exec(function (err, messages) {
	      if (err) {
	        return res.status(400).send({
	          message: errorHandler.getErrorMessage(err)
	        });
	      }
	      res.json({messages: messages, messageCount: count});
	    });
	});
  }
};




