$(document).ready(function() {
	var events = [];
	$.ajax({
      url:'/api/host/companyproductsessions/',
        type:'GET',
        dataType: 'json',
      success: function( json ) {
      	var cssCounter = 0;
        $.each(json, function(index, document) {
        	if(document) {
	        	if (cssCounter == 0) {
	        		events.push	({
	        			title: '<span class="eventname orangeFC">' + 
	        			document.product.productTitle + '</span> <br>' + 
	        			'<span class="lbreak"><i class="zmdi zmdi-circle orangeFC"></i>' + 
	        			'<i class="zmdi zmdi-account"></i> &nbsp; 7/10</span>' ,
	        			start: document.sessionDepartureDetails.startDate,
	        			duration: document.sessionDepartureDetails.duration,
	        			productId: document.product._id,
	        			backgroundColor: 'rgba(237,156,40, 0.2)'
	        		});
	        		cssCounter++;
	        	} else if (cssCounter == 1) {
	        		events.push	({
	        			title: '<span class="eventname greenFC">' +
	        			document.product.productTitle + '</span> <br>' +
	        			'<span class="lbreak"><i class="zmdi zmdi-circle greenFC"></i>' +
	        			'<i class="zmdi zmdi-account"></i> &nbsp; 7/10</span>',
	        			start: document.sessionDepartureDetails.startDate,
	        			duration: document.sessionDepartureDetails.duration,
	        			productId: document.product._id,
	        			backgroundColor: 'rgba(66,174,94,0.2)'
	        		});
	        		cssCounter++;
	        	} else {
	        		events.push	({
	        			title: '<span class="eventname redFC">' +
	        			document.product.productTitle + '</span> <br>' +
	        			'<span class="lbreak"><i class="zmdi zmdi-circle redFC"></i>' + 
	        			'<i class="zmdi zmdi-account"></i> &nbsp; 7/10</span>',
	        			start: document.sessionDepartureDetails.startDate,
	        			duration: document.sessionDepartureDetails.duration,
	        			productId: document.product._id,
	        			backgroundColor: 'rgba(216,64,64,0.2)'
	        		});
	        		cssCounter = 0;
	        	}
	        }
        });
        $('#calendar').fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			},
			navLinks: true, // can click day/week names to navigate views
			selectable: true,
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
			eventLimit: true, // allow "more" link when too many events
			events: events,
			eventRender: function (event, element) {
				element.find('.fc-title').html(event.title);
			},
			eventClick:  function(event, jsEvent, view) {
				// Array of months to convert month from number to month name
				var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
				
				// Convert start date in ISO format Date to show
				var startDate = new Date(event._start._i);
				startDate.setDate(startDate.getDate() - 1);
				var showDate = startDate.getDate() + " " + months[startDate.getMonth()];

				var duration = event.duration === 'undefined Days' ? 'Duration not provided' :  event.duration;
				
				// Name of the tour or event
				var event_name = $(jsEvent.currentTarget).find(".eventname").text();

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

				window.localStorage.setItem('productId', event.productId);
				$('#calendarTourPopupTitle').html("<i class='zmdi zmdi-circle'></i> " + event_name).addClass(event_color);
				$('#calendarTourPopupBody').html(bodyHtml);
				$('#eventUrl').attr('href','host/tour/preview');
				$('#fullCalModal').modal();
			}
		});
      }
    });
});