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

var date = new Date();
var month = date.getMonth();
$('#calendar').fullCalendar({
	header: {
		left: 'prev,next today',
		center: 'title',
		right: 'month,agendaWeek,agendaDay'
	},
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
		var uniqueString = monthNameToNumber.get(view.title.split(' ')[0]).toString() + view.title.split(' ')[1];
		fetchGivenMonthEvents(uniqueString, monthNameToNumber.get(view.title.split(' ')[0]));
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
		var bookings = $(jsEvent.currentTarget).find(".lbreak").text().split("/")[0]+" Bookings";
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
		$('#eventUrl').attr('href','host/tour/' + event.productSessionId + '/bookings/');
		$('#fullCalModal').modal();
	}
});

function fetchGivenMonthEvents(uniqueString, monthNumber) {	
	if(monthArrays[monthNumber].length == 0) {
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
		        		
			        		if (document.sessionDepartureDetails.repeatBehavior == 'Repeat Daily' && document.sessionDepartureDetails.notRepeatOnDays) {
						      	for (var index = 0; index < document.sessionDepartureDetails.notRepeatOnDays.length; index++)
						        	notAllowedDays.add(weekDaysNumber.get(document.sessionDepartureDetails.notRepeatOnDays[index]));
						    }
						    if (document.sessionDepartureDetails.repeatBehavior == 'Repeat Weekly' && document.sessionDepartureDetails.repeatOnDays) {
						      	for (var index = 0; index < document.sessionDepartureDetails.repeatOnDays.length; index++)
						        	allowedDays.add(weekDaysNumber.get(document.sessionDepartureDetails.repeatOnDays[index]));
						    }
						}
		        		var eventDate = new Date(document.sessionDepartureDetails.startDate);
		        		for (var index = 0; index <= repeatedDays; index ++) {
		        			var needToSave = true;
		        			if(document.sessionDepartureDetails.repeatBehavior == 'Repeat Daily' && notAllowedDays.has(eventDate.getDay()) ||
				        		document.sessionDepartureDetails.repeatBehavior == 'Repeat Weekly' && !allowedDays.has(eventDate.getDay()) ||
				        		eventDate > firstDate)
				        		needToSave = false;

		        			if (needToSave) {
		        				var endDate = angular.copy(eventDate);

				        		if (document.product.productDuration !== undefined && document.product.productDurationType == 'Days')
				        			endDate.setDate(endDate.getDate() + document.product.productDuration);
		        				var limit;
		        				var percentBooking = 'NA';
		        				var numOfSeatsKey = eventDate.getTime();
				        		if(document.product.productAvailabilityType == 'Open Date')
				        			limit = '-';
				        		else {
				        			if (document.product.productSeatsLimitType == 'unlimited')
					        			limit = 'No Limit';
					        		else {
					        			if (document.product.productSeatLimit) {
					        				limit = document.product.productSeatLimit;
					        				if (document.numberOfSeats && document.numberOfSeats[numOfSeatsKey])
					        					percentBooking = parseInt(document.numberOfSeats[numOfSeatsKey]) / parseInt(limit) * 100;
					        			} else
					        			 	limit = '-';
					        		}
				        		}
		        				var eventObject;
		        				var colorSelectionAndTitle;
		        				var colorSelectionAndTitleForMobile;
		        				var bookingDetailsInCalendar;
		        				if (document.numberOfSeats && document.numberOfSeats[numOfSeatsKey])
		        					bookingDetailsInCalendar = document.numberOfSeats[numOfSeatsKey];
		        				else
		        					bookingDetailsInCalendar = 0;
		        				if (percentBooking != 'NA') {
		        					if (percentBooking <= 40) {
		        						colorSelectionAndTitle = '<span class="eventname greenFC">' +
						        			document.product.productTitle + '</span> <br>' +
						        			'<span class="lbreak"><i class="zmdi zmdi-circle greenFC"></i>' +
						        			'<i class="zmdi zmdi-account"></i> &nbsp; ' + bookingDetailsInCalendar + '/' +limit +'</span>';
						        		colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle greenFC"><span class="eventname greenFC"></span></i>';
		        					} else if (percentBooking > 40 && percentBooking <= 80) {
		        						colorSelectionAndTitle = '<span class="eventname orangeFC">' + 
						        			document.product.productTitle + '</span> <br>' + 
						        			'<span class="lbreak"><i class="zmdi zmdi-circle orangeFC"></i>' + 
						        			'<i class="zmdi zmdi-account"></i> &nbsp;' + bookingDetailsInCalendar + '/' +limit +'</span>';
						        		colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle orangeFC"><span class="eventname orangeFC"></span></i>';
		        					} else {
		        						colorSelectionAndTitle = '<span class="eventname redFC">' +
					        				document.product.productTitle + '</span> <br>' +
					        				'<span class="lbreak"><i class="zmdi zmdi-circle redFC"></i>' + 
					        				'<i class="zmdi zmdi-account"></i> &nbsp;' + bookingDetailsInCalendar + '/' +limit +'</span>';
					        			colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle redFC"><span class="eventname redFC"></span></i>';
		        					}

		        				} else {
		        					colorSelectionAndTitle = '<span class="eventname greenFC">' +
						        			document.product.productTitle + '</span> <br>' +
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
					        			productSessionId: document._id,
					        			tourDepartureType: document.product.productAvailabilityType
				        			}
				        		}
				        		monthArrays[monthNumber].push(eventObject);					        
					        }
				        	eventDate = new Date (eventDate);
				        	eventDate = eventDate.setDate(eventDate.getDate() + 1);
				        	eventDate = new Date (eventDate);
			        	}
		        	}
	        	});
				$('#loaderForCalendarSideNav').hide();
				$('#loaderForCalendarHomePage').hide();
				$('#calendar').fullCalendar( 'removeEvents', function(event) {
					return true;
				});
				$('#calendar').fullCalendar( 'addEventSource', monthArrays[monthNumber]);
	      	}
	    });
	} else {
		$('#calendar').fullCalendar( 'removeEvents', function(event) {
			return true;
		});
		$('#calendar').fullCalendar( 'addEventSource', monthArrays[monthNumber] );
	}
}