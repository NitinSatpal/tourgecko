var monthNameToNumber = new Map();
monthNameToNumber.set('January', 0);
monthNameToNumber.set('February', 1);
monthNameToNumber.set('March', 2);
monthNameToNumber.set('April', 3);
monthNameToNumber.set('May', 4);
monthNameToNumber.set('June', 5);
monthNameToNumber.set('July', 6);
monthNameToNumber.set('August', 7);
monthNameToNumber.set('September', 8);
monthNameToNumber.set('October', 9);
monthNameToNumber.set('November', 10);
monthNameToNumber.set('December', 11);

var monthNameToNumberAgendaWeek = new Map();
monthNameToNumberAgendaWeek.set('Jan', 0);
monthNameToNumberAgendaWeek.set('Feb', 1);
monthNameToNumberAgendaWeek.set('Mar', 2);
monthNameToNumberAgendaWeek.set('Apr', 3);
monthNameToNumberAgendaWeek.set('May', 4);
monthNameToNumberAgendaWeek.set('Jun', 5);
monthNameToNumberAgendaWeek.set('Jul', 6);
monthNameToNumberAgendaWeek.set('Aug', 7);
monthNameToNumberAgendaWeek.set('Sep', 8);
monthNameToNumberAgendaWeek.set('Oct', 9);
monthNameToNumberAgendaWeek.set('Nov', 10);
monthNameToNumberAgendaWeek.set('Dec', 11);

var monthArrays = {
	0: [],
	1: [],
	2: [],
	3: [],
	4: [],
	5: [],
	6: [],
	7: [],
	8: [],
	9: [],
	10: [],
	11: []
}
var monthListArrays = {
	0: [],
	1: [],
	2: [],
	3: [],
	4: [],
	5: [],
	6: [],
	7: [],
	8: [],
	9: [],
	10: [],
	11: []
}

var date = new Date();
var month = date.getMonth();
$('#calendar').fullCalendar({
	header: {
		left: 'prev,next today',
		center: 'title',
		right: 'month,agendaWeek,agendaDay'
	},
	lazyFetching: false,
	scrollTime: '00:00',
	navLinks: true, // can click day/week names to navigate views
	selectHelper: true,
	select: function(start, end) {
		var title = prompt('Event Title:');
		var eventData;
		if (title) {
			eventData = {
				title: title,
				start: start,
				duration: duration
				// end: end
			};
			$('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
		}
		$('#calendar').fullCalendar('unselect');
	},
	editable: true,
	//events: fetchEvents(month),
	viewRender: function (view) {
		$('#loadingDivHostSide').css('display', 'block');
      	$('#tourgeckoBody').addClass('waitCursor');
      	var viewName = view.name;
      	var splittedString = view.title.split(' ');
      	if (view.name == 'month') {
			var uniqueString = monthNameToNumber.get(splittedString[0]).toString() + splittedString[1];
			fetchGivenMonthEvents(uniqueString, monthNameToNumber.get(splittedString[0]), viewName, null, null, null);
		} else if (view.name == 'agendaWeek') {
			if (splittedString.length == 6) {
				var fromDate = new Date(splittedString[1] + ' ' + splittedString[0] + ' ' + splittedString[5]);
				var toDate = new Date(splittedString[4] + ' ' + splittedString[3] + ' ' + splittedString[5]);
				var uniqueString = monthNameToNumberAgendaWeek.get(splittedString[0]).toString() + splittedString[5];
				fetchGivenMonthEvents(uniqueString, monthNameToNumberAgendaWeek.get(splittedString[0]), viewName, fromDate, toDate, null);
			} else {
				var fromDate = new Date(splittedString[1] + ' ' + splittedString[0] + ' ' + splittedString[4]);
				var toDate = new Date(splittedString[3] + ' ' + splittedString[0] + ' ' + splittedString[4]);
				var uniqueString = monthNameToNumberAgendaWeek.get(splittedString[0]).toString() + splittedString[4];
				fetchGivenMonthEvents(uniqueString, monthNameToNumberAgendaWeek.get(splittedString[0]), viewName, fromDate, toDate, null);
			}
		} else {
			var theDate = new Date(splittedString[1] + ' ' + splittedString[0] + ' ' + splittedString[2]);
			var uniqueString = monthNameToNumber.get(splittedString[0]).toString() + splittedString[2];
			fetchGivenMonthEvents(uniqueString, monthNameToNumber.get(splittedString[0]), viewName, null, null, theDate);
		}
	},
	eventRender: function (event, element) {
		element.find('.fc-title').html(event.title);
	},
	eventClick:  function(event, jsEvent, view) {
		// Array of months to convert month from number to month name
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		

		// Convert start date in ISO format Date to show
		var startDate = new Date(event._start._i);
		var showDate = startDate.getDate() + " " + months[startDate.getMonth()];
		var duration = event.duration === undefined ? 'Duration not provided' :  event.duration;
		// Name of the tour or event
		var event_name = event.titleText; //$(jsEvent.currentTarget).find(".eventname").text();
		// CSS of event
		var event_color = $(jsEvent.currentTarget).find(".eventname").attr("class").split(" ")[1];
		// Booking data will come here
		var bookings = $(jsEvent.currentTarget).find(".lbreak").text().split("/")[0]+" Seats booked";
		var availabilityType = event.tourDepartureType;
		var bodyHtml = 	"<p>" + 
			   			"<i class='zmdi zmdi-calendar'></i> &nbsp;" +
						showDate + 
					   	"</p>" +
					   	"<p>" + 
					   		"<i class='zmdi zmdi-time'></i> &nbsp;" +
							duration +
						"</p>" + 
						"<p>" + 
							"<i class='zmdi zmdi-calendar-check'></i> &nbsp;" +
							availabilityType +
						"</p>" + 
						"<p>" +
							"<i class='zmdi zmdi-account'></i>" +
							bookings + 
						"</p>";
		$('#calendarTourPopupTitle').html("<i class='zmdi zmdi-circle'></i> " + event_name).removeClass();
		$('#calendarTourPopupTitle').html("<i class='zmdi zmdi-circle'></i> " + event_name).addClass(event_color);
		$('#calendarTourPopupBody').html(bodyHtml);
		$('#eventUrl').attr('sessionId', event.productSessionId);
		$('#eventUrl').attr('sessionStartDate', event._start._i);
		$('#fullCalModal').modal();
	}
});

function fetchGivenMonthEvents(uniqueString, monthNumber, viewName, fromDate, toDate, theDate) {
	if((viewName == 'month' && (monthArrays[monthNumber].length == 0 || monthListArrays[monthNumber].length == 0 )) || viewName == 'agendaWeek' || viewName == 'agendaDay') {
		$.ajax({
	      	url:'/api/host/companyproductsessionsforgivenmonth/' + uniqueString,
	        type:'GET',
	        dataType: 'json',
	      	success: function( sessions ) {
		      	var weekDaysNumber = new Map();
		      	weekDaysNumber.set('Sunday', 0);
		      	weekDaysNumber.set('Monday', 1);
		      	weekDaysNumber.set('Tuesday', 2);
		      	weekDaysNumber.set('Wednesday', 3);
		      	weekDaysNumber.set('Thursday', 4);
		      	weekDaysNumber.set('Friday', 5);
		      	weekDaysNumber.set('Saturday', 6);
		      	monthListArrays[monthNumber].length = 0;
		      	monthArrays[monthNumber].length = 0;
	        	$.each(sessions, function(index, document) {
	        		if(document) {
		        		var repeatedDays = 0;
		        		var notAllowedDays = new Set();
		        		var allowedDays = new Set();
	        			if(document.sessionDepartureDetails.repeatBehavior == 'Repeat Daily' || document.sessionDepartureDetails.repeatBehavior == 'Repeat Weekly') {
	        				var firstDate = new Date(document.sessionDepartureDetails.repeatTillDate);
		        			var secondDate = new Date(document.sessionDepartureDetails.startDate);
			        		var oneDay = 24*60*60*1000;
			        		repeatedDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
			        		repeatedDays = repeatedDays + 1;
		        			var tourRepeatingType = 'Non-repeating tour';
			        		if (document.sessionDepartureDetails.repeatBehavior == 'Repeat Daily' && document.sessionDepartureDetails.notRepeatOnDays) {
			        			tourRepeatingType = 'Tour repeating daily';
						      	for (var index = 0; index < document.sessionDepartureDetails.notRepeatOnDays.length; index++)
						        	notAllowedDays.add(weekDaysNumber.get(document.sessionDepartureDetails.notRepeatOnDays[index]));
						    }
						    if (document.sessionDepartureDetails.repeatBehavior == 'Repeat Weekly' && document.sessionDepartureDetails.repeatOnDays) {
						    	tourRepeatingType = 'Tour repeating monthly';
						      	for (var index = 0; index < document.sessionDepartureDetails.repeatOnDays.length; index++)
						        	allowedDays.add(weekDaysNumber.get(document.sessionDepartureDetails.repeatOnDays[index]));
						    }
						}
		        		var eventDate = new Date(document.sessionDepartureDetails.startDate);
		        		for (var index = 0; index <= repeatedDays; index ++) {
		        			var needToSave = true;
		        			var allDay;
		        			var minTime;
		        			var maxTime;
		        			if(document.sessionDepartureDetails.repeatBehavior == 'Repeat Daily' && notAllowedDays.has(eventDate.getDay()) ||
				        		document.sessionDepartureDetails.repeatBehavior == 'Repeat Weekly' && !allowedDays.has(eventDate.getDay()) ||
				        		eventDate > firstDate)
				        		needToSave = false;

		        			if (needToSave) {
		        				var endDate = angular.copy(eventDate);
				        		if (document.product.productDuration !== undefined && document.product.productDurationType == 'Days') {
				        			endDate.setDate(endDate.getDate() + document.product.productDuration);
				        			allDay = true;
				        		}
				        		if (document.product.productDuration !== undefined && document.product.productDurationType == 'Hours') {
				        			allDay = false;
				        		}
		        				var limit;
		        				var percentBooking = 'NA';
		        				var numOfSeatsKey = eventDate.getTime().toString();
				        		if(document.product.productAvailabilityType == 'Open Date')
				        			limit = '-';
				        		else {
				        			if (document.sessionCapacityDetails.sessionSeatsLimitType == 'unlimited') {
					        			limit = 'No Limit';
				        			} else {
					        			if (document.sessionCapacityDetails.sessionSeatLimit) {
					        				limit = document.sessionCapacityDetails.sessionSeatLimit;
					        				if (document.numberOfSeatsSession && document.numberOfSeatsSession[numOfSeatsKey])
					        					percentBooking = parseInt(document.numberOfSeatsSession[numOfSeatsKey]) / parseInt(limit) * 100;
					        			} else
					        			 	limit = '-';
					        		}
				        		}
		        				var eventObject;
		        				var listObject;
		        				var colorSelectionAndTitle;
		        				var colorSelectionAndTitleForMobile;
		        				var bookingDetailsInCalendar;
		        				var colorClassForListItems;
		        				if (document.numberOfSeatsSession && document.numberOfSeatsSession[numOfSeatsKey])
		        					bookingDetailsInCalendar = document.numberOfSeatsSession[numOfSeatsKey];
		        				else
		        					bookingDetailsInCalendar = 0;
		        				if (percentBooking != 'NA') {
		        					if (percentBooking <= 40) {
		        						colorClassForListItems = '#42AE5E';
		        						colorSelectionAndTitle = '<span class="eventname"  style="color: #40C4FF;">' +
						        			document.sessionInternalName + ' (' + document.product.productTitle + ')</span> <br>' +
						        			'<span class="lbreak"><i class="zmdi zmdi-circle greenFC"></i>' +
						        			'<i class="zmdi zmdi-account"></i> &nbsp; ' + bookingDetailsInCalendar + '/' +limit +'</span>';
						        		colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle greenFC"><span class="eventname greenFC"></span></i>';
		        					} else if (percentBooking > 40 && percentBooking <= 80) {
		        						colorClassForListItems = '#ED9C28';
		        						colorSelectionAndTitle = '<span class="eventname"  style="color: #40C4FF;>' + 
						        			document.sessionInternalName + ' (' + document.product.productTitle + ')</span> <br>' + 
						        			'<span class="lbreak"><i class="zmdi zmdi-circle orangeFC"></i>' + 
						        			'<i class="zmdi zmdi-account"></i> &nbsp;' + bookingDetailsInCalendar + '/' +limit +'</span>';
						        		colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle orangeFC"><span class="eventname orangeFC"></span></i>';
		        					} else {
		        						colorClassForListItems = '#D84040';
		        						colorSelectionAndTitle = '<span class="eventname"  style="color: #40C4FF;>' +
					        				document.sessionInternalName + ' (' + document.product.productTitle + ')</span> <br>' +
					        				'<span class="lbreak"><i class="zmdi zmdi-circle redFC"></i>' + 
					        				'<i class="zmdi zmdi-account"></i> &nbsp;' + bookingDetailsInCalendar + '/' +limit +'</span>';
					        			colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle redFC"><span class="eventname redFC"></span></i>';
		        					}

		        				} else {
		        					colorClassForListItems = '#42AE5E';
		        					colorSelectionAndTitle = '<span class="eventname"  style="color: #40C4FF;">' +
						        			document.sessionInternalName + ' (' + document.product.productTitle + ')</span> <br>' +
						        			'<span class="lbreak"><i class="zmdi zmdi-circle greenFC"></i>' +
						        			'<i class="zmdi zmdi-account"></i> &nbsp; ' + bookingDetailsInCalendar + '/' +limit +'</span>';
						        	colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle greenFC"><span class="eventname greenFC"></span></i>';
		        				}

				        		if (window.innerWidth > 767) {
				        			eventObject = {
				        				title: colorSelectionAndTitle,
				        				titleText: document.product.productTitle,
					        			start: eventDate,
					        			duration: document.product.productDuration ? document.product.productDuration + '&nbsp' + document.product.productDurationType : undefined,
					        			end: endDate,
					        			allDay: allDay,
					        			productSessionId: document._id,
					        			backgroundColor:  '#ffe4b2',
					        			tourDepartureType: document.product.productAvailabilityType
				        			}
					        	} else {
					        		eventObject = {
				        				title: colorSelectionAndTitleForMobile,
				        				titleText: document.product.productTitle,
					        			start: eventDate,
					        			duration: document.product.productDuration ? document.product.productDuration + '&nbsp' + document.product.productDurationType : undefined,
					        			end: endDate,
					        			allDay: allDay,
					        			productSessionId: document._id,
					        			tourDepartureType: document.product.productAvailabilityType
				        			}
				        		}
				        		monthArrays[monthNumber].push(eventObject);

				        		if (viewName == 'month') {
					        		if(parseInt(eventDate.getMonth()) == parseInt(monthNumber)) {
						        		listObject = {
						        			title: document.product.productTitle,
						        			start: eventDate,
						        			duration: document.product.productDuration ? document.product.productDuration + '&nbsp' + document.product.productDurationType : 'duration not provided',
						        			tourDepartureType: document.product.productAvailabilityType,
						        			numOfBookings: bookingDetailsInCalendar,
						        			seatLimit: limit,
						        			repeatingBehavior : tourRepeatingType,
						        			percentBookingColor: colorClassForListItems,
						        			sessionId: document._id
						        		}
					        			monthListArrays[monthNumber].push(listObject);
					        		}
					        	} else if (viewName == 'agendaWeek') {
					        		if (eventDate.getTime() >= fromDate.getTime() && eventDate.getTime() <= toDate.getTime()) {
					        			listObject = {
						        			title: document.product.productTitle,
						        			start: eventDate,
						        			duration: document.product.productDuration ? document.product.productDuration + '&nbsp' + document.product.productDurationType : 'duration not provided',
						        			tourDepartureType: document.product.productAvailabilityType,
						        			numOfBookings: bookingDetailsInCalendar,
						        			seatLimit: limit,
						        			repeatingBehavior : tourRepeatingType,
						        			percentBookingColor: colorClassForListItems,
						        			sessionId: document._id
						        		}
					        			monthListArrays[monthNumber].push(listObject);
					        		}
					        	} else {
					        		if (eventDate.getTime() == theDate.getTime()) {
					        			listObject = {
						        			title: document.product.productTitle,
						        			start: eventDate,
						        			duration: document.product.productDuration ? document.product.productDuration + '&nbsp' + document.product.productDurationType : 'duration not provided',
						        			tourDepartureType: document.product.productAvailabilityType,
						        			numOfBookings: bookingDetailsInCalendar,
						        			seatLimit: limit,
						        			repeatingBehavior : tourRepeatingType,
						        			percentBookingColor: colorClassForListItems,
						        			sessionId: document._id
						        		}
					        			monthListArrays[monthNumber].push(listObject);
					        		}
					        	}      
					        }
				        	eventDate = new Date (eventDate);
				        	eventDate = eventDate.setDate(eventDate.getDate() + 1);
				        	eventDate = new Date (eventDate);
			        	}
		        	}
	        	});
				$('#calendar').fullCalendar( 'removeEvents', function(event) {
					return true;
				});
				$('#calendar').fullCalendar( 'addEventSource', monthArrays[monthNumber]);
				
				var $scope = angular.element('#calendar').scope();
			    $scope.$evalAsync(function() {
			        angular.element('#calendar').scope().productSessions = monthListArrays[monthNumber];
			        angular.element('#calendar').scope().listViewMonthTitle = $('#calendar').fullCalendar('getView').title;
			        $('#loadingDivHostSide').css('display', 'none');
        			$('#tourgeckoBody').removeClass('waitCursor');
			    });
	      	}
	    });
	} else {
		$('#calendar').fullCalendar( 'removeEvents', function(event) {
			return true;
		});
		$('#calendar').fullCalendar( 'addEventSource', monthArrays[monthNumber] );
		var $scope = angular.element('#calendar').scope();
	    $scope.$evalAsync(function() {
	        angular.element('#calendar').scope().productSessions = monthListArrays[monthNumber];
	        angular.element('#calendar').scope().listViewMonthTitle = $('#calendar').fullCalendar('getView').title;
	        $('#loadingDivHostSide').css('display', 'none');
			$('#tourgeckoBody').removeClass('waitCursor');
	    });
	}
}