$(document).ready(function() {
	var events = [];
	$.ajax({
      	url:'/api/host/companyproductsessions/',
        type:'GET',
        dataType: 'json',
      	success: function( json ) {
	      	var cssCounter = 0;
	      	var weekDaysNumber = new Map();
	      	weekDaysNumber.set('Sunday', 0);
	      	weekDaysNumber.set('Monday', 1);
	      	weekDaysNumber.set('Tuesday', 2);
	      	weekDaysNumber.set('Wednesday', 3);
	      	weekDaysNumber.set('Thursday', 4);
	      	weekDaysNumber.set('Friday', 5);
	      	weekDaysNumber.set('Saturday', 6);
      	
        	$.each(json, function(index, document) {
        		if(document) {
	        		var repeatedDays = 0;
	        		var notAllowedDays = new Set();
	        		var allowedDays = new Set();
        			if(document.sessionDepartureDetails.repeatBehavior == 'Repeat Daily' || document.sessionDepartureDetails.repeatBehavior == 'Repeat Weekly') {
        				var firstDate = new Date(document.sessionDepartureDetails.repeatTillDate);
	        			/*var firstDate = new Date(tempDate.getUTCFullYear(),
							tempDate.getUTCMonth(),
							tempDate.getUTCDate(),
							tempDate.getUTCHours(),
							tempDate.getUTCMinutes(),
							tempDate.getUTCSeconds());
						*/
	        			var secondDate = new Date(document.sessionDepartureDetails.startDate);
	        			/*
		        		var secondDate = new Date(tempDate.getUTCFullYear(),
							tempDate.getUTCMonth(),
							tempDate.getUTCDate(),
							tempDate.getUTCHours(),
							tempDate.getUTCMinutes(),
							tempDate.getUTCSeconds());
		        		*/
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
	        		/*eventDate = new Date(eventDate.getUTCFullYear(),
	        							eventDate.getUTCMonth(),
	        							eventDate.getUTCDate(),
	        							eventDate.getUTCHours(),
	        							eventDate.getUTCMinutes(),
	        							eventDate.getUTCSeconds());
	 				*/
	        		for (var index = 0; index <= repeatedDays; index ++) {
	        			var needToSave = true;
	        			if(document.sessionDepartureDetails.repeatBehavior == 'Repeat Daily' && notAllowedDays.has(eventDate.getDay()) ||
			        		document.sessionDepartureDetails.repeatBehavior == 'Repeat Weekly' && !allowedDays.has(eventDate.getDay()) ||
			        		eventDate > firstDate)
			        		needToSave = false;

	        			if (needToSave) {
	        				var endDate = angular.copy(eventDate);
	        				/*
	        				var endDate = new Date(eventDate.getUTCFullYear(),
	        							eventDate.getUTCMonth(),
	        							eventDate.getUTCDate(),
	        							eventDate.getUTCHours(),
	        							eventDate.getUTCMinutes(),
	        							eventDate.getUTCSeconds());
							*/

			        		if (document.product.productDuration !== undefined && document.product.productDurationType == 'Days')
			        			endDate.setDate(endDate.getDate() + document.product.productDuration);
	        				var limit;
	        				var percentBooking = 'NA';
			        		if(document.product.productAvailabilityType == 'Open Date')
			        			limit = '-';
			        		else {
			        			if (document.product.productSeatsLimitType == 'unlimited')
				        			limit = 'No Limit';
				        		else {
				        			if (document.product.productSeatLimit) {
				        				limit = document.product.productSeatLimit;
				        				percentBooking = parseInt(document.numberOfBookings) / parseInt(limit) * 100;
				        			} else
				        			 	limit = '-';
				        		}
			        		}
	        				var eventObject;
	        				var colorSelectionAndTitle;
	        				var colorSelectionAndTitleForMobile;
	        				if (percentBooking != 'NA') {
	        					if (percentBooking <= 40) {
	        						colorSelectionAndTitle = '<span class="eventname greenFC">' +
					        			document.product.productTitle + '</span> <br>' +
					        			'<span class="lbreak"><i class="zmdi zmdi-circle greenFC"></i>' +
					        			'<i class="zmdi zmdi-account"></i> &nbsp; ' + document.numberOfBookings+ '/' +limit +'</span>';
					        		colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle greenFC"><span class="eventname greenFC"></span></i>';
	        					} else if (percentBooking > 40 && percentBooking <= 80) {
	        						colorSelectionAndTitle = '<span class="eventname orangeFC">' + 
					        			document.product.productTitle + '</span> <br>' + 
					        			'<span class="lbreak"><i class="zmdi zmdi-circle orangeFC"></i>' + 
					        			'<i class="zmdi zmdi-account"></i> &nbsp;' + document.numberOfBookings + '/' +limit +'</span>';
					        		colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle orangeFC"><span class="eventname orangeFC"></span></i>';
	        					} else {
	        						colorSelectionAndTitle = '<span class="eventname redFC">' +
				        				document.product.productTitle + '</span> <br>' +
				        				'<span class="lbreak"><i class="zmdi zmdi-circle redFC"></i>' + 
				        				'<i class="zmdi zmdi-account"></i> &nbsp;' + document.numberOfBookings+ '/' +limit +'</span>';
				        			colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle redFC"><span class="eventname redFC"></span></i>';
	        					}

	        				} else {
	        					colorSelectionAndTitle = '<span class="eventname greenFC">' +
					        			document.product.productTitle + '</span> <br>' +
					        			'<span class="lbreak"><i class="zmdi zmdi-circle greenFC"></i>' +
					        			'<i class="zmdi zmdi-account"></i> &nbsp; ' + document.numberOfBookings+ '/' +limit +'</span>';
					        	colorSelectionAndTitleForMobile = '<i class="zmdi zmdi-circle greenFC"><span class="eventname greenFC"></span></i>';
	        				}

			        		if (window.innerWidth > 767)
			        			eventObject = {
			        				title: colorSelectionAndTitle,
			        				titleText: document.product.productTitle,
				        			start: eventDate,
				        			duration: document.product.productDuration ? document.product.productDuration + '&nbsp' + document.product.productDurationType : undefined,
				        			end: endDate,
				        			// allDay: true,
				        			productSessionId: document._id,
				        			backgroundColor:  '#ffe4b2'
			        			}
				        	else
				        		eventObject = {
			        				title: colorSelectionAndTitleForMobile,
			        				titleText: document.product.productTitle,
				        			start: eventDate,
				        			duration: document.product.productDuration ? document.product.productDuration + '&nbsp' + document.product.productDurationType : undefined,
				        			end: endDate,
				        			// allDay: true,
				        			productSessionId: document._id
			        			}	
			        		events.push	(eventObject);
			        		cssCounter++;
				        
				        }
			        	eventDate = new Date (eventDate);
			        	eventDate = eventDate.setDate(eventDate.getDate() + 1);
			        	eventDate = new Date (eventDate);
		        	}
	        	}
        	});
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
				events: events,
				eventRender: function (event, element) {
					element.find('.fc-title').html(event.title);
				},
				eventClick:  function(event, jsEvent, view) {
					// Array of months to convert month from number to month name
					var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
					
					// Convert start date in ISO format Date to show
					var startDate = new Date(event._start._i);
					// startDate.setDate(startDate.getDate() - 1);
					var showDate = startDate.getDate() + " " + months[startDate.getMonth()];


					var duration = event.duration === undefined ? 'Duration not provided' :  event.duration;
					
					// Name of the tour or event
					var event_name = event.titleText; //$(jsEvent.currentTarget).find(".eventname").text();

					// CSS of event
					var event_color = $(jsEvent.currentTarget).find(".eventname").attr("class").split(" ")[1];


					// Booking data will come here
					var bookings = $(jsEvent.currentTarget).find(".lbreak").text().split("/")[0]+" Bookings";
				
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
										"Fixed Dates" +
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
			$('#loaderForCalendarSideNav').hide();
			$('#loaderForCalendarHomePage').hide();
      	}
    });
});