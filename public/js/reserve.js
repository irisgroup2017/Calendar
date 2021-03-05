document.addEventListener('DOMContentLoaded', function () {
 $.ajax({
  url: '/reserve/getfuel',
  type: "GET",
  async: false,
  success: function (data) {
   console.log(data)
  }
 })

 let date = new Date()
 var calendarEl = document.getElementById('calendar')
 var calendar = new FullCalendar.Calendar(calendarEl, {
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
  //now: moment("2021-02-15 14:00","YYYY-MM-DD HH:mm"), // assign time to calendar
  navLinks: true, // allows navigate to day mode when click number of day
  displayEventEnd: true,
  selectable: true,
  dayMaxEvents: true,
  datesSet: function (view, element) {
   calendar.removeAllEvents()
   let start = moment(view.start).format("YYYY-MM-DD")
   let end = moment(view.end).format("YYYY-MM-DD")
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
     $.each(data, function (i, item) {
      calendar.addEvent(item)
     })
    }
   })
  },
  eventClick: function (info) {
   let modal
   let event = info.event
   let ext = event.extendedProps
   let start = moment(event.start).subtract(7, 'h')
   let end = moment(event.end).subtract(7, 'h') || ""
   let day = start.locale("th").format("วันddddที่ D MMMM")
   let carres = (event.allDay ? day + " (ทั้งวัน)" : day + " (" + start.locale("th").format("HH:mm") + " - " + moment(end).format("HH:mm") +')')
   if (info.event.extendedProps.userId == $("#username")[0].outerText) {
    modal = '\
    <div class="modal fade" id="extraModal" data-id="' + event.id + '">\
     <div class="modal-dialog modal-md">\
      <div class="modal-content">\
       <div class="modal-header">\
         <h5 class="modal-title">' + ext.plate.remark + ' ' + ext.plate.license + '</h5>\
         <button type="button" class="justify-content-end" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
       </div>\
       <div class="modal-body">\
        <p>เวลาจอง: ' + carres + '</p>\
        <hr>\
        <div class="row">\
         <div class="col justify-content-start">\
          <p class>เลขไมล์เริ่มต้น: </p>\
         </div>\
         <div class="col">\
          <input id="milestart" class="form-control text-right" type="number" placeholder="0"/>\
         </div>\
        </div>\
        <div class="row">\
         <div class="col justify-content-start">\
          <p>เลขไมล์ปลายทาง: </p>\
         </div>\
         <div class="col">\
          <input id="mileend" class="form-control text-right" type="number" placeholder="0"/>\
         </div>\
        </div>\
        <div class="row">\
         <div class="col justify-content-start">\
          <p>ระยะทางที่ใช้: </p>\
         </div>\
         <div class="col">\
          <input id="milecalc" class="form-control text-right" type="number" readonly/>\
         </div>\
        </div>\
        <div class="row">\
         <div class="col justify-content-start">\
          <p>ปริมาณน้ำมันคงเหลือ: </p>\
         </div>\
         <div class="col">\
          <div class="fuelbar">\
           <input id="remainfuel" class="fuelslide" type="range" min="0" max="100">\
           <output></output>\
          </div>\
         </div>\
        </div>\
        <hr>\
        <div class="row">\
         <div class="col align-middle justify-content-start">\
          <p>แจ้งปัญหา: </p>\
         </div>\
         <div class="col">\
         <textarea id="carremark" class="form-control" rows="3"></textarea>\
         </div>\
        </div>\
       </div>\
       <div class="modal-footer">\
        <div class="col justify-content-start">\
         <button type="submit" id="submitDelete" class="btn btn-danger btn-sm">ยกเลิกการจอง</button>\
        </div>\
        <div class="col justify-content-end">\
         <div class="row">\
          <button type="submit" id="submitDetail" class="btn btn-success btn-sm col-auto ml-auto mr-1">ยืนยัน</button>\
          <button type="button" id="cancelDelete" class="btn btn-primary btn-sm">ย้อนกลับ</button>\
         </div>\
        </div>\
       </div>\
      </div>\
     </div>\
    </div>\
    '
   }
   /*else {
      modal = '\
      <div class="modal fade" id="extraModal" >\
       <div class="modal-dialog modal-sm">\
        <div class="modal-content">\
         <div class="modal-header">\
           <h5 class="modal-title"></h5>\
           <button type="button" class="justify-content-end" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
         </div>\
         <div class="modal-body">\
          \
         </div>\
         <div class="modal-footer">\
           <button type="submit" id="submitDelete" class="btn btn-success btn-sm mr-1">บันทึก</button>\
           <button type="button" id="cancelDelete" class="btn btn-danger btn-sm">ยกเลิก</button>\
         </div>\
        </div>\
       </div>\
      </div>\
      '
     }*/
   modal = $(modal).appendTo('body')
   var olddata = {}
   modal.on('show.bs.modal', function (e) {
    $.ajax({
     url: '/cross',
     type: "get",
     async: false,
     data: {
      path: "/reserve/car/" + event.id,
      method: "GET",
      option: {}
     },
     success: function (data) {
      let ms = (data.mstart ? data.mstart : "")
      let me = (data.mend ? data.mend : "")
      let rm = (data.remark ? data.remark : "")
      let rf = (typeof data.fuel == 'number' ? data.fuel : 0)
      let $mcal = $("#milecalc")
      let $remark = $("#carremark")
      olddata.ms = ms
      olddata.me = me
      olddata.rm = rm
      $("#milestart").val(ms)
      $("#mileend").val(me)
      $("#remainfuel").val(rf)
      $remark.val(rm)
      if (ms && me) {
       $mcal.val(me-ms)
      }

      let $fuel = $('#remainfuel')
      let color = "hsl("+rf+",100%,50%)"
      $('.fuelbar output').html(rf)
      $fuel.get(0).style.setProperty("--range-color", color);
      $fuel.get(0).style.setProperty("--range-value", rf);

      $fuel.on('change input', function() {
       let value = $(this).val()
       let color = "hsl("+value+",100%,50%)"
       $('.fuelbar output').html(value)
       $fuel.get(0).style.setProperty("--range-color", color);
       $fuel.get(0).style.setProperty("--range-value", value);
    })
     }
    })
   })
   modal.on('click', '#submitDetail', function () {
    let data = {}
    let ev = info.event
    data.mstart = $("#milestart").val()
    data.mend = $("#mileend").val()
    data.remark = $("#carremark").val()
    data.fuel = $("#remainfuel").val()
    if (olddata.ms == "" && olddata.ms != data.mstart) {
     if (olddata.me == "" && data.mend != "") {
      data.stime = (ev.allDat ? moment().set({h:8,m:30,s:0}).format("HH:mm:ss") : moment(info.event.start).format("HH:mm:ss"))
     } else {
      data.stime = moment().format("HH:mm:ss")
     }
    }
    if (olddata.me == "" && olddata.me != data.mend) {
     data.etime = moment().format("HH:mm:ss")
    }
    if (data.mend != "")
    $.ajax({
     url: '/cross',
     type: "get",
     async: false,
     data: {
      path: "/reserve/car/" + event.id,
      method: "PUT",
      option: data
     },
     success: function (data) {
      modal.modal("hide")
     }
    })
   })
   modal.on('click', '#submitDelete', function () {
    let timeend = (event.end ? moment(event.end).subtract(7,'h') : moment(event.start).add(1,'days').subtract(7,'h'))
    let timenow = moment()
    let duration = timeend.diff(timenow)
    if (duration > 0) {
     id = modal.data("id")
     $.ajax({
      url: '/cross',
      type: "get",
      async: false,
      data: {
       path: "/reserve/" + id,
       method: "DELETE",
       option: {}
      },
      success: function (data) {
       if (data.id) {
        event.remove()
       }
       modal.modal("hide")
       alert(data.message)
      }
     })
    } else {
     alert("ไม่สามารถลบข้อมูลการจองเก่าที่ผ่านมาแล้วได้")
     modal.modal("hide")
    }
   })
   modal.on('click', '#cancelDelete', function () {
    modal.modal("hide")
   })
   modal.modal('show').on('hidden.bs.modal', function () {
    this.remove()
   })
  },
  eventMouseEnter: function (info) {
   let el = info.el
   let ev = info.event
   let ext = info.event.extendedProps
   let badge = (ext.place != null ? ext.place.map(p => '<div class="badge badge-light">' + p + '</div>') : '<div class="badge badge-dark">None</div>')
   var tooltip = '<p>' + ext.userId + '</p>\
     <p><em>' + ext.plate.remark + ' ' + ext.plate.license + '</em></p>\
     <p>' + ev.title + '</p>\
     <div class="d-flex justify-content-center flex-wrap flex-row">\
     ' + (typeof badge == "object" ? badge.join().replace(/,/g, "") : badge) + '\
     </div>'
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
     $(el).css('background-color', '#08b394')
    } else if ($(el).is(".fc-v-event")) {
     $(el).css('background-color', '#08b394')
    }

    if ($(el).is(".fc-daygrid-dot-event")) {
     $(el).find(".fc-daygrid-event-dot").css('border', '4px solid #08b394')
    } else if ($(el).is(".fc-list-event")) {
     $(el).find(".fc-list-event-dot").css('border', '4px solid #08b394')
    }
   }
   if (type == 1) {
    if ($(el).is(".fc-daygrid-block-event")) {
     $(el).css('background-color', '#b7c6e8')
    } else if ($(el).is(".fc-v-event")) {
     $(el).css('background-color', '#b7c6e8')
    }

    if ($(el).is(".fc-daygrid-dot-event")) {
     $(el).find(".fc-daygrid-event-dot").css('border', '4px solid #b7c6e8')
    } else if ($(el).is(".fc-list-event")) {
     $(el).find(".fc-list-event-dot").css('border', '4px solid #b7c6e8')
    }
   }
   if (type == 2) {
    if ($(el).is(".fc-daygrid-block-event")) {
     $(el).find(".fc-event-main").css('color', '#000000')
     $(el).css('background-color', '#e0e0e0')
    } else if ($(el).is(".fc-v-event")) {
     $(el).find(".fc-event-main").css('color', '#000000')
     $(el).css('background-color', '#e0e0e0')
    }

    if ($(el).is(".fc-daygrid-dot-event")) {
     $(el).find(".fc-daygrid-event-dot").css('border', '4px solid #e0e0e0')
    } else if ($(el).is(".fc-list-event")) {
     $(el).find(".fc-list-event-dot").css('border', '4px solid #e0e0e0')
    }
   }
   if (type == 3) {
    if ($(el).is(".fc-daygrid-block-event")) {
     $(el).css('background-color', '#000000')
    } else if ($(el).is(".fc-v-event")) {
     $(el).css('background-color', '#000000')
    }

    if ($(el).is(".fc-daygrid-dot-event")) {
     $(el).find(".fc-daygrid-event-dot").css('border', '4px solid #000000')
    } else if ($(el).is(".fc-list-event")) {
     $(el).find(".fc-list-event-dot").css('border', '4px solid #000000')
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
            <input type="date" id="dateModal" data-date="' + moment(date.date).format("DD-MM-YYYY") + '" data-date-format="DD-MM-YYYY" value="' + moment(date.date).format("YYYY-MM-DD") + '">\
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
             <input type="radio" id="optradio4" name="optradio" class="custom-control-input" value="3404">\
             <label class="custom-control-label" for="optradio4">VIOS 3404</label>\
            </div>\
            <div class="custom-control custom-radio">\
             <input type="radio" id="optradio3" name="optradio" class="custom-control-input" value="6841">\
             <label class="custom-control-label" for="optradio3">Avanza 6841</label>\
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
   modalAddDay.on('show.bs.modal', function (e) {})
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
    let sms = "",
     stime, etime
    $("input[name=droppoint]:checked").each(function () {
     let val = $(this).val()
     if (val != 0 || (val == 0 && site.length == 0)) {
      site.push(val)
     }
    })
    if (!allday) {
     stime = $("#timepicker1").val()
     etime = $("#timepicker2").val()
    }
    if (site.length == 0) {
     sms += "\nกรุณาเลือกโครงการที่จะเข้า"
    }
    if (!text) {
     sms += "\nกรุณาใส่่รายละเอียดการใช้รถ"
    }
    if (stime == "") {
     sms += "\nกรุณาเลือกเวลาจอง"
    }
    if (etime == "") {
     sms += "\nกรุณาเลือกเวลากลับโดยประมาณ"
    }
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
       if (data.error) {
        alert(data.error)
       } else {
        let event = data[0]
        let carId = event.carId
        let code = event.plate.code
        let carRange, start, end
        let carRow = $(".reserve-row[data-carid=" + carId + "]")
        if (event.allDay) {
         carRange = [2, 28]
        } else {
         start = moment(event.start).subtract(7, "hours").format("HH:mm").split(":")
         end = moment(event.end).subtract(7, "hours").format("HH:mm").split(":")
         start = ((((parseInt(start[0]) * 60) + parseInt(start[1])) - 300) / 30)
         end = ((((parseInt(end[0] * 60)) + parseInt(end[1])) - 300) / 30)
         carRange = [start, (end > 28 ? 28 : end)]
        }
        if (moment().format("YYYY-MM-DD") == event.date) {
         let first = carRange[0]
         let last = carRange[1]
         while (first <= last) {
          let row = carRow.find("td:nth-child(" + first + ")")
          let rowClass = row.attr("class")
          if (rowClass == undefined) {
           if (first == carRange[0]) {
            row.addClass("reserve-time-first")
            row.append('<div class="timeline-first" data-color="' + code + '"></div>')
           } else if (last == carRange[0]) {
            row.addClass("reserve-time-last")
            row.append('<div class="timeline-last" data-color="' + code + '"></div>')
           } else {
            row.addClass("reserve-time")
            row.append('<div class="timeline-middle" data-color="' + code + '"></div>')
           }
          } else {
           row.removeClass(rowClass)
           row.empty().addClass("reserve-time-both")
           row.append('<div class="timeline-last" data-color="' + code + '"></div><div class="timeline-first" data-color="' + code + '"></div>')
          }
          first++
         }
        }
        calendar.addEvent(event)
        alert("บันทึกข้อมูลแล้ว")
        $('#extraModal').modal("hide")
       }
      }
     })
    }
   }
  },
 })
 calendar.render();
})