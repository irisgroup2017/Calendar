var leaveExcept
$.ajax({
 url: '/lar/getvacation',
 type: 'GET',
 async: false,
 success: function (data) {
  leaveExcept = parseInt(data)
 }
})
var vacation = moment().add(leaveExcept, 'days').subtract(7, 'hours').valueOf()

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
 vacation = moment().add(leaveExcept, 'days').subtract(7, 'hours').valueOf()
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
   let dateSend = function (type, time) {
    let ftime = new Date(time)
    switch (type) {
     case 'basic':
      return moment(view.end._i).subtract(1, 'years').valueOf()
     case 'month':
      if (ftime.getMonth() == 0) {
       let lastDate = moment(view.end._i).subtract(1, 'months').daysInMonth()
       return moment(view.end._i).subtract(1, 'months').set('date', lastDate).valueOf()
      }
      default:
       return time
    }
   }
   let endtime = dateSend(view.type, view.end._i)
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
       $('tr[class=' + editlar.a + ']').find('td:nth-child(3)').removeClass('label-success').addClass('label-danger')
      } else {
       $('tr[class=' + editlar.a + ']').find('td:nth-child(3)').addClass('label-success').removeClass('label-danger')
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
   var modalAddDay = '\
    <div class="modal fade" id="extraModal" >\
     <div class="modal-dialog">\
      <div class="modal-content">\
       <div class="modal-header">\
         <h5 class="modal-title">ขออนุมัติบันทึกเวลาเพิ่มเติม</h5>\
         <button type="button" class="justify-content-end" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
       </div>\
       <div class="modal-body">\
        <form>\
         <fieldset class="form-group">\
          <div class="row align-items-center">\
           <label class="col-sm-2 col-form-label">วันที่</label>\
           <div class="col-sm-10">\
            <input type="date" id="dateModal" data-date="' + moment(date).format("DD MMM YYYY") + '" data-date-format="DD MMM BBBB" value="' + moment(date).format("YYYY-MM-DD") + '">\
           </div>\
          </div>\
          <hr/>\
          <div class="row align-items-center">\
           <label class="col-sm-2 col-form-label">ประเภท</label>\
           <div class="col-sm-10">\
            <div class="custom-control custom-radio">\
             <input type="radio" id="optradio1" name="optradio" class="custom-control-input" value="out" checked>\
             <label class="custom-control-label" for="optradio1">ทำงานนอกสถานที่</label>\
            </div>\
            <div class="custom-control custom-radio">\
             <input type="radio" id="optradio2" name="optradio" class="custom-control-input" value="extra">\
             <label class="custom-control-label" for="optradio2">ทำงานวันหยุด</label>\
            </div>\
           </div>\
          </div>\
          <hr/>\
          <div class="row align-items-center">\
           <label class="col-sm-2 col-form-label">ช่วงเวลา</label>\
           <div class="col-sm-10">\
            <div class="custom-control custom-checkbox">\
             <div class="row">\
              <div class="col-sm-3">\
               <input type="checkbox" class="custom-control-input" id="customCheck1">\
               <label class="custom-control-label" for="customCheck1">เข้างาน</label>\
              </div>\
              <div class="col-sm-9">\
               <input type="time" class="center" id="timepicker1" value="">\
               <select id="place1">\
                <option value="">สถานที่</option>\
                <option value="5">HO</option>\
                <option value="6">IBY</option>\
                <option value="8">IPC</option>\
                <option value="11">IDEN101</option>\
                <option value="12">IDEN KP</option>\
                <option value="13">ICOPENH</option>\
                <option value="0">OUTSIDE</option>\
               </select>\
              </div>\
             </div>\
            </div>\
            <div class="custom-control custom-checkbox">\
             <div class="row">\
              <div class="col-sm-3">\
               <input type="checkbox" class="custom-control-input" id="customCheck2">\
               <label class="custom-control-label" for="customCheck2">ออกงาน</label>\
              </div>\
               <div class="col-sm-9">\
                <input type="time" class="center" id="timepicker2" value="">\
                <select id="place2">\
                 <option value="">สถานที่</option>\
                 <option value="5">HO</option>\
                 <option value="6">IBY</option>\
                 <option value="8">IPC</option>\
                 <option value="11">IDEN101</option>\
                 <option value="12">IDEN KP</option>\
                 <option value="13">ICOPENH</option>\
                 <option value="0">OUTSIDE</option>\
                </select>\
               </div>\
              </div>\
             </div>\
            </div>\
           </div>\
          </div>\
          <input id="extraComment" placeholder="โปรดระบุรายละเอียดการทำงาน" maxlength="255" type="text" required>\
         </fieldset>\
        </form>\
        <div class="modal-footer">\
         <button type="submit" id="saveExtraDate" class="btn btn-success btn-sm mr-1">บันทึก</button>\
         <button type="button" id="cancelExtraDate" class="btn btn-danger btn-sm">ยกเลิก</button>\
        </div>\
       </div>\
      </div>\
     </div>\
    </div>'
   modalAddDay = $(modalAddDay).appendTo('body')

   modalAddDay.on('show.bs.modal', function (e) {
    modalAddDay.find('#timepicker1').prop('disabled', true)
    modalAddDay.find('#timepicker2').prop('disabled', true)
    modalAddDay.find('#place1').prop('disabled', true)
    modalAddDay.find('#place2').prop('disabled', true)
   })
   modalAddDay.on('click', '#customCheck1', function () {
    let toggle = !$(this).prop("checked")
    modalAddDay.find('#timepicker1').prop('disabled', toggle)
    modalAddDay.find('#place1').prop('disabled', toggle)
   })
   modalAddDay.on('click', '#customCheck2', function () {
    let toggle = !$(this).prop("checked")
    modalAddDay.find('#timepicker2').prop('disabled', toggle)
    modalAddDay.find('#place2').prop('disabled', toggle)
   })
   modalAddDay.on('change', '#dateModal', function () {
    this.setAttribute("data-date", moment(this.value).format(this.getAttribute("data-date-format")))
   }).trigger("change")
   $('#timepicker1').chungTimePicker({
    viewType: 0
   })
   $('#timepicker2').chungTimePicker({
    viewType: 0
   })
   modalAddDay.on('click', '#saveExtraDate', function () {
    let date = modalAddDay.find('#dateModal').val()
    let type = modalAddDay.find('input[name=optradio]:checked').val()
    let sChk = modalAddDay.find('#customCheck1').prop("checked")
    let eChk = modalAddDay.find('#customCheck2').prop("checked")
    let sIn = (sChk ? modalAddDay.find("#timepicker1").val() : null)
    let sOut = (eChk ? modalAddDay.find("#timepicker2").val() : null)
    let pIn = (sChk ? modalAddDay.find('#place1').val() : null)
    let pOut = (eChk ? modalAddDay.find('#place2').val() : null)
    let comment = modalAddDay.find('#extraComment').val()
    if ((sChk && sIn == null) || (eChk && sOut == null)) {
     alert("โปรดระบุช่วงเวลา")
    } else if ((sChk && pIn == "") || (eChk && pOut == "")) {
     alert("โปรดเลือกสถานที่")
    } else if (!sIn && !sOut) {
     alert("กรุณาเลือกบันทึกเวลาเข้า/ออกงาน")
    } else if (!comment) {
     alert("โปรดกรอกรายละเอียดการทำงาน")
    } else {
     $.ajax({
      url: '/cross/sync/iodata',
      type: "POST",
      dataType: "json",
      async: false,
      data: {
       ioDate: date,
       ioType: type,
       ioSplace: (pIn ? parseInt(pIn) : null),
       ioEplace: (pOut ? parseInt(pOut) : null),
       ioStime: sIn,
       ioEtime: sOut,
       ioComment: comment,
       ioStatus: 1
      },
      success: function (data) {
       //console.log(data)
      }
     })
    }
   })

   $('#extraModal').on('click', '#cancelExtraDate', function () {
    $('#extraModal').modal("hide")
   })

   $('#extraModal').modal('show').on('hidden.bs.modal', function () {
    this.remove()
   })
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
   if (leaveExcept > 0 && vacation > 0 && copiedEventObject.start < vacation && copiedEventObject.className == 'label-warning') {
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
   if (event.start < vacation && event.className == 'label-warning') {
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
   if (event.start < vacation && event.className == 'label-warning') {
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
                                <div class="input-group-addon pickday align-self-center">\
                                <span class="fa fa-calendar-check-o fa-2x"></span>\
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
     modal = $(modal).appendTo('body');
     modal.on('show.bs.modal', function (e) {
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
            $('tr[class=' + data[i].a + ']').find('td:nth-child(3)').removeClass("label-success").addClass("label-danger")
           } else {
            $('tr[class=' + data[i].a + ']').find('td:nth-child(3)').removeClass("label-danger").addClass("label-success")
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