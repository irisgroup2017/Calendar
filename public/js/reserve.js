document.addEventListener('DOMContentLoaded', function() {
 let date = new Date()
 var calendarEl = document.getElementById('calendar')
 var calendar = new FullCalendar.Calendar(calendarEl,{
  timeZone: 'Asia/Thai',
  headerToolbar: {
   left: 'prevYear,prev,next,nextYear today',
   center: 'title',
   right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
  },
  themeSystem: "bootstrap",
  locale: 'th',
  longPressDelay: 1000,
  nowIndicator: true, // place timeline in day mode
  now: date, // assign time to calendar
  navLinks: true, // allows navigate to day mode when click number of day
  displayEventEnd: true,
  selectable: true,
  dayMaxEvents: true,
  datesSet: function (view, element) {
   calendar.removeAllEvents()
   let start = moment(view.start).format("YYYY-MM-DD")
   let end = moment(view.end).format("YYYY-MM-DD")
   console.log(view)
   $.ajax({
    url: '/cross',
    type: "GET",
    async: false,
    data: {
     path: "/reserve/getrange",
     method: "GET",
     option: {
      start: start,
      end: end
     }
    },
    success: function (data) {
     console.log(data)
     $.each(data, function (i, item) {
      calendar.addEvent(item)
     })
    }
   })
  },
  eventMouseEnter: function(info) {
   let el = info.el
   let ev = info.event
   let ext = info.event.extendedProps
   let badge = (ext.place!=null ? ext.place.map(p => '<div class="badge badge-info">'+p+'</div>') : '<div class="badge badge-dark">None</div>')
   var tooltip = '<p>'+ext.userId+'</p>\
     <p><em>'+ext.plate.remark+' '+ext.plate.license+'</em></p>\
     <p>'+ev.title+'</p>\
     <div class="d-flex justify-content-center flex-wrap flex-row">\
     '+(typeof badge == "object" ? badge.join().replace(/,/g,"") : badge)+'\
     </div>'
     console.log(tooltip)
   $(el).tooltip({
    title: tooltip,
    html: true,
    placement: 'auto',
    trigger: 'hover',
    container: 'body'
  })
   //$(el).addClass("tooltipextra").prepend(tooltip)
  },
  eventDidMount: function (argu) {
   let type = argu.event.extendedProps.carId
   let el = argu.el
   if (type == 0) {
    if ($(el).is(".fc-daygrid-block-event")) {
     $(el).css('background-color','#08b394')
    } else if ($(el).is(".fc-v-event")) { 
     $(el).css('background-color','#08b394')
    }

    if ($(el).is(".fc-daygrid-dot-event")) {
     $(el).find(".fc-daygrid-event-dot").css('border','4px solid #08b394')
    } else if ($(el).is(".fc-list-event")) {
     $(el).find(".fc-list-event-dot").css('border','4px solid #08b394')
    }
   }
   if (type == 1) {
    if ($(el).is(".fc-daygrid-block-event")) {
     $(el).css('background-color','#2a7568')
    } else if ($(el).is(".fc-v-event")) { 
     $(el).css('background-color','#2a7568')
    }

    if ($(el).is(".fc-daygrid-dot-event")) {
     $(el).find(".fc-daygrid-event-dot").css('border','4px solid #2a7568')
    } else if ($(el).is(".fc-list-event")) {
     $(el).find(".fc-list-event-dot").css('border','4px solid #2a7568')
    }
   }
   if (type == 2) {
    if ($(el).is(".fc-daygrid-block-event")) {
     $(el).find(".fc-event-main").css('color','#000000')
     $(el).css('background-color','#e0e0e0')
    } else if ($(el).is(".fc-v-event")) {
     $(el).find(".fc-event-main").css('color','#000000')
     $(el).css('background-color','#e0e0e0')
    }

    if ($(el).is(".fc-daygrid-dot-event")) {
     $(el).find(".fc-daygrid-event-dot").css('border','4px solid #e0e0e0')
    } else if ($(el).is(".fc-list-event")) {
     $(el).find(".fc-list-event-dot").css('border','4px solid #e0e0e0')
    }
   }
   if (type == 3) {
    if ($(el).is(".fc-daygrid-block-event")) {
     $(el).css('background-color','#000000')
    } else if ($(el).is(".fc-v-event")) {
     $(el).css('background-color','#000000')
    }

    if ($(el).is(".fc-daygrid-dot-event")) {
     $(el).find(".fc-daygrid-event-dot").css('border','4px solid #000000')
    } else if ($(el).is(".fc-list-event")) {
     $(el).find(".fc-list-event-dot").css('border','4px solid #000000')
    }
   }
  },
  dateClick: function (date, jsEvent, view) {
   var modalAddDay = '\
    <div class="modal fade" id="extraModal" >\
     <div class="modal-dialog modal-lg">\
      <div class="modal-content">\
       <div class="modal-header">\
         <h5 class="modal-title">บันทึกการขอใช้งานรถยนต์บริษัท</h5>\
         <button type="button" class="justify-content-end" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
       </div>\
       <div class="modal-body">\
        <form>\
         <fieldset class="form-group">\
          <div class="row align-items-center">\
           <label class="col-sm-2 col-form-label">วันที่</label>\
           <div class="col-sm-10">\
            <input type="date" id="dateModal" data-date="' + moment(date.date).format("DD-MM-YYYY") + '" data-date-format="DD-MM-YYYY" value="'+ moment(date.date).format("YYYY-MM-DD") +'">\
           </div>\
          </div>\
          <hr/>\
          <div class="row align-items-center">\
           <label class="col-sm-2 col-form-label">รถยนต์</label>\
           <div class="col-sm-10">\
            <div class="custom-control custom-radio">\
             <input type="radio" id="optradio1" name="optradio" class="custom-control-input" value="475" checked>\
             <label class="custom-control-label" for="optradio1">March 475</label>\
            </div>\
            <div class="custom-control custom-radio">\
             <input type="radio" id="optradio2" name="optradio" class="custom-control-input" value="745">\
             <label class="custom-control-label" for="optradio2">March 745</label>\
            </div>\
            <div class="custom-control custom-radio">\
             <input type="radio" id="optradio3" name="optradio" class="custom-control-input" value="6841">\
             <label class="custom-control-label" for="optradio3">Avanza 6841</label>\
            </div>\
            <div class="custom-control custom-radio">\
             <input type="radio" id="optradio4" name="optradio" class="custom-control-input" value="3404">\
             <label class="custom-control-label" for="optradio4">VIOS 3404</label>\
            </div>\
           </div>\
          </div>\
          <hr/>\
           <div class="row align-items-center">\
            <label class="col-sm-2 col-form-label">โครงการ</label>\
            <div class="col-sm-10">\
             <div class="custom-control custom-checkbox">\
              <div class="row">\
               <div class="col-sm-3">\
                <input type="checkbox" name="droppoint" class="custom-control-input" id="site1" value="8">\
                <label class="custom-control-label" for="site1">IPC</label>\
               </div>\
               <div class="col-sm-3">\
                <input type="checkbox" name="droppoint" class="custom-control-input" id="site2" value="6">\
                <label class="custom-control-label" for="site2">IBY</label>\
               </div>\
               <div class="col-sm-3">\
                <input type="checkbox" name="droppoint" class="custom-control-input" id="site3" value="11">\
                <label class="custom-control-label" for="site3">IDEN101</label>\
               </div>\
              </div>\
              <div class="row">\
               <div class="col-sm-3">\
                <input type="checkbox" name="droppoint" class="custom-control-input" id="site4" value="12">\
                <label class="custom-control-label" for="site4">IDEN KP</label>\
               </div>\
               <div class="col-sm-3">\
                <input type="checkbox" name="droppoint" class="custom-control-input" id="site5" value="13">\
                <label class="custom-control-label" for="site5">ICOPENH</label>\
               </div>\
               <div class="col-sm-3">\
                <input type="checkbox" name="droppoint" class="custom-control-input" id="site0" value="0">\
                <label class="custom-control-label" for="site0">ไม่เข้าไซต์</label>\
               </div>\
              </div>\
             </div>\
            </div>\
           </div>\
          <hr/>\
          <div class="row align-items-center">\
           <label class="col-sm-2 col-form-label">ระยะเวลา</label>\
           <div class="col-sm-10">\
            <div class="custom-control custom-checkbox">\
             <div class="row">\
              <div class="col-sm-3 custom-control custom-radio">\
               <input type="radio" id="rangeactive" name="optrange" class="custom-control-input" value="1" checked>\
               <label class="custom-control-label" for="rangeactive">ช่วงเวลา</label>\
              </div>\
              <input type="time" class="center" id="timepicker1" value=""/>\
              <div class="col-sm-1 align-self-center center">ถึง</div>\
              <input type="time" class="center" id="timepicker2" value=""/>\
             </div>\
            </div>\
            <div class="custom-control custom-checkbox">\
             <div class="row">\
              <div class="col-sm-3 custom-control custom-radio">\
               <input type="radio" id="rangeinactive" name="optrange" class="custom-control-input" value="0">\
               <label class="custom-control-label" for="rangeinactive">ทั้งวัน</label>\
              </div>\
             </div>\
            </div>\
           </div>\
          </div>\
         </div>\
         <input id="extraComment" placeholder="โปรดระบุรายละเอียดการใช้รถ" maxlength="255" type="text" required>\
         </fieldset>\
        </form>\
        <div class="modal-footer">\
         <button type="submit" id="saveReserve" class="btn btn-success btn-sm mr-1">บันทึก</button>\
         <button type="button" id="cancelReserve" class="btn btn-danger btn-sm">ยกเลิก</button>\
        </div>\
       </div>\
      </div>\
     </div>\
    </div>'

   modalAddDay = $(modalAddDay).appendTo('body')
   modalAddDay.on('show.bs.modal', function (e) {
   })
   modalAddDay.on('change', '#dateModal', function () {
    this.setAttribute("data-date", moment(this.value, "YYYY-MM-DD").format(this.getAttribute("data-date-format")))
   }).trigger("change")

   $('#timepicker1').chungTimePicker({
    viewType: 1,
    rowCount: 7
   })
   $('#timepicker2').chungTimePicker({
    viewType: 1,
    rowCount: 7
   })
   $('#extraModal').on('click', '#saveReserve', function () {
    saveReserve()
   })
   $('#extraModal').on('click', '#cancelReserve', function () {
    $('#extraModal').modal("hide")
   })
   $('#extraModal').modal('show').on('hidden.bs.modal', function () {
    this.remove()
   })

   async function saveReserve() {
    let day = ($("#dateModal").val() ? $("#dateModal").val() : "")
    let car = $("input[name=optradio]:checked").val()
    let site = []
    let allday = ($("#rangeinactive").is(':checked') ? 1 : 0)
    let text = $("#extraComment").val()
    let sms="",stime,etime
    $("input[name=droppoint]:checked").each(function() {
     site.push($(this).val())
    })
    if (!allday) {
     stime = $("#timepicker1").val()
     etime = $("#timepicker2").val()
    }
    if (site.length == 0) { sms += "\nกรุณาเลือกโครงการที่จะเข้า" }
    if (!text) { sms += "\nกรุณาใส่่รายละเอียดการใช้รถ" }
    if (stime == "") { sms += "\nกรุณาเลือกเวลาจอง" }
    if (etime == "") { sms += "\nกรุณาเลือกเวลากลับโดยประมาณ" }
    if (etime != "" && stime != "") {
     if ($("#timepicker2")[0].valueAsNumber < $("#timepicker1")[0].valueAsNumber) {
      sms += "\nกรุณาเลือกช่วงเวลาให้ถูกต้อง"
     }
    }
    if (sms) {
     alert(sms)
    } else {
     let data = {
      carId: car,
      date: day,
      title: text,
      start: stime,
      end: etime,
      allday: allday,
      place: site
     }
     console.log(data)
     $.ajax({                                                                                                                                                                           
      url: '/cross',
      type: 'GET',
      async: false,
      data: {
       path: "/reserve",
       method: "POST",
       option: data
      },
      success: function (data) {
       console.log(data)
       alert("บันทึกข้อมูลแล้ว")
       $('#extraModal').modal("hide")
      }
     })
    }
   }
  },
 })
 calendar.render();
})