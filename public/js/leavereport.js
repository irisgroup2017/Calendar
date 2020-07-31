// Setup page

$(window).on("load",function() {
 var d = new Date()
 $('.datepickera').datepicker('setDate',new Date(d.getFullYear(),d.getMonth()-1,21))
 $('.datepickerb').datepicker('setDate',new Date(d.getFullYear(),d.getMonth(),20))

 $('.datepicker').datepicker({
  ignoreReadonly: true,
  format: 'dd MM yyyy',
  todayHighlight: true
 })
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
   $.ajax({
    url: 'http://localhost:69/leavereport/get',
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
       destroy: true,
       paging: true,
       searching: false,
       ordering: true,
       orderMulti: true,
       pageLength: 100,
       fixedHeader: {
           header: true,
           footer: true
       },
       data: data,
       createdRow: function ( row, data, index ) {
        $('td', row).eq(1).text(data.swtime+"-"+data.ewtime)
        $('td', row).eq(4).text(data.forgetmorning+data.forgetevening)
       },
       columns: [
        { data: "userName" },
        { data: null, render: { start: "swtime", end: "ewtime" } },
        { data: "late" },
        { data: "hurry" },
        { data: null, render: { forgetm: "forgetmorning", forgete: "forgetevening" } },
        { data: "leavecount", render: { lw: "lw" } },
        { data: "leavecount", render: { si: "si" } },
        { data: "leavecount", render: { pe: "pe" } },
        { data: "leavecount", render: { va: "va" } },
        { data: "leavecount", render: { ot: "ot" } }
       ]
      })
     }
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
 $('.item-year a').removeClass('active')
 $('#dropdownyear').text($(this).text())
 $(this).addClass('active')
})

// Month Type Select

$('.item-month .month-item').on('click',function() {
 let month = $(this).val()
 $('.item-month a').removeClass('active')
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

//datepicka = $('.datepickera').datepicker('getDate').getTime()/1000
//datepickb = $('.datepickerb').datepicker('getDate').getTime()/1000