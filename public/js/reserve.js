jQuery(function ($) {
 let date = new Date()
 var calendar = $('#calendar').fullCalendar({
  buttonHtml: {
   prev: '<i class="ace-icon fa fa-chevron-left"></i>',
   next: '<i class="ace-icon fa fa-chevron-right"></i>'
  },
  html: true,
  customButtons: {
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
   left: 'prev,next today',
   center: 'title',
   right: 'year,month,agendaDay'
  },
  longPressDelay: 1000,
  nowIndicator: true, // place timeline in day mode
  now: {}, // assign time to calendar
  navLinks: true, // allows navigate to day mode when click number of day
  displayEventEnd: true,
  timeFormat: 'H:mm',
  selectable: true,
  eventLimit: true,

  dayRender: function (date, el, view) {
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
   if (view.type == "month" || view.type == "agendaDay" || view.type == "basic") {
    $('#calendar').fullCalendar('removeEvents', function (e) {
     return !e.isUserCreated
    })
    let start = view.start._i / 1000
    let end = view.end._i / 1000
    $.ajax({
     url: '/saleactive/load',
     type: "POST",
     async: false,
     data: {
      start: start,
      end: end
     },
     success: function (data) {
      $.each(data, function (i, item) {
       $('#calendar').fullCalendar('renderEvent', item)
      })
     }
    })
   }
  },
  eventRender: function (info) {},
  eventAfterRender: function (event, element) {
   $(element).tooltip({
    title: event.description,
    container: "body"
   });
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
      var len = data.mydata.length
      for (var i = 0; i < len; i++) {
       if (data.mydata[i]) {
        thisvacation = data.mydata[i][data.wplace]
        if (listday.indexOf(thisvacation)) {
         datewrite = new Date(thisvacation).getFullYear() + '-' + ("0" + (new Date(thisvacation).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(thisvacation).getDate()).slice(-2)
         $('.fc-bg td[data-date="' + datewrite + '"').append('<div class="vdate">' + data.mydata[i].dtitle + '</div>')
        }
       }
      }
     }
    })
   }
  },
  dayClick: function (date, jsEvent, view) {
   console.log(date)
   var modalAddDay = '\
    <div class="modal fade" id="extraModal" >\
     <div class="modal-dialog">\
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
            <input type="date" id="dateModal" data-date="' + moment(date).format("DD MMM YYYY") + '" data-date-format="DD MMM YYYY" value="'+ moment(date).format("YYYY-MM-DD") +'">\
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
                <input type="checkbox" class="custom-control-input" id="site1">\
                <label class="custom-control-label" for="site1">IPC</label>\
               </div>\
               <div class="col-sm-3">\
                <input type="checkbox" class="custom-control-input" id="site2">\
                <label class="custom-control-label" for="site2">IBY</label>\
               </div>\
               <div class="col-sm-3">\
                <input type="checkbox" class="custom-control-input" id="site3">\
                <label class="custom-control-label" for="site3">IDEN101</label>\
               </div>\
              </div>\
              <div class="row">\
               <div class="col-sm-3">\
                <input type="checkbox" class="custom-control-input" id="site4">\
                <label class="custom-control-label" for="site1">IDEN KP</label>\
               </div>\
               <div class="col-sm-3">\
                <input type="checkbox" class="custom-control-input" id="site5">\
                <label class="custom-control-label" for="site5">ICOPENH</label>\
               </div>\
               <div class="col-sm-3">\
                <input type="checkbox" class="custom-control-input" id="site0">\
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
              <input type="time" class="col-sm-3 center" id="timepicker1" value="">\
              <div class="col-sm-1 align-self-center">ถึง</div>\
               <div class="col-sm-3">\
                <input type="time" class="center" id="timepicker2" value="">\
               </div>\
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
         <button type="submit" id="saveExtraDate" class="btn btn-success btn-sm mr-1">บันทึก</button>\
         <button type="button" id="cancelExtraDate" class="btn btn-danger btn-sm">ยกเลิก</button>\
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
    viewType: 0
   })
   $('#timepicker2').chungTimePicker({
    viewType: 0
   })

   $('#extraModal').on('click', '#cancelExtraDate', function () {
    $('#extraModal').modal("hide")
   })
   $('#extraModal').modal('show').on('hidden.bs.modal', function () {
    this.remove()
   })
  },
 })
})