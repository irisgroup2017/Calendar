$(document).ready(function(){
 //initial script
 $("#display-table").DataTable({
  dom: 'Bfrtip',
  scrollX: true,
  paging: false,
  searching: true,
  ordering: true,
  orderMulti: true,
  fixedHeader: {
      header: true,
      footer: false
  },
  "search": {
      "regex": true,
      "smart": true
  },
  buttons: [
   {
     text: 'เพิ่มรายชื่อ',
     action: function ( e, dt, node, config ) {
      $("#adderModal").animatedModal({
       modalTarget:'adderModal',
       animatedIn:'bounceInUp',
       animatedOut:'bounceOutDown',
       color:'#FFFFFF',
       animationDuration:'.5s',
       beforeOpen: function() {
           var children = $(".thumb")
           var index = 0
           function addClassNextChild() {
               if (index == children.length) return;
               children.eq(index++).show().velocity("transition.slideUpIn", { opacity:1, stagger: 450,  defaultDuration: 100 })
               window.setTimeout(addClassNextChild, 100)
           }
           addClassNextChild()
           $("[id^=add-]").each(function() {
            let id = $(this).attr("id")
            if (id == "add-startdate") {
             $('.datepicker').datepicker('update', new Date())
            } else if (id == "add-starttime") {
             $(this).val("08:30")
            } else if (id == "add-endtime") {
             $(this).val("17:30")
            } else if (id == "add-company" || id == "add-depart") {
             $(this).val("0")
            } else if ($(this).hasClass("radio-op")) {
             if (id == "add-puser" || id == "add-ruser" || id == "add-oplace") { $(this).prop("checked",true) } else  { $(this).prop("checked",false) }
            } else {
             $(this).val("")
            }
           })
       },//$(".close-adderModal").click()
       afterClose: function() {
       }
      })
     }
   }
  ],
  columnDefs: [
   {
     "data": null,
     "defaultContent": '<div class="row center">\
     <div class="col-sm-4 datatable-option edit-profile"><i class="fa fa-pencil-square-o profile-edit"></i><span>ดู/แก้ไข</span></div>\
     </div>',
     "targets": -1
     //<div class="col-sm-3 datatable-option del-profile"><i class="fa fa-trash profile-del"></i><span>ลบ</span></div>\
   }
 ]

 })

 $('.datepicker').datepicker({
  ignoreReadonly: true,
  format: 'dd MM yyyy',
  todayHighlight: true,
  isBuddhist: true
})

 $('.timepicker1').chungTimePicker({
  viewType: 1
 })

 $('.timepicker2').chungTimePicker({
  viewType: 1
 })

 //EVENT
 $(document).on('click','#emp-add',function(){
  let data = {}
  let pass = 1
  $("[id^=add-]").each(function() {
   let id = $(this).attr("id").split("-")[1]
   if (id == "startdate") {
    data[id] = $('.datepicker').datepicker('getDate').getTime()/1000
   } else if (id == "company" || id == "depart" || id == "boss") {
    data[id] = $(this).children("option:selected").val()
    data[id+'t'] = $(this).children("option:selected").text()
   } else if ($(this).hasClass("radio-op") && $(this).is(':checked')) {
    data[$(this).attr('name')] = $(this).val()
   } else if (!$(this).hasClass("radio-op")) {
    data[id] = $(this).val()
   }
   if (data[id] == "") { pass = 0; $(this).addClass("error") } else { $(this).removeClass("error") }
  })
  if (pass) {
   $.ajax({
    url: '/setting2/add',
     type: "POST",
     dataType: 'JSON',
     data: {
         'data': data
         },
     success: function(data) {
      $(".close-adderModal").click()
     }
   })
  }
  console.log(data)
 })

 $(document).on('click','.de-add',function() {
  var modal = 
  '<div class="modal fade" style="z-index: 10000;">\
    <div class="modal-dialog modal-sm">\
      <div class="modal-content">\
        <div class="modal-body">\
          <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
          <form class="no-margin">\
          <div class="input">\
              <input type="text" id="deadd" class="input-text" placeholder="ชื่อหน่วยงาน">\
              <label for="input" class="input-label">ชื่อหน่วยงาน</label>\
          </div>\
          </form>\
        </div>\
        <div class="modal-footer">\
          <button type="button" class="btn btn-sm btn-danger" data-action="deadd"><i class="ace-icon fa fa-paper-plane-o"></i> บันทึก</button>\
          <button type="button" class="btn btn-sm btn-info" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> ยกเลิก</button>\
        </div>\
      </div>\
    </div>\
  </div>'
  var modal = $(modal).appendTo('body')
  modal.find('button[data-action=deadd]').on('click',function() {
      var depart = $('input[class=input-text]').val()
      $.ajax({
          url: '/contact',
          type: "POST",
          dataType: 'JSON',
          data: {
              'state': 'add',
              'depart': depart
              },
          success: function(data) {
              ID = parseInt(data.ID)
              depart = data.depart
              row = data.line
              code = '<option value="'+row+'">'+depart+'</option>'
              $('#add-depart').append(code)
              modal.remove()
          }     
      })
  })

  modal.modal('show').on('hidden.bs.modal', function(){
      modal.remove()
  })  
 })
 
 $(document).on("click",".edit-profile", function(){
  let id = $(this).parents('tr').attr('id')
  //init
  $.ajax({
   url: '/setting2/get/'+id,
   type: 'POST',
   dataType: 'json',
   async: false,
   success: function(data) {
    if (data != "N/A") {
     
     $('#edit-emid').text(data.emid)
     $('#edit-wplace').text(data.workplace)
     $('#edit-stime').text(data.swtime)
     $('#edit-etime').text(data.ewtime)
     $('#edit-phone').text(data.workphone)
     $('#edit-mobile').text(data.privatephone)
     $('#edit-email').text(data.mail)
     $('#edit-name').text(data.name)
     $('#edit-lastname').text(data.lastname)
     $('#edit-nickname').text(data.nickname)
     $('#edit-job').text(data.jobPos)
     $('#edit-depart').text(data.depart)
     $('#edit-sdate').text(data.cdate)
     $('#edit-boss').text(data.bossname)
     $('#edit-username').text(data.username)
     $('#edit-password').text(data.password) 

     $("#editorModal").animatedModal({
      modalTarget:'editorModal',
      animatedIn:'bounceInUp',
      animatedOut:'bounceOutDown',
      color:'#FFFFFF',
      animationDuration:'.5s',
      beforeOpen: function() {
       var children = $(".thumb")
       var index = 0
       function addClassNextChild() {
        if (index == children.length) return;
        children.eq(index++).show().velocity("transition.slideUpIn", { opacity:1, stagger: 450,  defaultDuration: 100 })
        window.setTimeout(addClassNextChild, 100)
       }
       addClassNextChild()
      }
     })
    }
   }
  })
 })
})