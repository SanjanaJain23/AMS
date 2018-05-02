	// Change index to log as other team meambers 
	var loggedInIndex = 1;

	// Onchange of date get dynamic data and refill form
	function updateFromDate(e) {

	    var currentDate = e.target.value;
	    document.getElementById('toDate').value = currentDate;
	    document.getElementById('toDate').setAttribute("min", currentDate);

	    // Remove and reset data on date selection
	    $("#dynamicEle p").remove();
	    $("#units").addClass("hideEle");
	    $("#typeOfLeave").val("");
	    $('#allDay').prop('checked', true);

	    // After 3 months cant apply Training or vaction
	    var timestamp = new Date().getTime() + (91.2501 * 24 * 60 * 60 * 1000)
	    var next3MonthsDate = new Date(timestamp).toISOString().substring(0, 10);
	    if (currentDate > next3MonthsDate) {
	        $('#typeOfLeave option[value="T"]').hide();
	        $('#typeOfLeave option[value="V"]').hide();
	    } else {
	        $('#typeOfLeave option[value="T"]').show();
	        $('#typeOfLeave option[value="V"]').show();
	    }

	    getData(function(result) {
	        var uniqueNames = [];
	        $.each(result, function(k, v) {
	            if (v.id != loggedInIndex) {
	                if (currentDate === v.start) {
	                	// Display overlapping of leave by other team meambers
	                    uniqueNames += v.name + " , ";
	                    var names = uniqueNames.slice(0, -1);
	                    $("#dynamicEle p").remove();
	                    $("#dynamicEle").append('<p> Leave applied by : ' + names.slice(0, -1) + '</p>');
	                }
	            } else if (v.id == loggedInIndex) {
	            	// Based on loggedin user applied leave data
	                if (currentDate === v.start) {

	                    $("#fromDate").val(v.start);
	                    if (v.end) {
	                        var endDate = v.end;
	                        document.getElementById('toDate').value = endDate.split("T")[0];
	                    } else {
	                        document.getElementById('toDate').value = v.start;
	                    }

	                    // Assign value and unit 
	                    $("#typeOfLeave").val(v.value);
	                    $("#unitsInAmPm").val(v.unit);

	                    // Uncheck and check allday 
	                    if (v.unit) {
	                        $("#units").removeClass("hideEle");
	                        $('#allDay').prop('checked', false);
	                    } else {
	                        $("#units").addClass("hideEle");
	                        $('#allDay').prop('checked', true);
	                    }
	                }
	            }
	        }) // End of each
	    })

	}

	// Initialise calendar with all users leave data
	function calenderInit() {
	    $('#calendar').fullCalendar({
	        weekends: false,
	        fixedWeekCount: false,
	        titleFormat: 'MMM YYYY',
	        eventLimit: true, // for all non-agenda views
	        views: {
	            agenda: {
	                eventLimit: 3 // adjust to 6 only for agendaWeek/agendaDay
	            }
	        },
	        events: 'data.json',
	        eventRender: function(event, element) {
	            var name = event.name
	            name = name.split(" ");
	            element.find('.fc-title').append(name[0] + " ( " + event.value + " ) ");
	        },
	        eventAfterRender: function(event, element, view) {
	            if (event.unit == "AM") {
	                // set width of element
	                jQuery(element).css('width', 50 + "%");
	            } else if (event.unit == "PM") {
	                // set width of element
	                jQuery(element).css('width', 50 + "%");
	                jQuery(element).css('float', 'right');
	            }
	        }

	    })

	};

	// Get json data
	function getData(callback) {
	    var data;
	    $.ajax({
	        url: 'data.json',
	        async: false,
	        success: function(result) {
	            data = result;
	            callback(data);
	        },
	        error: function() {}
	    });

	}

	// Populate team members list dynamically
	function populateTM() {
	    getData(function(result) {
	        var uniqueNames = [];
	        $.each(result, function(k, v) {
	            if ($.inArray(v.name, uniqueNames) === -1) {
	                uniqueNames.push(v.name);
	                $(".tm-wrapper select").append('<option  id="' + v.id + '" val="' + v.id + '">' + v.name + '</option>')
	            }
	        })
	        // Keep loggedin user selected as default
	        $("#tmSelect").prop("selectedIndex", loggedInIndex);
	    });
	}
	populateTM();

	// On team members selection initialise the calendar
	function teamMemberCalendar(index) {
	    $('#calendar').fullCalendar('destroy');
	    if (index != '0') {
	        var events = [];
	        getData(function(result) {
	            $.each(result, function(k, v) {
	                if (v.id === index) {
	                    events.push({
	                        "id": v.id,
	                        "name": v.name,
	                        "date": v.date,
	                        "start": v.start,
	                        "end": v.end,
	                        "unit": v.unit,
	                        "value": v.value
	                    })
	                }

	            })
	            $('#calendar').fullCalendar({
	                weekends: false,

	                titleFormat: 'MMM YYYY',
	                fixedWeekCount: false,
	                events: events,
	                eventRender: function(event, element) {
	                    var name = event.name
	                    name = name.split(" ");
	                    element.find('.fc-title').append(name[0] + " ( " + event.value + " ) ");
	                },
	                eventAfterRender: function(event, element, view) {
	                    if (event.unit == "AM") {
	                        // set width of element
	                        jQuery(element).css('width', 50 + "%");
	                    } else if (event.unit == "PM") {
	                        // set width of element
	                        jQuery(element).css('width', 50 + "%");
	                        jQuery(element).css('float', 'right');
	                    }
	                }

	            })
	        });


	    } else {
	        calenderInit();
	    }
	}

	$(document).ready(function() {

	    // Fancybox init on page load
	    $('.fancybox').on('click', function() {
	        $.fancybox([{
	            href: '#fancybox-popup-form'
	        }]);
	    });

	    // Callback for default selected index as loggedin
	    teamMemberCalendar(loggedInIndex);

	    //Set todays date by default, min and max date in date picker
	    var d = new Date();
	    var year = d.getFullYear();
	    var month = d.getMonth();
	    var day = d.getDate();
	    var todaysDate = new Date().toISOString().substring(0, 10);
	    var maxDate = new Date(year + 1, month, day).toISOString().substring(0, 10)

	    document.getElementById('fromDate').value = todaysDate;
	    document.getElementById('fromDate').setAttribute("min", todaysDate);
	    document.getElementById('fromDate').setAttribute("max", maxDate);

	    document.getElementById('toDate').value = todaysDate;
	    document.getElementById('toDate').setAttribute("min", todaysDate);
	    document.getElementById('toDate').setAttribute("max", maxDate);


	    // Open units element if allDay is not checked
	    $('#allDay').on('click', function() {
	        if (!$(this).is(':checked')) {
	            $("#units").removeClass("hideEle");
	        } else {
	            $("#units").addClass("hideEle");
	        }
	    });

	    //Submit leave form
	    $("#submitLeave").on("click", function() {
	        console.log("Serialised form data : ",$('#leaveForm').serialize());
	        console.log("SERVER UPDATE REQUEST");
	        return false;
	    });

	});
