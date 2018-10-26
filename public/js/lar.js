jQuery(function($) {

/* initialize the external events
	-----------------------------------------------------------------*/
	$('#external-events div.external-event').each(function() {

		// create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
		// it doesn't need to have a start or end
		var eventObject = {
            title: $.trim($(this).text()) // use the element's text as the event title
		}

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
    function constraintEvent(source,stime,etime) {

    }

    function Generator() {};
    Generator.prototype.rand =  Math.floor(Math.random() * 26) + Date.now();
    Generator.prototype.getId = function() {
        return this.rand++;
    };
    var idGen =new Generator();

    var date = new Date(),
	d = date.getDate(),
    m = date.getMonth(),
	y = date.getFullYear(),

    events = [],
    mailGroup = "",
    isClicked = false,
    isDblClicked = false

	var calendar = $('#calendar').fullCalendar({
        businessHours: {
            dow: [ 1,2,3,4,5 ], // Monday - Friday
            start: '8:00', // a start time (10am in this example)
            end: '17:00' // an end time (6pm in this example)
            //overlap: false
            //rendering: 'background'
        },
		buttonHtml: {
			prev: '<i class="ace-icon fa fa-chevron-left"></i>',
			next: '<i class="ace-icon fa fa-chevron-right"></i>'
		},
        customButtons: {
            year: {
                text: 'year',
                click: function(view) {
                    var cv = new Date(view.view.start*1000),
                    cvy = cv.getFullYear()
                    calendar.fullCalendar('changeView','basic',{
                        start: new Date(cvy,0,1,7),
                        end: new Date(cvy,11,31,7)
                    })
                }
            }
        },
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'year,month,agendaDay'
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
        dayRender: function(date, cell) {
            //cell.append('<div class="unavailable">Unavailable</div>')
            //console.log(date)
            //console.log(cell)
        },
        viewRender: function(view,element) {
            if (view.type == "month" || view.type == "agendaWeek" || view.type == "basic") {
                $('#calendar').fullCalendar( 'removeEvents', function(e){ return !e.isUserCreated})
                start = view.start._i/1000
                end = view.end._i/1000
                $.ajax({
                    url: '/proc',
                    type: "POST",
                    dataType: "json",
                    async: false,
                    data: {
                        'userName': $('#username').text(),
                        'state': 'loadl',
                        'start': start,
                        'end': end
                    },
                    success: function (data) {
                        $.each(data,function(i,item) {
                            $('#calendar').fullCalendar('renderEvent', item)
                        })
                    }
                })
            }
        },
        drop: function(date, jsEvent,ui,resourceId) { // this function is called when something is dropped
            // retrieve the dropped element's stored Event Object
			var originalEventObject = $(this).data('eventObject')
            var $extraEventClass = $(this).attr('data-class')
			
			// we need to copy it, so that multiple events don't have a reference to the same object
			var copiedEventObject = $.extend({}, originalEventObject)
			
            // assign it the date that was reported
            copiedEventObject.start = date
            copiedEventObject.allDay = true
            if (copiedEventObject.end == null && resourceId.type == 'agendaDay') { 
                copiedEventObject.end = $.fullCalendar.moment(moment(date).add(2, "h"))
                copiedEventObject.allDay = false
            }
			if($extraEventClass) copiedEventObject['className'] = [$extraEventClass]
            copiedEventObject.id = idGen.getId()
            createEvent = true
            var newEventStart = copiedEventObject.start._d.getTime()
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
                        var newEventEnd = copiedEventObject.end._d.getTime()
                        if (newEventStart < oldEventStart && newEventEnd > oldEventStart) { newEvent = true }
                    }
                }
                else if (copiedEventObject.end) { 
                    var newEventEnd = copiedEventObject.end._d.getTime()
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
                else if (copiedEventObject.allDay) {
                    if (newEventStart < oldEventStart && oldEventEnd < (newEventStart + 86399999)) { newEvent = true }
                }
            }
            else if (moment(evt.start._d).isSame(date._d)) { newEvent = true }
            if (newEvent) {
                return true
                } else {
                createEvent = true
                return false
                }
            })
            var bh = $('#calendar').fullCalendar('option', 'businessHours'),
            tddate = new Date(y,m,d,0).getTime()
            if (resourceId.type == 'agendaDay') { 
                sdTime = Number(bh.start.split(':')[0]) + Number(bh.start.split(':')[1]/60)
                edTime = Number(bh.end.split(':')[0]) + Number(bh.end.split(':')[1]/60)
                seTime = copiedEventObject.start._i[3] + copiedEventObject.start._i[4]/60
                eeTime = copiedEventObject.end._i[3]+(resourceId.type == 'agendaDay'?2:0) + copiedEventObject.end._i[4]/60
                if (seTime < sdTime) { createEvent = false }
                if (eeTime > edTime) { createEvent = false }
            }
            else if ($.inArray(date._d.getDay(),bh.dow) < 0) { createEvent = false }
            else if (tddate >= copiedEventObject.start && copiedEventObject.className != 'label-success' && copiedEventObject.className != 'label-grey') { createEvent = false }
            if (existingEvents.length > 0) { createEvent = false }
            // Add Event  
            if (copiedEventObject.title !== null && createEvent) {
                var data = {}
                data.id = copiedEventObject.id
                data.editable = 'editable'
                data.title = copiedEventObject.title
                data.userName = $('#username').text()
                data.cTime = Date.now()
                $.ajax({
                    url: '/proc',
                    type: "POST",
                    dataType: "json",
                    async: false,
                    data: { 
                        'userName':data.userName,
                        'state':'loadm' 
                    },
                    success: function(objs) {
                        data.dataid = objs.dataid
                        data.boss = objs.boss
                        data.mailGroup = objs.mailGroup
                    }
                })
                if (copiedEventObject.start !== null) {
                        data.start = copiedEventObject.start
                    }
                    else {
                        data.start = null;
                    }
                if (copiedEventObject.end != null) {
                    data.end = copiedEventObject.end
                }
                if (copiedEventObject.className !== null) {
                    data.className = copiedEventObject.className[0]
                }
                if (copiedEventObject.allDay) {
                    data.allDay = true;
                    } else {
                    data.allDay = false;
                }
                if (data !== null) {
                    $('#calendar').fullCalendar('renderEvent', data)
                }
            }
        },
        eventResize: function (event,delta,revertFunc) { // this function is called when resize events
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
                if (newEvent) {
                    return true
                } else {
                    return false
                }
            })
            var bh = $('#calendar').fullCalendar('option', 'businessHours')
            if (event.source.calendar.view.type == 'agendaDay') { 
                sdTime = Number(bh.start.split(':')[0]) + Number(bh.start.split(':')[1]/60)
                edTime = Number(bh.end.split(':')[0]) + Number(bh.end.split(':')[1]/60)
                seTime = new Date(event.start-25200000).getHours() + new Date(event.start).getMinutes()/60
                eeTime = new Date(event.end-25200000).getHours() + new Date(event.end).getMinutes()/60
                if (seTime < sdTime) { createEvent = false }
                if (eeTime > edTime) { createEvent = false }
            }
            else if ($.inArray(new Date(event.start._d).getDay(),bh.dow) < 0) { createEvent = false }
            else if (event.end) {
                if ($.inArray(new Date(event.end._d-25201000).getDay(),bh.dow) < 0) { createEvent = false }
            }
            if (existingEvents.length > 1) { createEvent = false }
            if (!createEvent) { revertFunc() }
        },
        eventDrop: function (event,delta,revertFunc) { // this function is called when drop events
            createEvent = true
            var newEventStart = event.start._d.getTime()
            var existingEvents = $("#calendar").fullCalendar("clientEvents", function (evt) {
            newEvent = false
            var oldEventStart = evt.start._d.getTime()
            if (event.source.calendar.view.type == 'agendaDay') {
                if (evt.end) {
                    var oldEventEnd = evt.end._d.getTime()
                    if (newEventStart >= oldEventStart && oldEventEnd > newEventStart) { newEvent = true }
                    else if (event.end) { 
                        var newEventEnd = event.end._d.getTime()
                        if (newEventStart < oldEventStart && newEventEnd > oldEventStart) { newEvent = true }
                    }
                }
                else if (event.end) { 
                    var newEventEnd = event.end._d.getTime()
                    if (newEventEnd > oldEventStart && newEventEnd <= oldEventEnd) { newEvent = true }
                    else if (evt.allDay) {
                        if (oldEventStart < newEventStart && newEventEnd < (oldEventStart + 86399999)) { newEvent = true }
                    }   
                }
                else if (newEventStart <= oldEventStart && oldEventEnd > oldEventStart) { newEvent = true }   
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
            else if (moment(evt.start._d).isSame(event.start._d)) { newEvent = false }            
            if (newEvent) {
                return true
            } else {
                return false
            }
            })
            var bh = $('#calendar').fullCalendar('option', 'businessHours'),
            tddate = new Date(y,m,d,0).getTime()
            if (event.source.calendar.view.type == 'agendaDay') { 
                sdTime = Number(bh.start.split(':')[0]) + Number(bh.start.split(':')[1]/60)
                edTime = Number(bh.end.split(':')[0]) + Number(bh.end.split(':')[1]/60)
                seTime = new Date(event.start-25200000).getHours() + new Date(event.start).getMinutes()/60
                eeTime = new Date(event.end-25200000).getHours() + new Date(event.end).getMinutes()/60
                if (seTime < 0) { seTime = 24-seTime }
                if (eeTime < 0) { eeTime = 24-eeTime }
                if (seTime < sdTime) { createEvent = false }
                if (eeTime > edTime) { createEvent = false }
            }
            else if ($.inArray(new Date(event.start._d).getDay(),bh.dow) < 0) { createEvent = false }
            else if (event.end) { 
                if ($.inArray(new Date(event.end._d-25201000).getDay(),bh.dow) < 0) { createEvent = false }
            }
            else if (tddate >= event.start && event.className != 'label-success' && event.className != 'label-grey') { createEvent = false }
            if (existingEvents.length > 1) { createEvent = false }
            if (!createEvent) { revertFunc() }
        },
        eventMouseover: function (calEvent, jsEvent) { // this function is called when move mouse over event
            var tooltip =
                '<div class="tooltip">\
                <div class="tooltip-inner">ลาโดย ' + calEvent.userName + '\
                </div>\
            </div>';
            var $tooltip = $(tooltip).appendTo('body');

            $(this).mouseover(function (e) {
                $(this).css('z-index', 10000);
                $tooltip.fadeIn('500');
                $tooltip.fadeTo('10', 1.9);
            }).mousemove(function (e) {
                $tooltip.css('top', e.pageY + 10);
                $tooltip.css('left', e.pageX + 20);
            });
        },

        eventMouseout: function () { // this function is called when move cursur out of events
            $(this).css('z-index', 8);
            $('.tooltip').remove();
        },
        eventClick: function(calEvent) { // this function is called when clicked event 
            option = {
                object: ['วัน','ชั่วโมง','นาที'],
                unit: ['d','h','m'],
                units: {
                d: 86400,
                h: 3600,
                m: 60
                }
            }
            function displayDuration(duration) {
                var Ans = ''
                for (var i=0;i<option.unit.length;i++) {
                    unitBase = option.unit[i]
                    if (duration[unitBase]>0) {
                        Ans = Ans + duration[unitBase] + ' ' + option.object[i] + ' '
                    }
                }
                return Ans
            }
            function getDuration(start,end) {
                duration = end-start
                Ans = []
                for (var i=0;i<option.unit.length;i++) {
                    unitBase = option.unit[i]
                    unitValue = option.units[unitBase]
                    if (unitValue < duration) {
                        Ans[unitBase] = Math.floor(duration / unitValue)
                        duration = duration % unitValue
                    }
                }
                return Ans
            }
            function duration(e) {
                if (!e.end) { return '1 วัน' }
                else {
                   var st = e.start._d.getTime()/1000, en = e.end._d.getTime()/1000,
                   du = getDuration(st,en)
                   return displayDuration(du)
                }
            }

            if ($('#username').text() === calEvent.userName && calEvent.editable) {
                if (calEvent.className == "label-grey") { larType = "ลาป่วย" }
                else if (calEvent.className == "label-success")  { larType = "ลากิจ" }
                else if (calEvent.className == "label-warning") { larType = "ลาพักร้อน" } 
                else { larType = "ลาอื่นๆ" }
            if (larType == "ลาอื่นๆ") {
                var modal = 
                '<div class="modal fade">\
                <div class="modal-dialog">\
                <div class="modal-content">\
                    <div class="modal-header">\
                    <h5 class="modal-title">'+larType+'</h5>\
                    </div>\
                    <div class="modal-body">\
                    <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
                    <form class="no-margin">\
                        <label>แก้หัวข้อ &nbsp;</label>\
                        <div class="row">\
                            <div class="col-md-6">\
                            <select class="form-control" id="larType" data-action="change">\
                                <option>ลาฝึกอบรม</option>\
                                <option>ลาทำหมัน</option>\
                                <option>ลาคลอด</option>\
                                <option>ลาอุปสมบท</option>\
                                <option>ลารับราชการทหาร</option>\
                            </select>\
                            </div>\
                            <div class="col-md-6">\<button type="submit" class="btn btn-sm btn-success"><i class="ace-icon fa fa-check"></i> Save</button></div>\
                            </div>\
                            <p class="lartype" style="padding-top: 10px">วันคงเหลือ: ' +$('td:contains('+larType+')').parents('tr').find('.dur').text()+ '</p>\
                            <p>ต้องการลา: '+duration(calEvent)+'</p>\
                        </span>\
                    </form>\
                    </div>\
                    <div class="modal-footer">\
                        <div class="btn btn-sm btn-info">เมื่อบันทึกแล้วจะไม่สามารถแก้ไขได้</div>\
                        <button type="button" class="btn btn-sm btn-danger" data-action="delete"><i class="ace-icon fa fa-trash-o"></i> Delete Event</button>\
                        <button type="button" class="btn btn-sm" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> Cancel</button>\
                    </div>\
                </div>\
                </div>\
                </div>'
            } else {
                var modal =
                '<div class="modal fade">\
                <div class="modal-dialog">\
                <div class="modal-content">\
                    <div class="modal-header">\
                    <h5 class="modal-title">'+larType+'</h5>\
                    </div>\
                    <div class="modal-body">\
                    <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
                    <form class="no-margin">\
                        <label>แก้หัวข้อ &nbsp;</label>\
                        <input class="middle" autocomplete="off" type="text" id="larType" placeholder="' + calEvent.title + '"/>\
                        <button type="submit" class="btn btn-sm btn-success"><i class="ace-icon fa fa-check"></i> Save</button>\
                        <p style="padding-top: 10px">วันคงเหลือ: ' +$('td:contains('+larType+')').parents('tr').find('.dur').text()+ '</p>\
                        <p>ต้องการใช้: '+duration(calEvent)+'</p>\
                    </form>\
                    </div>\
                    <div class="modal-footer">\
                        <div class="btn btn-sm btn-info">เมื่อบันทึกแล้วจะไม่สามารถแก้ไขได้</div>\
                        <button type="button" class="btn btn-sm btn-danger" data-action="delete"><i class="ace-icon fa fa-trash-o"></i> Delete Event</button>\
                        <button type="button" class="btn btn-sm" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> Cancel</button>\
                    </div>\
                </div>\
                </div>\
                </div>'; 
            }
                var modal = $(modal).appendTo('body');
                $(modal).on('show.bs.modal',function(e) {
                    var larload,larlist
                    $.ajax({
                        url: '/proc',
                        type: "POST",
                        dataType: "json",
                        async: false,
                        data: {
                            'state':'loads'
                        },
                        success: function(objs) {
                            larlist = objs
                        }
                    })
                    var dd = $('td:contains('+$('#larType').val()+')').parents('tr').find('.dur').text()
                    if (dd == 'undefined' || dd == "") { $('.lartype').text('วันคงเหลือ: '+larlist[$('#larType').val()]) }
                    else { $('.lartype').text('วันคงเหลือ: '+dd) }
                })
                $('select[id=larType]').on('change',function(e) {
                    var larload,larlist
                    $.ajax({
                        url: '/proc',
                        type: "POST",
                        dataType: "json",
                        async: false,
                        data: {
                            'state':'loads'
                        },
                        success: function(objs) {
                            larlist = objs
                        }
                    })
                    var dd = $('td:contains('+$(this).val()+')').parents('tr').find('.dur').text()
                    if (dd == 'undefined' || dd == "") { $('.lartype').text('วันคงเหลือ: '+larlist[$(this).val()]) }
                    else { $('.lartype').text('วันคงเหลือ: '+dd) }
                })
                modal.find('form').on('submit', function(ev){
                    ev.preventDefault()
                    calEvent.title = $(this).find("#larType").val()
                    if (calEvent.title == '') { calEvent.title = $(this).find("#larType").attr('placeholder') }
                    calEvent.editable = false
                    calendar.fullCalendar('updateEvent', calEvent)
                    if (calEvent.title !== null) {
                        var data = {};
                        data.dataid = calEvent.dataid
                        data.state = 'savelar'
                        data.id = calEvent.id
                        data.title = calEvent.title
                        data.userName = $('#username').text()
                        data.cTime = calEvent.cTime
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
                        data.boss = calEvent.boss
                        data.mailGroup = calEvent.mailGroup
                        if (data !== null) {
                            $.ajax({
                                url: '/proc',
                                type: "POST",
                                async: false,
                                contentType: 'application/json',
                                data: JSON.stringify(data),
                                success: function(data) {
                                    for (i=0;i<data.length;i++) {
                                        $('tr[class='+ data[i].a +']').find('td:nth-child(2)').text(data[i].c)
                                        $('tr[class='+ data[i].a +']').find('td:nth-child(3)').text(data[i].d)
                                        if (data[i].e) {
                                            $('tr[class='+ data[i].a +']').find('td:nth-child(3)').removeClass("bg-success").addClass("bg-danger")
                                        } else {
                                            $('tr[class='+ data[i].a +']').find('td:nth-child(3)').removeClass("bg-danger").addClass("bg-success")
                                        }
                                    }
                                }
                            })
                        }
                        $('#calendar').fullCalendar( 'removeEvents',calEvent.id)
                        calEvent.className = 'label-light'
                        calEvent.title = calEvent.title  + ' (รออนุมัติ)'
                        $('#calendar').fullCalendar( 'renderEvent',calEvent)
                    }
                    modal.modal("hide")
                })
                modal.find('button[data-action=delete]').on('click', function() {
                    calendar.fullCalendar('removeEvents' , function(ev){
                        if ($('#username').text() ) return (ev.id == calEvent.id)
                    })
                    modal.modal("hide")
                })
            
                modal.modal('show').on('hidden', function(){
                    modal.remove()
                })
            }
		}
		
	});
})