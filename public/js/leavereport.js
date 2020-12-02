// Setup page

$(window).on("load",function() {
 $('.datepicker').datepicker({
  ignoreReadonly: true,
  format: 'dd MM YYYY',
  todayHighlight: true
 })

 $('.datepickera').datepicker('setDate',moment().startOf('isoweek').format())
 $('.datepickerb').datepicker('setDate',moment().endOf('isoweek').format())
})

// Search Click

$('#search').on('click',function() {
 let state = $('.masterplan .active').attr('id')
 let opt1,opt2
 if (state != undefined) {
  if (state == "select-year") {
   opt1 = $('.item-year .active').val()
   opt2 = null
  } else if (state == "select-month") {
   opt1 = $('.item-year .active').val()
   opt2 = $('.item-month .active').val()
  } else {
   opt1 = $('.datepickera').datepicker('getDate').getTime()
   opt2 = $('.datepickerb').datepicker('getDate').getTime()
  }
  if (opt1 && (opt2 || opt2 == null)) {
   var ip
   $.ajax({
    url: '/getip',
    type: "post",
    async: false,
    success: function (data) {
     ip = data
    }
   })
    $.ajax({
     url: ip + '/leavereport/get',
     type: "post",
     dataType: "json",
     async: false,
     data: {
         state: state,
         opt1: opt1,
         opt2: opt2
     },
     success: function (data,res,jqXHR) {
      let status = jqXHR.status
      if (status == 204) { alert('ไม่พบข้อมูลในรายการที่คุณกำหนด') }
      if (status == 200) {
       $(".show-table").DataTable({
        responsive: true,
        destroy: true,
        paging: true,
        searching: true,
        ordering: true,
        orderMulti: true,
        pageLength: 100,
        data: data,
        fixedHeader: {
         header: true
        },
        createdRow: function ( row, data, index ) {
         console.log(data)
         $('td', row).eq(1).text(data.swtime.substring(0, 5)+" - "+data.ewtime.substring(0, 5))
         $('td', row).eq(2).text((data.late > 0 ? data.late : "-"))
         $('td', row).eq(3).text((data.hurry > 0 ? data.hurry : "-"))
         $('td', row).eq(4).text((data.forgetmorning > 0 || data.forgetevening > 0 ? data.forgetmorning+data.forgetevening : "-"))
         $('td', row).eq(5).text((data.leavecount.lw ? data.leavecount.lw : "-"))
         $('td', row).eq(6).text((data.leavecount.si ? data.leavecount.si : "-"))
         $('td', row).eq(7).text((data.totalleave.si ? data.totalleave.si : "-"))
         $('td', row).eq(8).text((data.leavecount.pe ? data.leavecount.pe : "-"))
         $('td', row).eq(9).text((data.totalleave.pe ? data.totalleave.pe : "-"))
         $('td', row).eq(10).text((data.leavecount.va ? data.leavecount.va : "-"))
         $('td', row).eq(11).text((data.totalleave.va ? data.totalleave.va : "-"))
         $('td', row).eq(12).text((data.leavecount.ot ? data.leavecount.ot : "-"))
        },
        columns: [
         { data: "userName" },
         { data: null , className: "dt-body-center" , render: { start: "swtime", end: "ewtime" } },
         { data: "late" },
         { data: "hurry" },
         { data: null, render: { forgetm: "forgetmorning", forgete: "forgetevening" } },
         { data: "leavecount.lw" },
         { data: "leavecount.si" },
         { data: "totalleave.si" },
         { data: "leavecount.pe" },
         { data: "totalleave.pe" },
         { data: "leavecount.va" },
         { data: "totalleave.va" },
         { data: "leavecount.ot" }
        ]
       })
      }
      $('.table-row').removeClass('hide')
     }
    })
   } else {
   alert('กรุณาเลือกรายละเอียดสำหรับการเรียกข้อมูลรายงาน')
  }
 } else {
  alert('กรุณาเลือกประเภทการแสดงรายงาน')
 }
})

// Report Type Dropdown

$('.masterplan .dropdown-item').on('click',function() {
 let mode = $(this).attr('id')
 $('.masterplan a').removeClass('active')
 $('.action-pane > div').addClass('hide')

 if (mode == "select-year") {
  $('.select-year').removeClass('hide')
 } else if (mode == "select-month") {
  $('.select-year').removeClass('hide')
  $('.select-month').removeClass('hide')
 } else {
  $('.date-range').removeClass('hide')
 }
 $('#dropdownMenuButton').text($(this).text())

 $(this).addClass('active')
})

// Year Type Select

$('.item-year .year-item').on('click',function() {
 let year = $(this).val()
 $('.year-item').removeClass('active')
 $('#dropdownyear').text($(this).text())
 $(this).addClass('active')
})

// Month Type Select

$('.item-month .month-item').on('click',function() {
 let month = $(this).val()
 $('.month-item').removeClass('active')
 $('#dropdownmonth').text($(this).text())
 $(this).addClass('active')
})

// DateRange Type Select

$('.datepickera').datepicker().on('changeDate',function(e){
 $('.datepickera').datepicker('hide')
 $('.datepickerb').datepicker('show')
})

$('.datepickerb').datepicker().on('changeDate',function(e){
 $('.datepickerb').datepicker('hide')
})