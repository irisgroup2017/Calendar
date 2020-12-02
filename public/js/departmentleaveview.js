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
  now: date, // assign time to calendar
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
     url: '/departmentleaveview/load',
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
  eventRender: function(info) {
 },
  eventAfterRender: function(event, element) {
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
    sessionStorage.removeItem('date')
    sessionStorage.removeItem('fingerscan')
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
  },

 })
})