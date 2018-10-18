jQuery(function ($) {

    /* initialize the external events
        -----------------------------------------------------------------*/
    $('#external-events div.external-event').each(function () {

        // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
        // it doesn't need to have a start or end
        var eventObject = {
            title: $.trim($(this).text()) // use the element's text as the event title
        };

        // store the Event Object in the DOM element so we can get to it later
        $(this).data('eventObject', eventObject)

        // make the event draggable using jQuery UI
        $(this).draggable({
            zIndex: 999,
            revert: true,      // will cause the event to go back to its
            revertDuration: 0  //  original position after the drag
        })
    })

	/* initialize the calendar
	-----------------------------------------------------------------*/
    function Generator() { }
    Generator.prototype.rand = Math.floor(Math.random() * 26) + Date.now()
    Generator.prototype.getId = function () {
        return this.rand++
    };
    var idGen = new Generator()

    var date = new Date()
    var d = date.getDate()
    var m = date.getMonth()
    var y = date.getFullYear()

    var isClicked = false
    var isDblClicked = false

    var calendar = $('#calendar').fullCalendar({
        //isRTL: true,
        buttonHtml: {
            prev: '<i class="ace-icon fa fa-chevron-left"></i>',
            next: '<i class="ace-icon fa fa-chevron-right"></i>'
        },

        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaDay'
        },
        eventConstraint: {
            start: moment().startOf('day'),
            end: moment(moment().startOf('day'), 'MM-DD-YYY').add('days', 365)
        },
        selectConstraint: {
            start: moment().startOf('day'),
            end: moment(moment().startOf('day'), 'MM-DD-YYY').add('days', 365)
        },
        longPressDelay: 1000,
        nowIndicator: true, // place timeline in day mode
        now: date, // assign time to calendar
        editable: true, // allows to edit event
        droppable: true, // this allows things to be dropped onto the calendar !!!
        navLinks: true, // allows navigate to day mode when click number of day
        displayEventEnd: true,
        timeFormat: 'H:mm',
        selectable: true,
        eventLimit: true,
        drop: function (date, allDay, ui, resourceId) { // this function is called when something is dropped

            // retrieve the dropped element's stored Event Object
            var originalEventObject = $(this).data('eventObject')
            var $extraEventClass = $(this).attr('data-class')


            // we need to copy it, so that multiple events don't have a reference to the same object
            var copiedEventObject = $.extend({}, originalEventObject)

            // assign it the date that was reported
            copiedEventObject.start = date
            copiedEventObject.allDay = true
            if (copiedEventObject.end == null && resourceId.type == 'agendaDay') {
                copiedEventObject.end = new Date(date._d.getTime() + 7200000)
                copiedEventObject.allDay = false
            }
            if ($extraEventClass) copiedEventObject['className'] = [$extraEventClass]
            copiedEventObject.id = idGen.getId()
            // Check time event
            createEvent = true
            var newEventStart = date._d.getTime()
            var newEventClass = copiedEventObject.className[0]
            var newEvent = ''
            var existingEvents = $("#calendar").fullCalendar("clientEvents", function (evt) {
            newEvent = false
            var oldEventStart = evt.start._d.getTime()       
            if (resourceId.type == 'agendaDay') {
                if (evt.end) {
                    var oldEventEnd = evt.end._d.getTime()
                    if (newEventStart >= oldEventStart && oldEventEnd > newEventStart) { newEvent = true }
                    else if (copiedEventObject.end) { 
                        var newEventEnd = copiedEventObject.end.getTime()
                        if (newEventEnd > oldEventStart && newEventEnd <= oldEventEnd) { newEvent = true }
                    }
                }
                else if (copiedEventObject.end) { 
                    var newEventEnd = copiedEventObject.end.getTime()
                    if (newEventEnd > oldEventStart && newEventEnd <= oldEventEnd) { newEvent = true }
                    else if (evt.allDay) {
                        if (oldEventStart < newEventStart && newEventEnd < (oldEventStart + 86399999)) { newEvent = true }
                    }   
                }
                else if (newEventStart <= oldEventStart && oldEventEnd > oldEventStart) { newEvent = true }   
            }
            else if (evt.end) {
                var oldEventEnd = evt.end._d.getTime()
                if (oldEventStart <= newEventStart && newEventStart < oldEventEnd) { newEvent = true }
                //else if 
                else if (copiedEventObject.allDay) {
                    if (newEventStart < oldEventStart && oldEventEnd < (newEventStart + 86399999)) { newEvent = true }
                }
            }
            else if (moment(evt.start._d).isSame(date._d)) { newEvent = true }

            if (newEvent && evt.className[0] == newEventClass) {
                return true
                } else {
                createEvent = true
                return false
                }
            })
            if (existingEvents.length >= 1) { createEvent = false }

            // Add Event to mysql    
            if (copiedEventObject.title !== null && createEvent) {
                var data = {}
                data.id = copiedEventObject.id
                data.state = 'write'
                data.title = 'ไม่ใส่รายละเอียด'
                data.userName = $('#username').text()
                if (copiedEventObject.start !== null) {
                    if (copiedEventObject.start._d !== null) {
                        data.start = date._d
                    }
                }
                else {
                    data.start = null
                }
                if (copiedEventObject.end !== null) {
                    data.end = copiedEventObject.end
                }
                if (copiedEventObject.className !== null) {
                    data.className = copiedEventObject.className[0]
                }
                if (copiedEventObject.allDay) {
                    data.allDay = true
                } else {
                    data.allDay = false
                }
                if (data !== null) {
                    $.ajax({
                        url: '/proc',
                        type: "POST",
                        async: false,
                        contentType: 'application/json',
                        data: JSON.stringify(data)
                    });
                }
                $.ajax({
                    url: '/proc',
                    type: "POST",
                    async: false,
                    data: { state: 'getevent', id: data.id, userName: data.userName },
                    success: function (data) {
                        console.log(data[0])
                        $('#calendar').fullCalendar('renderEvent', data[0])
                    }
                })
            }
        },
        eventDrop: function (event) { // this function is called when drop events
            if (event.allDay == false && event.end == null) { 
                event.end = new Date(event.start._d.getTime())
                $('#calendar').fullCalendar('updateEvent', event) 
            }
            createEvent = true
            var newEventStart = event.start._d.getTime()
            var newEventClass = event.className[0]
            var existingEvents = $("#calendar").fullCalendar("clientEvents", function (evt) {
            newEvent = false
            var oldEventStart = evt.start._d.getTime()
            if (evt.className[0] == newEventClass) {
                if (event.source.calendar.view.type == 'agendaDay') {
                    if (evt.end && event.end) {
                        var newEventEnd = event.end._d.getTime() , oldEventEnd = evt.end._d.getTime()
                        if (newEventStart < oldEventStart && newEventEnd > oldEventStart) { newEvent = true }
                        if (newEventStart > oldEventStart && newEventStart < oldEventEnd) { newEvent = true }
                    }
                }
                else if (event.end) {
                    var newEventEnd = event.end._d.getTime()
                    if (evt.allDay) {
                        if (oldEventStart < newEventStart && newEventEnd < (oldEventStart + 86399999)) { newEvent = true }
                        if (oldEventStart == newEventStart && newEventEnd > (oldEventStart + 86399999)) { newEvent = true }
                    }
                    else if (evt.end) {
                        var oldEventEnd = evt.end._d.getTime()
                        if (newEventStart >= oldEventStart && oldEventEnd > newEventStart) { newEvent = true }
                        else if (newEventEnd > oldEventStart && newEventEnd <= oldEventEnd) { newEvent = true }
                        else if (newEventStart <= oldEventStart && oldEventEnd > oldEventStart) { newEvent = true }
                    }
                    else if (oldEventStart > newEventStart && newEventEnd > oldEventStart) { newEvent = true }
                }
                else if (evt.end) {
                    var oldEventEnd = evt.end._d.getTime();
                    if (oldEventStart <= newEventStart && newEventStart < oldEventEnd) { newEvent = true }
                    else if (event.allDay) {
                        if (newEventStart <= oldEventStart && oldEventEnd < (newEventStart + 86399999)) { newEvent = true }
                    }
                }
                else if (moment(evt.start._d).isSame(event.start._d)) { newEvent = true }
            }

            if (newEvent) {
                return true
            } else {
                return false
            }
            })
            var reCreateEvent = ''
            if (existingEvents.length >= 1) $("#calendar").fullCalendar("removeEvents", function (evt) {
                if (evt.id == event.id) {
                    createEvent = false;
                    $.ajax({
                        url: '/proc',
                        type: "POST",
                        async: false,
                        data: { state: 'getevent', id: event.id, userName: $('#username').text() },
                        success: function (data) {
                            reCreateEvent = data[0]
                        }
                    })
                    return true
                } else { createEvent = true }
            })
            if (!createEvent) { $('#calendar').fullCalendar('renderEvent', reCreateEvent) }
            if (event.title !== null && createEvent) {
                var data = {}
                data.title = event.title
                data.id = event.id
                data.state = 'move'
                data.userName = $('#username').text()
                if (event.start !== null) {
                    if (event.start._d !== null) {
                        data.start = event.start._d
                    }
                }
                else {
                    data.start = null
                }
                if (event.end !== null) {
                    if (event.end._d !== null) {
                        data.end = event.end._d
                    }
                }
                else {
                    data.end = null
                }
                if (event.allDay) {
                    data.allDay = true
                }
                if (event.className !== null) {
                    data.className = event.className[0]
                }
                if (data !== null) {
                    $.ajax({
                        url: '/proc',
                        type: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify(data)
                    });
                }
            }
        },
        eventResize: function (event) { // this function is called when resize events
            createEvent = true
            var newEventStart = event.start._d.getTime()
            var newEventClass = event.className[0]
            var newEvent = ''
            var existingEvents = $("#calendar").fullCalendar("clientEvents", function (evt) {
                var oldEventStart = evt.start._d.getTime()
                if (evt.end) {
                    var oldEventEnd = evt.end._d.getTime()
                    if (event.end) {
                        var newEventEnd = event.end._d.getTime()
                        if (oldEventStart >= newEventStart && newEventEnd >= oldEventEnd) { newEvent = true }
                        else if (oldEventStart <= newEventStart && newEventStart < oldEventEnd) { newEvent = true }
                        else if (oldEventStart < newEventEnd && newEventEnd <= oldEventEnd) { newEvent = true }
                        else { newEvent = false; }
                    }
                    else if (oldEventStart <= newEventStart && newEventStart < oldEventEnd) { newEvent = true }
                    else { newEvent = false }
                }
                else if (event.end) {
                    var newEventEnd = event.end._d.getTime()
                    if (oldEventStart > newEventStart && newEventEnd > oldEventStart) { newEvent = true }
                    else { newEvent = false }
                }
                else {
                    if (moment(evt.start._d).isSame(event.start._d)) { newEvent = true }
                    else { newEvent = false }
                }
                if (newEvent && evt.className[0] == newEventClass) {
                    return true
                } else {
                    return false
                }
            })
            var reCreateEvent = ''
            if (existingEvents.length > 1) $("#calendar").fullCalendar("removeEvents", function (evt) {
                if (evt.id == event.id) {
                    createEvent = false
                    $.ajax({
                        url: '/proc',
                        type: "POST",
                        async: false,
                        data: { state: 'getevent', id: event.id, userName: $('#username').text() },
                        success: function (data) {
                            reCreateEvent = data[0]
                        }
                    })
                    return true
                } else { createEvent = true }
            })
            if (!createEvent) { $('#calendar').fullCalendar('renderEvent', reCreateEvent) }
            if (event.title !== null && createEvent) {
                var data = {}
                data.title = event.title
                data.id = event.id
                data.state = 'resize'
                data.userName = $('#username').text()
                if (event.start !== null) {
                    if (event.start._d !== null) {
                        data.start = event.start._d
                    }
                }
                else {
                    data.start = null
                }
                if (event.end !== null) {
                    if (event.end._d !== null) {
                        data.end = event.end._d
                    }
                }
                else {
                    data.end = null
                }
                if (event.allDay) {
                    data.allDay = true
                }
                if (event.className !== null) {
                    data.className = event.className[0]
                }
                if (data !== null) {
                    $.ajax({
                        url: '/proc',
                        type: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify(data)
                    })
                }
            }
        },
        eventMouseover: function (calEvent) { // this function is called when move mouse over event
            var tooltip =
                '<div class="tooltip">\
                <div class="tooltip-inner">จองโดย ' + calEvent.userName + '\
                </div>\
            </div>'
            var $tooltip = $(tooltip).appendTo('body')

            $(this).mouseover(function (e) {
                $(this).css('z-index', 10000)
                $tooltip.fadeIn('500')
                $tooltip.fadeTo('10', 1.9)
            }).mousemove(function (e) {
                $tooltip.css('top', e.pageY + 10)
                $tooltip.css('left', e.pageX + 20)
            })
        },
        eventMouseout: function () { // this function is called when move cursur out of events
            $(this).css('z-index', 8)
            $('.tooltip').remove()
        },
        viewRender: function(view,element) {
            if (view.type == "month" || view.type == "agendaWeek") {
                $('#username').text()
                $('#calendar').fullCalendar( 'removeEvents', function(e){ return !e.isUserCreated})
                start = view.start._i/1000
                end = view.end._i/1000
                $.ajax({
                    url: '/proc',
                    type: "POST",
                    dataType: 'json',
                    async: false,
                    data: {
                        'userName': $('#username').text(),
                        'state': 'load',
                        'start': start,
                        'end': end
                    },
                    success: function (data) {
                        $('#calendar').fullCalendar('renderEvents', data)
                    }
                })
            }
        },
        eventClick: function (calEvent) { // this function is called when clicked event  
            if ($('#username').text() === calEvent.userName) {
                var modal =
                    '<div class="modal fade">\
			  <div class="modal-dialog">\
			   <div class="modal-content">\
				 <div class="modal-body">\
				   <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
				   <form class="no-margin">\
					  <label>แก้หัวข้อ &nbsp;</label>\
					  <input class="middle" autocomplete="off" type="text" placeholder="' + calEvent.title + '"/>\
					  <button type="submit" class="btn btn-sm btn-success"><i class="ace-icon fa fa-check"></i> Save</button>\
				   </form>\
				 </div>\
				 <div class="modal-footer">\
                    <div class="btn btn-sm btn-info">จองโดย ' + calEvent.userName + '</div>\
					<button type="button" class="btn btn-sm btn-danger" data-action="delete"><i class="ace-icon fa fa-trash-o"></i> Delete Event</button>\
					<button type="button" class="btn btn-sm" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> Cancel</button>\
				 </div>\
			  </div>\
			 </div>\
			</div>'

                var modal = $(modal).appendTo('body')
                modal.find('form').on('submit', function (ev) {
                    ev.preventDefault()

                    calEvent.title = $(this).find("input[type=text]").val()
                    if (calEvent.title == '') { calEvent.title = $(this).find("input[type=text]").attr('placeholder') }
                    calendar.fullCalendar('updateEvent', calEvent)
                    if (calEvent.title !== null) {
                        var data = {}
                        data.state = 'edit'
                        data.id = calEvent.id
                        data.title = calEvent.title
                        data.userName = $('#username').text()
                        if (calEvent.start !== null) {
                            if (calEvent.start._d !== null) {
                                data.start = calEvent.start._d
                            }
                        }
                        else {
                            data.start = null
                        }
                        if (calEvent.end !== null) {
                            if (calEvent.end._d !== null) {
                                data.end = calEvent.end._d
                            }
                        }
                        else {
                            data.end = null
                        }
                        if (calEvent.allDay) {
                            data.allDay = true
                        }
                        if (calEvent.className !== null) {
                            data.className = calEvent.className
                        }
                        if (data !== null) {
                            $.ajax({
                                url: '/proc',
                                type: "POST",
                                contentType: 'application/json',
                                data: JSON.stringify(data)
                            })
                        }
                    }
                    modal.modal("hide")
                });
                modal.find('button[data-action=delete]').on('click', function () {
                    calendar.fullCalendar('removeEvents', function (ev) {
                        if ($('#username').text()) return (ev.id == calEvent.id)
                    })
                    if (calEvent.title !== null) {
                        var data = {}
                        data.state = 'remove'
                        data.id = calEvent.id
                        data.title = calEvent.title
                        data.userName = $('#username').text()
                        if (calEvent.start !== null) {
                            if (calEvent.start._d !== null) {
                                data.start = calEvent.start._d
                            }
                        }
                        else {
                            data.start = null
                        }
                        if (calEvent.end !== null) {
                            if (calEvent.end._d !== null) {
                                data.end = calEvent.end._d;
                            }
                        }
                        else {
                            data.end = null
                        }
                        if (calEvent.allDay) {
                            data.allDay = true
                        }
                        if (calEvent.className !== null) {
                            data.className = calEvent.className
                        }
                        if (data !== null) {
                            $.ajax({
                                url: '/proc',
                                type: "POST",
                                contentType: 'application/json',
                                data: JSON.stringify(data)
                            })
                        }
                    }
                    modal.modal("hide")
                })

                modal.modal('show').on('hidden', function () {
                    modal.remove()
                })
            }
        }
    })
})