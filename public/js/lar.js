var leaveExcept
$.ajax({
 url: '/lar/getvacation',
 type: 'GET',
 async: false,
 success: function (data) {
  leaveExcept = parseInt(data)
 }
})
var vacation = (leaveExcept * 60 * 60 * 24 * 1000)

function checkfile(sender) {
 var validExts = new Array(".pdf", ".jpg")
 var fileExt = sender.value;
 fileExt = fileExt.substring(fileExt.lastIndexOf('.')).toLowerCase()
 if (validExts.indexOf(fileExt) < 0) {
  alert("นามสกุลไฟล์ไม่ถูกต้อง สามารถแนบได้เฉพาะไฟล์: " + validExts.toString() + " เท่านั้น")
  return false
 } else {
  var file = $('#upsiwa')[0],
   data = new FormData(file)
  data.append('ext', fileExt)
  $.ajax({
   type: "POST",
   enctype: 'multipart/form-data',
   url: "/api/upload/application",
   data: data,
   processData: false, //prevent jQuery from automatically transforming the data into a query string
   contentType: false,
   cache: false,
   success: (data) => {
    var file = data.start + '' + data.ext
    $('.delfile').attr('id', file)
    if ($('.delfile').hasClass('hidethis')) {
     $('.delfile').removeClass('hidethis')
    }
    sessionStorage.setItem('attach', file)
   },
   error: (e) => {
    console.log(e.responseText)
   }
  })
  return true
 }
}

$(document).on("click", "#load-data", function () {
 window.location.replace(window.location.href + "/loaddata")
})
$(document).on("click", "#toggle-vacation", function () {
 $.ajax({
  url: '/lar/togglevacation',
  type: 'GET',
  async: false,
  success: function (data) {
   leaveExcept = parseInt(data)
  }
 })
 if (leaveExcept > 0) {
  $(this).addClass('check')
 } else {
  $(this).removeClass('check')
 }
 vacation = (leaveExcept * 60 * 60 * 24 * 1000)
})

$(document).on("click", ".viewattach", function () {
 var thisfile = $(this).attr('id'),
  thisname = $(this).attr('name')
 $.ajax({
  url: '/lar',
  type: "POST",
  async: false,
  data: {
   'state': 'viewfile',
   'thisfile': thisfile,
   'thisname': thisname
  },
  success: function (data) {
   $("#animatedModal").animatedModal({
    modalTarget: 'animatedModal',
    animatedIn: 'bounceInUp',
    animatedOut: 'bounceOutDown',
    color: '#FFFFFF',
    animationDuration: '.5s',
    beforeOpen: function () {

     var children = $(".thumb")
     var index = 0

     function addClassNextChild() {
      if (index == children.length) return;
      children.eq(index++).show().velocity("transition.slideUpIn", {
       opacity: 1,
       stagger: 450,
       defaultDuration: 100
      })
      window.setTimeout(addClassNextChild, 100)
     }
     addClassNextChild()
    },
    afterClose: function () {
     $(".thumb").hide()
     $('.showfile').empty()
    }
   })
   fileExt = data.substring(data.lastIndexOf('.')).toLowerCase()
   $('.showfile').append('<' + (fileExt == '.jpg' ? 'img' : 'iframe') + ' src="' + data + '" style="height: 100vh; width:100vh;"></iframe>')
  }
 })
})

jQuery(function ($) {
 /* initialize the external events
 	-----------------------------------------------------------------*/
 $('#external-events div.external-event').each(function () {

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
   revert: true, // will cause the event to go back to its
   revertDuration: 0 //  original position after the drag
  })
 })

 /* initialize the calendar
    -----------------------------------------------------------------*/
 function constraintEvent(source, stime, etime) {

 }

 function Generator() {}
 Generator.prototype.rand = Math.floor(Math.random() * 26) + Date.now()
 Generator.prototype.getId = function () {
  return this.rand++;
 }
 var idGen = new Generator()

 var date = moment().format(),
  d = moment(date).format('DD'),
  m = moment(date).format('MM'),
  y = moment(date).format('YYYY'),

  events = [],
  mailGroup = "",
  isClicked = false,
  isDblClicked = false

 var fcwend, fcwstart, fcwdow, ip

 $.ajax({
  url: '/proc',
  type: "POST",
  dataType: "json",
  async: false,
  data: {
   'state': 'loadacc'
  },
  success: function (data) {
   fcwend = data.fcwend
   fcwstart = data.fcwstart
   fcwdow = data.fcwdow
   ip = data.ip
  }
 })

 var calendar = $('#calendar').fullCalendar({
  businessHours: {
   dow: fcwdow, // Monday - Friday
   start: fcwstart, // a start time
   end: fcwend // an end time
   //overlap: false
   //rendering: 'background'
  },
  buttonHtml: {
   prev: '<i class="ace-icon fa fa-chevron-left"></i>',
   next: '<i class="ace-icon fa fa-chevron-right"></i>',
   reportrange: '<div id="reportrange" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%"><i class="fa fa-calendar"></i>&nbsp;<span></span> <i class="fa fa-caret-down"></i></div>'
  },
  customButtons: {
   reportrange: {
    text: "null"
   },
   report: {
    text: 'ดูรายงาน',
    click: function () {
     let reportrange = $('.fc-reportrange-button').data('daterangepicker')
     let startDate = moment(reportrange.startDate).format('YYYY-MM-DD')
     let endDate = moment(reportrange.endDate).format('YYYY-MM-DD')
     window.open('/reporttime?start=' + startDate + '&end=' + endDate, '_blank', 'location=no,menubar=no,toolbar=no')
    }
   },
   year: {
    text: 'ปี',
    click: function () {
     var cvy = parseInt($('.fc-center h2').text().split(' ')[1])
     calendar.fullCalendar('changeView', 'basic', {
      start: new Date(cvy, 0, 1, 7),
      end: new Date(cvy, 11, 32, 7)
     })
     $('.fc-prev-button').attr('disabled', 'disabled')
     $('.fc-next-button').attr('disabled', 'disabled')
    }
   }
  },
  header: {
   left: 'prev,next today reportrange,report',
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
  dayRender: function (date, el, view) {
   let row = $(el[0]).parents('.fc-row').index() + 1
   let col = el[0].cellIndex + 1
   let day = el[0].dataset.date
   let fingerscan = {}
   if (sessionStorage.fingerscan) {
    fingerscan = JSON.parse(sessionStorage.fingerscan)
    fingerscan[day] = {
     c: col,
     r: row
    }
    fingerscan = JSON.stringify(fingerscan)
   } else {
    fingerscan[day] = {
     c: col,
     r: row
    }
    fingerscan = JSON.stringify(fingerscan)
   }
   sessionStorage.setItem('fingerscan', fingerscan)

   var thisdate = []
   if (sessionStorage.date) {
    thisdate = JSON.parse(sessionStorage.date)
    thisdate.push(date._d.getTime())
    thisdate = JSON.stringify(thisdate)
   } else {
    thisdate.push(date._d.getTime())
    thisdate = JSON.stringify(thisdate)
   }
   sessionStorage.setItem('date', thisdate)
  },
  viewRender: function (view, element) {
   let endtime = view.end._i
   if (sessionStorage.attach) {
    $.ajax({
     url: '/proc',
     type: "POST",
     dataType: "json",
     async: false,
     data: {
      'state': 'delfile',
      'file': sessionStorage.attach,
      'username': $('#username').text()
     },
     success: function (objs) {
      sessionStorage.removeItem('attach')
     },
     error: (e) => {
      console.log(e.responseText)
     }
    })
   }
   $.ajax({
    url: '/lar',
    type: "POST",
    dataType: "json",
    async: false,
    data: {
     'state': 'viewrender',
     'endtime': endtime
    },
    success: function (data) {
     data.forEach(function (editlar) {
      $('tr[class=' + editlar.a + ']').find('td:nth-child(2)').text(editlar.c)
      $('tr[class=' + editlar.a + ']').find('td:nth-child(3)').text((editlar.e ? "ใช้เกิน " : '') + editlar.d)
      if (editlar.e) {
       $('tr[class=' + editlar.a + ']').find('td:nth-child(3)').removeClass('bg-success').addClass('bg-danger')
      } else {
       $('tr[class=' + editlar.a + ']').find('td:nth-child(3)').addClass('bg-success').removeClass('bg-danger')
      }
     })
    }
   })
   if (view.type == "month" || view.type == "agendaDay" || view.type == "basic") {
    $('#calendar').fullCalendar('removeEvents', function (e) {
     return !e.isUserCreated
    })
    let start = view.start._i / 1000
    let end = view.end._i / 1000
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
      $.each(data, function (i, item) {
       $('#calendar').fullCalendar('renderEvent', item)
      })
     }
    })
   }
  },
  eventAfterAllRender: function (view) {
   var listday = JSON.parse(sessionStorage.date)
   if (view.type == 'basic') {
    for (var i = 0; i < listday.length; i++) {
     thisday = new Date(listday[i])
     if (thisday.getFullYear() != view.title) {
      datewrite = thisday.getFullYear() + '-' + ("0" + (thisday.getMonth() + 1)).slice(-2) + '-' + ("0" + thisday.getDate()).slice(-2)
      $('.fc-day-top[data-date="' + datewrite + '"]').addClass('fc-other-month')
     }
    }
   }
   if (view.type == 'agendaDay') {
    $.ajax({
     url: '/lar/swaptime',
     type: "POST",
     dataType: "json",
     async: false,
     data: {
      time: (view.start._i / 1000) - 25200
     },
     success: function (fs) {
      for (const item of fs) {
       let swaptitle = item.title
       if (swaptitle.match(/\d\d:\d\d:\d\d:\d\d/)) {
        let swaptime = swaptitle.match(/\d\d/g)
        let swaptop = (swaptime[0] * 40) + ((swaptime[1] / 30) * 20)
        let swapbottom = (-(swaptime[2] * 40) + ((swaptime[3] / 30) * 20))
        swaptime = swaptitle.match(/\d\d:\d\d/g)
        let swapre = swaptime[0] + ":" + swaptime[1]
        swaptime = swaptime[0] + "-" + swaptime[1]
        swaptitle = swaptitle.replace(swapre, "")
        let swapdate = moment((item.start - 25200) * 1000).format('DD/MM/YY')
        let starttime = moment((item.start - 25200) * 1000).format('HH:mm')
        let endtime = moment((item.end - 25200) * 1000).format('HH:mm')
        let content = '<div class="fc-bgevent" style="top: ' + swaptop + 'px; bottom: ' + swapbottom + 'px; background-color: #ffff80;">' + swaptime + ' ' + swaptitle + ' ใช้ลาในวัน ' + swapdate + ' เวลา ' + starttime + '-' + endtime + '</div>'
        $('.fc-content-col .fc-bgevent-container').append(content)
       }
      }
     }
    })
   }

   // Time Scan
   let dayrender = JSON.parse(sessionStorage.fingerscan)
   if (view.type == 'month' || view.type == 'basic') {
    $.ajax({
     url: '/proc/fingerscan',
     type: "POST",
     dataType: "json",
     async: false,
     data: {
      user: $('#username').text(),
      start: moment(view.start).format("YYYY-MM-DD"),
      end: moment(view.end).format("YYYY-MM-DD")
     },
     success: function (fs) {
      for (const item in dayrender) {
       if (fs[item]) {
        let scandate = fs[item]
        let row = dayrender[item].r
        let col = dayrender[item].c
        let stime = (scandate.timestart != "00:00:00" ? scandate.timestart.substring(0, 5) : "ไม่มีข้อมูล")
        let etime = (scandate.timeend != "00:00:00" ? scandate.timeend.substring(0, 5) : "ไม่มีข้อมูล")
        let splace = (stime != 'ไม่มีข้อมูล' ? '<div class="location-scan">' + scandate.mstart + '</div>' : '')
        let eplace = (etime != 'ไม่มีข้อมูล' ? '<div class="location-scan">' + scandate.mend + '</div>' : '')
        if ($('.fc-row:nth-child(' + row + ') .fc-content-skeleton tbody tr td:nth-child(' + col + ') .fc-ltr').length == 0) {
         $('.fc-row:nth-child(' + row + ') .fc-content-skeleton tbody tr td:nth-child(' + col + ')').append('<div class="fc-ltr"><i class="fa fa-arrow-right text-success"></i> ' + stime + ' ' + splace + '</div> <div class="fc-ltr"><i class="fa fa-arrow-left text-danger"></i> ' + etime + ' ' + eplace + '</div>')
        }
       }
      }
     }
    })

    $.ajax({
     url: '/lar',
     type: "POST",
     dataType: "json",
     async: false,
     data: {
      'state': 'getvacation',
      'start': view.start._i,
      'end': view.end._i
     },
     success: async function (data) {
      var len1 = data.mydata.length,
       len2 = data.myswap.length,
       len3 = data.myattach.length,
       mylen = Math.max(len1, len2, len3)
      for (var i = 0; i < mylen; i++) {
       if (data.myswap[i]) {
        thisswapdate = data.myswap[i].swapDate * 1000
        swapfrom = data.myswap[i].start * 1000
        swaptitle = data.myswap[i].title
        if (listday.indexOf(thisswapdate)) {
         datewrite = new Date(thisswapdate).getFullYear() + '-' + ("0" + (new Date(thisswapdate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(thisswapdate).getDate()).slice(-2)
         dateread = ("0" + new Date(swapfrom).getDate()).slice(-2) + '/' + ("0" + (new Date(swapfrom).getMonth() + 1)).slice(-2) + '/' + new Date(swapfrom).getFullYear()
         if ($('.fc-bg td[data-date="' + datewrite + '"] .fc-ltr').length == 0) {
          $('.fc-bg td[data-date="' + datewrite + '"').append('<div class="swapdate"></div>')

          if (swaptitle.match(/\d\d:\d\d:\d\d:\d\d/)) {
           let swaptime = swaptitle.match(/\d\d:\d\d/g)
           let swapre = swaptime[0] + ":" + swaptime[1]
           swaptime = swaptime[0] + "-" + swaptime[1]
           swaptitle = swaptitle.replace(swapre, "")
           $('.fc-bg td[data-date="' + datewrite + '"] .swapdate').append('<div class="fc-ltr">' + swaptime + ' ' + swaptitle + ' ใช้สิทธิลาวันที่ ' + dateread)
          } else {
           $('.fc-bg td[data-date="' + datewrite + '"] .swapdate').append('<div class="fc-ltr">' + swaptitle + ' ใช้สิทธิลาวันที่ ' + dateread)
          }
         }
        }
       }
       if (data.mydata[i]) {
        thisvacation = data.mydata[i][data.wplace]
        if (listday.indexOf(thisvacation)) {
         datewrite = new Date(thisvacation).getFullYear() + '-' + ("0" + (new Date(thisvacation).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(thisvacation).getDate()).slice(-2)
         if ($('.fc-bg td[data-date="' + datewrite + '"] .vdate').length == 0) {
          $('.fc-bg td[data-date="' + datewrite + '"]').append('<div class="vdate">' + data.mydata[i].dtitle + '</div>')
         }
        }
       }
       if (data.myattach[i]) {
        thisattach = data.myattach[i].start * 1000
        if (listday.indexOf(thisattach) && data.myattach[i].fname) {
         datewrite = new Date(thisattach).getFullYear() + '-' + ("0" + (new Date(thisattach).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(thisattach).getDate()).slice(-2)
         if ($('.fc-content-skeleton td[data-date="' + datewrite + '"] .viewattach').length == 0) {
          $('.fc-content-skeleton td[data-date="' + datewrite + '"]').prepend('<a class="viewattach" style="float:left; padding: 2px;" id="' + data.myattach[i].fname + '" name="' + data.thisname + '" >เอกสารแนบ</a>')
         }
        }
       }
      }
     }
    })
   }
  },
  dayClick: function (date, jsEvent, view) {
   console.log(jsEvent)
   console.log(moment(date).format('DD-MM-YY'))
   console.log(view)
   let html = '<div class="modal fade">\
         <div class="modal-dialog">\
          <div class="modal-content">\
           <div class="modal-header">\
            <h5 class="modal-title">' + larType + '</h5>\
           </div>\
           <div class="modal-body">\
            <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
            <form method="POST" enctype="multipart/form-data" id="upsiwa">\
             <div class="hidethis"><input type="text" id="dataid" name="dataid" value="' + data.dataid + '"/></div>\
             <div class="hidethis"><input type="text" id="username" name="username" value="' + data.username + '"/></div>\
             <div class="hidethis"><input type="text" id="start" name="start" value="' + data.start + '"/></div>\
             <label>แก้หัวข้อ &nbsp;</label>\
             <div class="row">\
              <div class="col-md-6">\
               <select class="form-control" id="larType" name="larType" data-action="change">\
                <option>ลาฝึกอบรม</option>\
                <option>ลาทำหมัน</option>\
                <option>ลาคลอด</option>\
                <option>ลาอุปสมบท</option>\
                <option>ลารับราชการทหาร</option>\
               </select>\
              </div>\
              <div class="col-md-6">\
               <button type="submit" class="btn btn-sm btn-success"><i class="ace-icon fa fa-check"></i> Save</button>\
              </div>\
             </div>\
             <div class="wrapper">\
              <p style="padding: 10px 5px 0px 0px;">แนบเอกสาร (เฉพาะไฟล์ .pdf หรือ .jpg 1 ไฟล์ ):</p>\
              <div class="file-upload">\
                  <input type="file" name="file" id="file" accept=".pdf,.jpg" onchange="checkfile(this)" />\
                  <i class="fa fa-arrow-up"></i>\
              </div>\
              <div ' + (datah == 1 ? 'class="delfile"' : 'class="delfile hidethis"') + '' + (datah == 1 ? ' id="' + sessionStorage.attach + '"' : '') + '>\
                  <p style="padding: 10px 5px 0px 10px;">ลบไฟล์แนบ\
                  <i class="fa fa-close delthis"></i></p>\
              </div>\
             </div>\
             <p class="lartype">วันคงเหลือ: ' + $('td:contains(ลาฝึกอบรม)').parents('tr').find('.dur').text() + '</p>\
             <p>ต้องการลา: ' + duration(calEvent) + '</p>\
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
  },
  drop: function (date, jsEvent, ui, resourceId) { // this function is called when something is dropped
   if (sessionStorage.attach) {
    alert("กรุณาทำการลาครั้งละ 1 รายการ");
    return
   }
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
   if ($extraEventClass) copiedEventObject['className'] = [$extraEventClass]
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
      if (newEventStart >= oldEventStart && oldEventEnd > newEventStart) {
       newEvent = true
      } else if (copiedEventObject.end) {
       var newEventEnd = copiedEventObject.end._d.getTime()
       if (newEventStart < oldEventStart && newEventEnd > oldEventStart) {
        newEvent = true
       }
      }
     } else if (copiedEventObject.end) {
      var newEventEnd = copiedEventObject.end._d.getTime()
      if (newEventEnd > oldEventStart && newEventEnd <= oldEventEnd) {
       newEvent = true
      } else if (evt.allDay) {
       if (oldEventStart < newEventStart && newEventEnd < (oldEventStart + 86399999)) {
        newEvent = true
       }
      }
     } else if (newEventStart <= oldEventStart && oldEventEnd > oldEventStart) {
      newEvent = true
     }
    } else if (evt.end) {
     var oldEventEnd = evt.end._d.getTime()
     if (oldEventStart <= newEventStart && newEventStart < oldEventEnd) {
      newEvent = true
     } else if (copiedEventObject.allDay) {
      if (newEventStart < oldEventStart && oldEventEnd < (newEventStart + 86399999)) {
       newEvent = true
      }
     }
    } else if (moment(evt.start._d).isSame(date._d)) {
     newEvent = true
    }
    if (newEvent) {
     return true
    } else {
     createEvent = true
     return false
    }
   })
   tddate = new Date(y, m, d, 0).getTime()
   if (vacation > 0 && copiedEventObject.start < tddate + vacation && copiedEventObject.className == 'label-warning') {
    createEvent = false
    alert("การลาพักร้อน กรุณาลาล่วงหน้า " + leaveExcept + " วัน");
   }
   /*var bh = $('#calendar').fullCalendar('option', 'businessHours'),
   if (resourceId.type == 'agendaDay') { 
       sdTime = Number(bh.start.split(':')[0]) + Number(bh.start.split(':')[1]/60)
       edTime = Number(bh.end.split(':')[0]) + Number(bh.end.split(':')[1]/60)
       seTime = copiedEventObject.start._i[3] + copiedEventObject.start._i[4]/60
       eeTime = copiedEventObject.end._i[3]+(resourceId.type == 'agendaDay'?2:0) + copiedEventObject.end._i[4]/60
       if (seTime < sdTime) { createEvent = false }
       if (eeTime > edTime) { createEvent = false }
   }
   else if ($.inArray(date._d.getDay(),bh.dow) < 0) { createEvent = false }
   */

   if (existingEvents.length > 0) {
    createEvent = false
   }
   // Add Event  
   if (copiedEventObject.title !== null && createEvent) {
    var data = {}
    data.id = copiedEventObject.id
    data.editable = 'editable'
    data.view = resourceId.type
    data.title = copiedEventObject.title
    data.userName = $('#username').text()
    data.cTime = Date.now()
    $.ajax({
     url: '/proc',
     type: "POST",
     dataType: "json",
     async: false,
     data: {
      'userName': data.userName,
      'state': 'loadm'
     },
     success: function (objs) {
      data.dataid = objs.dataid
      data.boss = objs.boss
      data.mailGroup = objs.mailGroup
     }
    })
    if (copiedEventObject.start !== null) {
     data.start = copiedEventObject.start
    } else {
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
  eventResize: function (event, delta, revertFunc) { // this function is called when resize events
   if (event.className == 'label-danger' && event.view != 'agendaDay') {
    revertFunc()
   }
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
      if (oldEventStart >= newEventStart && newEventEnd >= oldEventEnd) {
       newEvent = true
      } else if (oldEventStart <= newEventStart && newEventStart < oldEventEnd) {
       newEvent = true
      } else if (oldEventStart < newEventEnd && newEventEnd <= oldEventEnd) {
       newEvent = true
      } else {
       newEvent = false;
      }
     } else if (oldEventStart <= newEventStart && newEventStart < oldEventEnd) {
      newEvent = true
     } else {
      newEvent = false
     }
    } else if (event.end) {
     var newEventEnd = event.end._d.getTime()
     if (oldEventStart > newEventStart && newEventEnd > oldEventStart) {
      newEvent = true
     } else {
      newEvent = false
     }
    } else {
     if (moment(evt.start._d).isSame(event.start._d)) {
      newEvent = true
     } else {
      newEvent = false
     }
    }
    if (newEvent) {
     return true
    } else {
     return false
    }
   })
   tddate = new Date(y, m, d, 0).getTime()
   if (event.start < tddate + vacation && event.className == 'label-warning') {
    createEvent = false
    alert("การลาพักร้อน กรุณาลาล่วงหน้า " + leaveExcept + " วัน");
   }
   /*var bh = $('#calendar').fullCalendar('option', 'businessHours')
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
   */
   if (existingEvents.length > 1) {
    createEvent = false
   }
   if (!createEvent) {
    revertFunc()
   }
  },
  eventDrop: function (event, delta, revertFunc) { // this function is called when drop events
   createEvent = true
   var newEventStart = event.start._d.getTime()
   var existingEvents = $("#calendar").fullCalendar("clientEvents", function (evt) {
    newEvent = false
    var oldEventStart = evt.start._d.getTime()
    if (event.source.calendar.view.type == 'agendaDay') {
     if (evt.end) {
      var oldEventEnd = evt.end._d.getTime()
      if (newEventStart >= oldEventStart && oldEventEnd > newEventStart) {
       newEvent = true
      } else if (event.end) {
       var newEventEnd = event.end._d.getTime()
       if (newEventStart < oldEventStart && newEventEnd > oldEventStart) {
        newEvent = true
       }
      }
     } else if (event.end) {
      var newEventEnd = event.end._d.getTime()
      if (newEventEnd > oldEventStart && newEventEnd <= oldEventEnd) {
       newEvent = true
      } else if (evt.allDay) {
       if (oldEventStart < newEventStart && newEventEnd < (oldEventStart + 86399999)) {
        newEvent = true
       }
      }
     } else if (newEventStart <= oldEventStart && oldEventEnd > oldEventStart) {
      newEvent = true
     }
    } else if (event.end) {
     var newEventEnd = event.end._d.getTime()
     if (evt.allDay) {
      if (oldEventStart < newEventStart && newEventEnd < (oldEventStart + 86399999)) {
       newEvent = true
      }
      if (oldEventStart == newEventStart && newEventEnd > (oldEventStart + 86399999)) {
       newEvent = true
      }
     } else if (evt.end) {
      var oldEventEnd = evt.end._d.getTime()
      if (newEventStart >= oldEventStart && oldEventEnd > newEventStart) {
       newEvent = true
      } else if (newEventEnd > oldEventStart && newEventEnd <= oldEventEnd) {
       newEvent = true
      } else if (newEventStart <= oldEventStart && oldEventEnd > oldEventStart) {
       newEvent = true
      }
     } else if (oldEventStart > newEventStart && newEventEnd > oldEventStart) {
      newEvent = true
     }
    } else if (evt.end) {
     var oldEventEnd = evt.end._d.getTime();
     if (oldEventStart <= newEventStart && newEventStart < oldEventEnd) {
      newEvent = true
     } else if (event.allDay) {
      if (newEventStart <= oldEventStart && oldEventEnd < (newEventStart + 86399999)) {
       newEvent = true
      }
     }
    } else if (moment(evt.start._d).isSame(event.start._d)) {
     newEvent = false
    }
    if (newEvent) {
     return true
    } else {
     return false
    }
   })
   tddate = new Date(y, m, d, 0).getTime()
   if (event.start < tddate + vacation && event.className == 'label-warning') {
    createEvent = false
    alert("การลาพักร้อน กรุณาลาล่วงหน้า " + leaveExcept + " วัน");
   }
   /*var bh = $('#calendar').fullCalendar('option', 'businessHours'),
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
   */
   if (existingEvents.length > 1) {
    createEvent = false
   }
   if (!createEvent) {
    revertFunc()
   }
  },
  eventMouseover: function (calEvent, jsEvent) { // this function is called when move mouse over event
   var tooltip =
    '<div class="tooltip">\
                    <div class="tooltip-inner">' + calEvent.title + '\
                    <br>ลาโดย ' + calEvent.userName + '\
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
  eventClick: function (calEvent, jsEvent, view) { // this function is called when clicked event
   if (jsEvent.detail == 1) {
    option = {
     object: ['วัน', 'ชั่วโมง', 'นาที'],
     unit: ['d', 'h', 'm'],
     units: {
      d: 86400,
      h: 3600,
      m: 60
     }
    }

    function displayDuration(duration) {
     var Ans = ''
     for (var i = 0; i < option.unit.length; i++) {
      unitBase = option.unit[i]
      if (duration[unitBase] > 0) {
       Ans = Ans + duration[unitBase] + ' ' + option.object[i] + ' '
      }
     }
     return Ans
    }

    function getDuration(start, end) {
     duration = end - start
     Ans = []
     for (var i = 0; i < option.unit.length; i++) {
      unitBase = option.unit[i]
      unitValue = option.units[unitBase]
      if (unitValue <= duration) {
       Ans[unitBase] = Math.floor(duration / unitValue)
       duration = duration % unitValue
      }
     }
     return Ans
    }

    function duration(e) {
     if (!e.end) {
      return '1 วัน'
     } else {
      var st = e.start._d.getTime() / 1000,
       en = e.end._d.getTime() / 1000,
       du = getDuration(st, en)
      return displayDuration(du)
     }
    }

    if ($('#username').text() === calEvent.userName && calEvent.editable) {
     if (calEvent.className == "label-grey") {
      larType = "ลาป่วย"
     } else if (calEvent.className == "label-success") {
      larType = "ลากิจ"
     } else if (calEvent.className == "label-warning") {
      larType = "ลาพักร้อน"
     } else if (calEvent.className == "label-danger") {
      larType = "ลาสลับวันหยุด"
     } else if (calEvent.className == "label-dark") {
      larType = "ลากิจไม่รับค่าจ้าง"
     } else {
      larType = "ลาอื่นๆ"
     }
     var data = [],
      datah = 0
     data.dataid = calEvent.dataid
     data.username = calEvent.userName
     data.start = new Date(calEvent.start._i).toString().replace(/[\s|:]/g, '-').split('-').slice(0, 7).toString()
     if (sessionStorage.attach) {
      var file = sessionStorage.attach
      file = file.split('.')[0]
      if (file == data.start) {
       datah = 1
      }
     }
     if (larType == "ลาอื่นๆ") {

      var modal =
       '<div class="modal fade">\
         <div class="modal-dialog">\
          <div class="modal-content">\
           <div class="modal-header">\
            <h5 class="modal-title">' + larType + '</h5>\
           </div>\
           <div class="modal-body">\
            <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
            <form method="POST" enctype="multipart/form-data" id="upsiwa">\
             <div class="hidethis"><input type="text" id="dataid" name="dataid" value="' + data.dataid + '"/></div>\
             <div class="hidethis"><input type="text" id="username" name="username" value="' + data.username + '"/></div>\
             <div class="hidethis"><input type="text" id="start" name="start" value="' + data.start + '"/></div>\
             <label>แก้หัวข้อ &nbsp;</label>\
             <div class="row">\
              <div class="col-md-6">\
               <select class="form-control" id="larType" name="larType" data-action="change">\
                <option>ลาฝึกอบรม</option>\
                <option>ลาทำหมัน</option>\
                <option>ลาคลอด</option>\
                <option>ลาอุปสมบท</option>\
                <option>ลารับราชการทหาร</option>\
               </select>\
              </div>\
              <div class="col-md-6">\
               <button type="submit" class="btn btn-sm btn-success"><i class="ace-icon fa fa-check"></i> Save</button>\
              </div>\
             </div>\
             <div class="wrapper">\
              <p style="padding: 10px 5px 0px 0px;">แนบเอกสาร (เฉพาะไฟล์ .pdf หรือ .jpg 1 ไฟล์ ):</p>\
              <div class="file-upload">\
                  <input type="file" name="file" id="file" accept=".pdf,.jpg" onchange="checkfile(this)" />\
                  <i class="fa fa-arrow-up"></i>\
              </div>\
              <div ' + (datah == 1 ? 'class="delfile"' : 'class="delfile hidethis"') + '' + (datah == 1 ? ' id="' + sessionStorage.attach + '"' : '') + '>\
                  <p style="padding: 10px 5px 0px 10px;">ลบไฟล์แนบ\
                  <i class="fa fa-close delthis"></i></p>\
              </div>\
             </div>\
             <p class="lartype">วันคงเหลือ: ' + $('td:contains(ลาฝึกอบรม)').parents('tr').find('.dur').text() + '</p>\
             <p>ต้องการลา: ' + duration(calEvent) + '</p>\
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
     } else if (larType == "ลาสลับวันหยุด") {
      var modal =
       '<div class="modal fade">\
                    <div class="modal-dialog">\
                    <div class="modal-content">\
                        <div class="modal-header">\
                        <h5 class="modal-title">' + larType + '</h5>\
                        </div>\
                        <div class="modal-body">\
                        <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
                        <form method="POST" enctype="multipart/form-data" id="upsiwa">\
                            <div class="hidethis"><input type="text" id="dataid" name="dataid" value="' + data.dataid + '"/></div>\
                            <div class="hidethis"><input type="text" id="username" name="username" value="' + data.username + '"/></div>\
                            <div class="hidethis"><input type="text" id="start" name="start" value="' + data.start + '"/></div>\
                            <label>เลือกวันที่ต้องการสลับวันหยุด &nbsp;</label>\
                            <div class="row">\
                                <div class="col-md-6">\
                                <div class="input-group date">\
                                <input class="form-control datepicker" type="text" readonly placeholder="สลับวันหยุดกับวันที่">\
                                <div class="input-group-addon pickday">\
                                <span class="fa fa-calendar-check-o"></span>\
                                </div>\
                                </div>\
                                <input class="middle" style="margin-top: 5px;" autocomplete="off" type="text" id="larDetail" placeholder="สาเหตุที่ต้องทำงานในวันหยุด"/>\
                                </div>\
                                <div class="col-md-6">\
                                <button type="submit" class="btn btn-sm btn-success"><i class="ace-icon fa fa-check"></i> Save</button></div>\
                                </div>\
                                <div class="wrapper">\
                                <p style="padding: 10px 5px 0px 0px;">แนบเอกสาร (เฉพาะไฟล์ .pdf หรือ .jpg 1 ไฟล์ ):</p>\
                                <div class="file-upload">\
                                    <input type="file" name="file" id="file" accept=".pdf,.jpg" onchange="checkfile(this)" />\
                                    <i class="fa fa-arrow-up"></i>\
                                </div>\
                                <div class="delfile hidethis">\
                                    <p style="padding: 10px 5px 0px 10px;">ลบไฟล์แนบ\
                                    <i class="fa fa-close delthis"></i></p>\
                                </div>\
                                </div>\
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
     } else if (larType == "ลากิจ") {
      var reasonlist = ["บิดาเสียชีวิต", "มารดาเสียชีวิต", "คู่สมรสเสียชีวิต", "บุตรธิดาเสียชีวิต", "ญาติเสียชีวิต", "บิดาเจ็บป่วย", "มารดาเจ็บป่วย", "คู่สมรสเจ็บป่วย", "บุตรธิดาเจ็บป่วย", "ติดต่อราชการทำใบขับขี่", "ติดต่อราชการต่ออายุบัตรประจำตัวประชาชน", "ติดต่อราชการ รับ/โอนที่ดิน", "ติดต่อราชการเกี่ยวกับคดีความที่ศาล", "เหตุผลอื่นๆ โปรดระบุ..."]
      var optionlist = reasonlist.map(item => {
       return "<option>" + item + "</option>"
      })
      var modal =
       '<div class="modal fade">\
                    <div class="modal-dialog">\
                    <div class="modal-content">\
                        <div class="modal-header">\
                        <h5 class="modal-title">' + larType + '</h5>\
                        </div>\
                        <div class="modal-body">\
                        <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
                        <form method="POST" enctype="multipart/form-data" id="upsiwa">\
                            <div class="hidethis"><input type="text" id="dataid" name="dataid" value="' + data.dataid + '"/></div>\
                            <div class="hidethis"><input type="text" id="username" name="username" value="' + data.username + '"/></div>\
                            <div class="hidethis"><input type="text" id="start" name="start" value="' + data.start + '"/></div>\
                            <label>แก้หัวข้อ &nbsp;</label>\
                            <div class="row">\
                                <div class="col-md-6">\
                                <select class="form-control" id="larType" name="larType" data-action="change">\
                                    ' + optionlist.join("") + '\
                                </select>\
                                <input class="middle" style="margin-top: 5px; display: none;" autocomplete="off" type="text" id="larDetail" placeholder="ระบุสาเหตุอื่นๆ"/>\
                                </div>\
                                <div class="col-md-6">\<button type="submit" class="btn btn-sm btn-success"><i class="ace-icon fa fa-check"></i> Save</button></div>\
                                </div>\
                                <div class="wrapper">\
                                <p style="padding: 10px 5px 0px 0px;">แนบเอกสาร (เฉพาะไฟล์ .pdf หรือ .jpg 1 ไฟล์ ):</p>\
                                <div class="file-upload">\
                                    <input type="file" name="file" id="file" accept=".pdf,.jpg" onchange="checkfile(this)" />\
                                    <i class="fa fa-arrow-up"></i>\
                                </div>\
                                <div ' + (datah == 1 ? 'class="delfile"' : 'class="delfile hidethis"') + '' + (datah == 1 ? ' id="' + sessionStorage.attach + '"' : '') + '>\
                                    <p style="padding: 10px 5px 0px 10px;">ลบไฟล์แนบ\
                                    <i class="fa fa-close delthis"></i></p>\
                                </div>\
                                </div>\
                                <p>วันคงเหลือ: ' + $('.' + larType + ' .dur').text() + '</p>\
                                <p>ต้องการลา: ' + duration(calEvent) + '</p>\
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
                        <h5 class="modal-title">' + larType + '</h5>\
                        </div>\
                        <div class="modal-body">\
                        <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
                        <form method="POST" enctype="multipart/form-data" id="upsiwa">\
                            <div class="hidethis"><input type="text" id="dataid" name="dataid" value="' + data.dataid + '"/></div>\
                            <div class="hidethis"><input type="text" id="username" name="username" value="' + data.username + '"/></div>\
                            <div class="hidethis"><input type="text" id="start" name="start" value="' + data.start + '"/></div>\
                            <label>แก้หัวข้อ &nbsp;</label>\
                            <input class="middle" autocomplete="off" type="text" id="larType" placeholder="' + calEvent.title + '"/>\
                            <button type="submit" class="btn btn-sm btn-success"><i class="ace-icon fa fa-check"></i> Save</button>\
                            <div class="wrapper">\
                                <p style="padding: 10px 5px 0px 0px;">แนบเอกสาร (เฉพาะไฟล์ .pdf หรือ .jpg 1 ไฟล์ ):</p>\
                                <div class="file-upload">\
                                    <input type="file" name="file" id="file" accept=".pdf,.jpg" onchange="checkfile(this)" />\
                                    <i class="fa fa-arrow-up"></i>\
                                </div>\
                                <div class="delfile hidethis">\
                                    <p style="padding: 10px 5px 0px 10px;">ลบไฟล์แนบ\
                                    <i class="fa fa-close delthis"></i></p>\
                                </div>\
                            </div>\
                            <p style="padding-top: 10px">วันคงเหลือ: ' + $('td:contains(' + larType + ')').parents('tr').find('.dur').text() + '</p>\
                            <p>ต้องการใช้: ' + duration(calEvent) + '</p>\
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
     $(modal).on('show.bs.modal', function (e) {
      var larlist
      $.ajax({
       url: '/proc',
       type: "POST",
       dataType: "json",
       async: false,
       data: {
        'state': 'loads'
       },
       success: function (objs) {
        larlist = objs
       }
      })
      var dd = $('td:contains(' + $('#larType').val() + ')').parents('tr').find('.dur').text()
      if (dd == 'undefined' || dd == "") {
       $('.lartype').text('วันคงเหลือ: ' + larlist[$('#larType').val()])
      } else {
       $('.lartype').text('วันคงเหลือ: ' + dd)
      }
     })
     $(document).on("change", "#larType", function (e) {
      if ($(this).find("option:checked").val() == "เหตุผลอื่นๆ โปรดระบุ...") {
       $("#larDetail ").show()
      } else {
       $("#larDetail ").hide()
      }
     })
     $('.datepicker').datepicker({
      ignoreReadonly: true,
      format: 'dd/MM/yyyy',
      todayHighlight: true,
      clearBtn: true
     })
     $('.datepicker').datepicker().on('changeDate', function (e) {
      $('.datepicker').datepicker('hide')
     })
     $(document).on("click", ".input-group.date", function () {
      $('.datepicker').datepicker('show')
      if (!$('.datepicker.datepicker-inline').attr('style')) {
       $('.datepicker.datepicker-inline').remove()
      }
     })
     $('.viewattach').on("click", function () {

     })
     $('.delfile').on("click", function () {
      $.ajax({
       url: '/proc',
       type: "POST",
       async: false,
       data: {
        'state': 'delfile',
        'file': $(this).attr('id'),
        'username': $('#username').text()
       },
       success: function (objs) {
        $('.delfile').addClass('hidethis')
        sessionStorage.removeItem('attach')
       },
       error: (e) => {
        console.log(e.responseText)
       }
      })
     })
     $('select[id=larType]').on('change', function (e) {
      var larload, larlist
      $.ajax({
       url: '/proc',
       type: "POST",
       dataType: "json",
       async: false,
       data: {
        'state': 'loads'
       },
       success: function (objs) {
        larlist = objs
       },
       error: (e) => {
        console.log(e.responseText)
       }
      })
      var dd = $('td:contains(' + $(this).val() + ')').parents('tr').find('.dur').text()
      if (dd == 'undefined' || dd == "") {
       $('.lartype').text('วันคงเหลือ: ' + larlist[$(this).val()])
      } else {
       $('.lartype').text('วันคงเหลือ: ' + dd)
      }
     })
     modal.find('form').on('submit', function (ev) {
      ev.preventDefault()
      $(this).prop('disabled', true)
      $('#upsiwa').ajaxForm(function () {
       alert("file upload!")
      })
      if (calEvent.className == 'label-danger') {
       calEvent.title = $(this).find('#larDetail').val()
       if (calEvent.title == "") {
        $(this).find('#larDetail').addClass('blank-error');
        return
       }
      } else if (calEvent.className == 'label-success') {
       calEvent.title = $(this).find('#larType').val()
       if (calEvent.title == "เหตุผลอื่นๆ โปรดระบุ...") {
        calEvent.title = $(this).find('#larDetail').val()
       }
      } else {
       calEvent.title = $(this).find("#larType").val()
       if (calEvent.title == '') {
        calEvent.title = $(this).find("#larType").attr('placeholder')
       }
      }
      calEvent.editable = false
      calendar.fullCalendar('updateEvent', calEvent)
      if (calEvent.title !== null) {
       var data = {},
        me = $(this)
       if (me.data('requestRunning')) {
        return
       }
       me.data('requestRunning', true)
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
       } else {
        data.start = null
       }
       if (calEvent.end !== null) {
        if (calEvent.end._d !== null) {
         data.end = calEvent.end._d;
        }
       } else {
        data.end = null
       }
       if (calEvent.allDay) {
        data.allDay = true
       }
       if (calEvent.className == 'label-danger') {
        data.swapDate = $('.datepicker').datepicker('getDate').getTime() / 1000
       }
       if (calEvent.className !== null) {
        data.className = calEvent.className
       }
       if ($('.delfile').attr('id') != undefined) {
        data.attach = $('.delfile').attr('id')
       }
       data.boss = calEvent.boss
       data.mailGroup = calEvent.mailGroup
       if (data !== null && data.id) {
        $.ajax({
         url: '/proc',
         type: "POST",
         async: false,
         contentType: 'application/json',
         data: JSON.stringify(data),
         complete: function () {
          me.data('requestRunning', false)
         },
         success: function (data) {
          for (i = 0; i < data.length; i++) {
           $('tr[class=' + data[i].a + ']').find('td:nth-child(2)').text(data[i].c)
           $('tr[class=' + data[i].a + ']').find('td:nth-child(3)').text(data[i].d)
           if (data[i].e) {
            $('tr[class=' + data[i].a + ']').find('td:nth-child(3)').removeClass("bg-success").addClass("bg-danger")
           } else {
            $('tr[class=' + data[i].a + ']').find('td:nth-child(3)').removeClass("bg-danger").addClass("bg-success")
           }
          }
          if (data.swapDate) {
           thisswapdate = data.swapDate * 1000
           swapfrom = data.start * 1000
           datewrite = new Date(thisswapdate).getFullYear() + '-' + ("0" + (new Date(thisswapdate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(thisswapdate).getDate()).slice(-2)
           dateread = ("0" + new Date(swapfrom).getDate()).slice(-2) + '/' + ("0" + (new Date(swapfrom).getMonth() + 1)).slice(-2) + '/' + new Date(swapfrom).getFullYear()
           $('.fc-bg td[data-date="' + datewrite + '"').append('<div class="swapdate">' + data.title + '<br>ใช้สิทธิลาวันที่<br>' + dataread + '</div>')
          }
          sessionStorage.removeItem('attach')
         }
        })
       }
       $('#calendar').fullCalendar('removeEvents', calEvent.id)
       calEvent.className = 'label-light'
       if (calEvent.className == 'label-danger') {
        swapfrom = data.swapDate * 1000
        dateread = ("0" + new Date(swapfrom).getDate()).slice(-2) + '/' + ("0" + (new Date(swapfrom).getMonth() + 1)).slice(-2) + '/' + new Date(swapfrom).getFullYear()
        calEvent.title = 'สลับวันหยุดกับวันที่ ' + dateread + ' (รออนุมัติ)'
       } else {
        calEvent.title = calEvent.title + ' (รออนุมัติ)'
        $('#calendar').fullCalendar('renderEvent', calEvent)
       }
      }
      modal.modal("hide")
     })
     modal.find('button[data-action=delete]').on('click', async function () {
      if (sessionStorage.attach) {
       $.ajax({
        url: '/proc',
        type: "POST",
        dataType: "json",
        async: false,
        data: {
         'state': 'delfile',
         'file': sessionStorage.attach,
         'username': $('#username').text()
        },
        success: function (objs) {
         sessionStorage.removeItem('attach')
        },
        error: (e) => {
         console.log(e.responseText)
        }
       })
      }
      calendar.fullCalendar('removeEvents', function (ev) {
       if ($('#username').text()) return (ev.id == calEvent.id)
      })
      modal.modal("hide")
     })

     modal.modal('show').on('hidden.bs.modal', function () {
      if (sessionStorage.attach) {
       $.ajax({
        url: '/proc',
        type: "POST",
        dataType: "json",
        async: false,
        data: {
         'state': 'delfile',
         'file': sessionStorage.attach,
         'username': $('#username').text()
        },
        success: function (objs) {
         sessionStorage.removeItem('attach')
        },
        error: (e) => {
         console.log(e.responseText)
        }
       })
      }
      modal.remove()
     })
    }
   }
  }
 })

 var start = moment().subtract(1, 'month').set('date', 21);
 var end = moment().set('date', 20);

 function cb(start, end) {
  $('.fc-reportrange-button').html(start.format('DD MMM YYYY') + ' ถึง ' + end.format('DD MMM YYYY'));
 }
 $('.fc-reportrange-button').daterangepicker({
  startDate: start,
  endDate: end,
  ranges: {
   'รอบเดือนนี้': [moment().subtract(1, 'month').set('date', 21), moment().set('date', 20)],
   'รอบเดือนที่แล้ว': [moment().subtract(2, 'month').set('date', 21), moment().subtract(1, 'month').set('date', 20)]
  },
  locale: {
   "customRangeLabel": "เลือกช่วงเวลาเอง",
  }
 }, cb);
 cb(start, end);
})