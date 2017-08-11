'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),  
  Pin = mongoose.model('PinboardPins'),
  Goal = mongoose.model('PinboardGoals'),
  Booking = mongoose.model('Booking'),
  Product = mongoose.model('Product'),
  ProductSession = mongoose.model('ProductSession'),
  HostCompany = mongoose.model('HostCompany'),
  Message = mongoose.model('Message'),
  ModifyPinboard = require(path.resolve('./modules/hosts/server/controllers/pinboard/modifyPinboardForParticularUser.server.controller')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


// Fetch all bookings
exports.fetchCompanyBookingDetailsForAnalyticsAndLatestData = function (req, res) {
  if (req.user) {
    var startDate = new Date();
    startDate = new Date (startDate.setDate(startDate.getDate() - 31));
    var endDate = new Date();
    // The following line is removed from the query condition as for now we are not querying for last 30 days
    // , created: {$gt: startDate}, created: {$lte: endDate}
    Booking.find({hostOfThisBooking: req.user._id, isPaymentDone: true}).sort('-created').populate('user').populate('product').populate('productSession').exec(function (err, bookings) {
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


exports.fetchCompanyProductSessionDetailsForAnalyticsAndLatestData =function (req, res) {
	var startDate = new Date();
  startDate = new Date (startDate.setDate(startDate.getDate() - 31)).toISOString();
  var endDate = new Date().toISOString();
	if(req.user) {
    // The following line is removed from the query conditions as for now we are nto queryying for last 30 days
    // , sessionDepartureDate: {$gt: startDate},  sessionDepartureDate: {$lte: endDate}
  	ProductSession.find({ 'hostCompany': req.user.company}).populate('product').sort('sessionDepartureDate').exec(function(error, sessions) {
    		if (error) {
      		return res.status(400).send({
        			message: errorHandler.getErrorMessage(error)
      		});
    		}
        var departureSessions = [];
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
				    var firstDate = new Date(sessions[index].sessionDepartureDetails.repeatTillDate);
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
  			    	if((sessions[index].sessionDepartureDetails.repeatBehavior == 'Repeat Daily' && notAllowedDays.has(secondDate.getDay())) ||
  			          (sessions[index].sessionDepartureDetails.repeatBehavior == 'Repeat Weekly' && !allowedDays.has(secondDate.getDay())))
  			    		repeatedDays = repeatedDays - 1;
              else {
                if (isThisFutureSession(secondDate) && departureSessions.length < 7 ) {
                  var tempObject = {};
                  tempObject.startDate = new Date(secondDate);
                  tempObject.startTime = sessions[index].sessionDepartureDetails.startTime;
                  tempObject.utcDate = secondDate;
                  tempObject.sessionInternalName = sessions[index].sessionInternalName;
                  tempObject.productTitle = sessions[index].product.productTitle;
                  tempObject.numberOfSeatsSession = sessions[index].numberOfSeatsSession;
                  tempObject.sessionCapacityDetails = sessions[index].sessionCapacityDetails;
                  tempObject.productSeatLimit = sessions[index].product.productSeatLimit;
                  tempObject.percentBookingColor = findBackgroundColorAsPerOccupancy(tempObject.numberOfSeatsSession, tempObject.sessionCapacityDetails, secondDate);
                  tempObject.sessionId = sessions[index]._id;
                  departureSessions.push(tempObject);
                }
              }

              secondDate = new Date(secondDate.setDate(secondDate.getDate() + 1));
  			    }
  			    finalCounter = finalCounter + repeatedDays;
			    } else {
				    finalCounter = finalCounter + 1;
            if (isThisFutureSession(sessions[index].sessionDepartureDetails.startDate) && departureSessions.length < 7 ) {
              var tempObject = {};
              tempObject.startDate = sessions[index].sessionDepartureDetails.startDate;
              tempObject.startTime = sessions[index].sessionDepartureDetails.startTime;
              tempObject.utcDate = new Date(sessions[index].sessionDepartureDetails.startDate);
              tempObject.sessionInternalName = sessions[index].sessionInternalName;
              tempObject.productTitle = sessions[index].product.productTitle;
              tempObject.numberOfSeatsSession = sessions[index].numberOfSeatsSession;
              tempObject.sessionCapacityDetails = sessions[index].sessionCapacityDetails;
              tempObject.productSeatLimit = sessions[index].product.productSeatLimit;
              tempObject.percentBookingColor = findBackgroundColorAsPerOccupancy(tempObject.numberOfSeatsSession, tempObject.sessionCapacityDetails, sessions[index].sessionDepartureDetails.startDate);
              tempObject.sessionId = sessions[index]._id;
              departureSessions.push(tempObject);
            }
          }
		    }
    	res.json({departureSessions: departureSessions, count: finalCounter});
  	});
	}
}

function isThisFutureSession (startDate) {
  var countDownDate = new Date(startDate).getTime();
  var now = new Date().getTime();
  var distance = countDownDate - now;
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));

  if (days >= 0)
    return true;

  return false;
}

function findBackgroundColorAsPerOccupancy (numberOfSeatsSession, sessionCapacityDetails, startDate) {
  var numOfSeatsKey = new Date(startDate).getTime().toString();
  console.log('the key is ' + numOfSeatsKey);
  var percentBooking;
  if (sessionCapacityDetails.sessionSeatLimit) {
    var limit = parseInt(sessionCapacityDetails.sessionSeatLimit);
    if (numberOfSeatsSession && numberOfSeatsSession[numOfSeatsKey])
      percentBooking = parseInt(numberOfSeatsSession[numOfSeatsKey]) / parseInt(limit) * 100;
    else
      percentBooking = 0;
  } else
    percentBooking = 1;

  var cssObject = {

  }
  if (percentBooking == 0)
    cssObject["background-color"] = "#3fb7ee";
  else if (percentBooking > 0 && percentBooking <= 50)
    cssObject["background-color"] = "#34C76E";
  else if (percentBooking > 50 && percentBooking < 100)
    cssObject["background-color"] = "#f7c836";
  else
    cssObject["background-color"] = "#EC8484";

  return cssObject;
}


exports.countCompanyProducts =function (req, res) {
  var startDate = new Date();
  startDate = new Date (startDate.setDate(startDate.getDate() - 31));
  var endDate = new Date();
  // the following line is removed from query condition as for now we are not querying for last 30 days
  // , created: {$gt: startDate}, created: {$lte: endDate}
  if(req.user) {
    Product.count({ 'hostCompany': req.user.company}, function(error, count) {
      if (error) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(error)
        });
      }
      res.json({count: count});
    });
  }
}

exports.fetchMessageCountForAnalyticsAndLatestData = function (req, res) {
  if (req.user) {
  	var startDate = new Date();
    startDate = new Date (startDate.setDate(startDate.getDate() - 31));
    var endDate = new Date();
    // the following line is removed from query condition as for now we are not querying for last 30 days
    // , created: {$gt: startDate}, created: {$lte: endDate}
  	Message.count({'messageToId': req.user._id}).sort('-created').exec(function (err, count) {
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

exports.dissmissTheWelcomMessage = function (req, res) {
  HostCompany.findOne({user: req.user._id}).exec(function (err, hostCompany) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    hostCompany.newUserFirstLoginValidElements.push(req.body.dismissingElementUniqueCode);
    hostCompany.save( function (hostCompanySaveError) {
      if (hostCompanySaveError) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(hostCompany);
    });
  })
}




