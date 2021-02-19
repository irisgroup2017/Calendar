jQuery(function () {
 //initial script
 $("#display-table").DataTable({
  dom: 'Bfrtip',
  scrollX: true,
  paging: false,
  searching: true,
  ordering: true,
  orderMulti: true,
  order: [1, 'asc'],
  fixedHeader: {
   header: true,
   footer: false
  },
  "search": {
   "regex": true,
   "smart": true
  },
  buttons: [{
    text: 'เพิ่มรายชื่อ',
    action: function (e, dt, node, config) {
     $("#adderModal").animatedModal({
      modalTarget: 'adderModal',
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
       $("[id^=add-]").each(function () {
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
         if (id == "add-puser" || id == "add-ruser" || id == "add-oplace") {
          $(this).prop("checked", true)
         } else {
          $(this).prop("checked", false)
         }
        } else {
         $(this).val("")
        }
       })
      }, //$(".close-adderModal").click()
      afterClose: function () {}
     })


    }
   },
   {
    text: 'พนักงานเก่า',
    className: 'btn btn-success toggle-employee',
    attr: {
     "data-retire": 'user-disable'
    },
    init: function () {
     $("#display-table").dataTableExt.afnFiltering.push(function (oSettings, aData, iDataIndex) {
      let myRowClasses = oSettings.aoData[iDataIndex].nTr.className.split(" ")
      let retire = $('.toggle-employee').data('retire')
      return myRowClasses.indexOf(retire) == -1
     })
     $("#display-table").DataTable().draw()
    },
    action: function (e, dt, node, config) {
     if ($(node).hasClass('active')) {
      $(node).removeClass('active')
      $(node).data('retire', 'user-disable')
     } else {
      $(node).addClass('active')
      $(node).data('retire', '')
     }
     $("#display-table").dataTableExt.afnFiltering.push(function (oSettings, aData, iDataIndex) {
      let myRowClasses = oSettings.aoData[iDataIndex].nTr.className.split(" ")
      let retire = $('.toggle-employee').data('retire')
      return myRowClasses.indexOf(retire) == -1
     })
     $("#display-table").DataTable().draw()
    }
   }
  ],
  columnDefs: [{
   "data": null,
   "defaultContent": '<div class="row center">\
     <div class="col-sm-4 datatable-option edit-profile"><i class="fa fa-pencil-square-o profile-edit"></i><span>ดู/แก้ไข</span></div>\
     <div class="col-sm-3 datatable-option del-profile"><i class="fa fa-trash profile-del"></i><span>ลบ</span></div>\
     </div>',
   "targets": -1
   //<div class="col-sm-3 datatable-option del-profile"><i class="fa fa-trash profile-del"></i><span>ลบ</span></div>\
  }]
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
 $(document).on('click', '#emp-add', function () {
  let data = {}
  let pass = 1
  $("[id^=add-]").each(function () {
   let id = $(this).attr("id").split("-")[1]
   if (id == "startdate") {
    data[id] = Math.floor($('.datepicker').datepicker('getDate').getTime() / 1000)
   } else if (id == "company" || id == "depart" || id == "boss") {
    data[id] = $(this).children("option:selected").val()
    data[id + 't'] = $(this).children("option:selected").text()
   } else if ($(this).hasClass("radio-op") && $(this).is(':checked')) {
    data[$(this).attr('name')] = $(this).val()
   } else if (["tel", "teli", "telw"].includes(id)) {
    data[id] = ($(this).val() || $(this).val() == 0 ? $(this).val() : "-")
   } else if (!$(this).hasClass("radio-op")) {
    data[id] = $(this).val()
   }
   if (data[id] == "") {
    pass = 0;
    $(this).addClass("error")
   } else {
    $(this).removeClass("error")
   }
  })
  if (pass) {
   $.ajax({
    url: '/setting2/add',
    type: "POST",
    dataType: 'JSON',
    data: {
     'data': data
    },
    success: function (data) {
     let table = $('#display-table').DataTable()
     let user = data.user
     table.row.add([
      user.userId,
      user.userName,
      user.userLastName,
      user.userPosition,
      user.depart,
      user.userMail,
      user.userBossMail
     ]).node().id = user.dataId
     table.draw(false)
     $(".close-adderModal").trigger("click")
    }
   })
  }
 })

 $(document).on('click', '.de-add', function () {
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
  modal.find('button[data-action=deadd]').on('click', function () {
   var depart = $('input[class=input-text]').val()
   $.ajax({
    url: '/contact',
    type: "POST",
    dataType: 'JSON',
    data: {
     'state': 'add',
     'depart': depart
    },
    success: function (data) {
     ID = parseInt(data.ID)
     depart = data.depart
     row = data.line
     code = '<option value="' + row + '">' + depart + '</option>'
     $('#add-depart').append(code)
     modal.remove()
    }
   })
  })

  modal.modal('show').on('hidden.bs.modal', function () {
   modal.remove()
  })
 })

 $(document).on("click", ".edit-profile", function () {
  let id = $(this).parents('tr').attr('id')
  //init
  $.ajax({
   url: '/setting2/get/' + id,
   type: 'POST',
   dataType: 'json',
   async: false,
   success: function (data) {
    if (data != "N/A") {
     $('#edit-emid').text(data.emid)
     $('#edit-wplace').text(data.workplace)
     $('#edit-stime').text(data.swtime)
     $('#edit-etime').text(data.ewtime)
     $('#edit-phone').text(data.officephone)
     $('#edit-mobile').text(data.privatephone)
     $('#edit-workphone').text(data.workphone)
     $('#edit-email').text(data.mail)
     $('#edit-name').text(data.name)
     $('#edit-lastname').text(data.lastname)
     $('#edit-nickname').text(data.nickname)
     $('#edit-job').text(data.jobPos)
     $('#edit-depart').text(data.depart)
     $('#edit-sdate').text(data.cdate)
     $('#edit-boss').text(data.bossname)
     $('#edit-bossstatus').text((data.boss == 0 ? 'พนักงาน' : 'หัวหน้า'))
     $('#edit-username').text(data.username)
     $('#edit-password').text(data.password)
     $('#edit-retire').text((data.retire == 0 ? data.retire : 'ไม่กำหนด'))

     $("#editorModal").animatedModal({
      modalTarget: 'editorModal',
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
      }
     })

     $(".close-editorModal").on('click',function() {
      let profile = $('[id^=edit-]')
      let editb = $('[name="editProfile"]')
      $('#edit-password').attr('data-reset','false')
      profile.each(function (i, v) {
       $('#click-edit-password').off('click')
       editb.removeClass("edit-confirm").addClass("edit-user").val("แก้ไขข้อมูล")
       $(this).removeClass("color-edit").attr('contenteditable','false').html("")
      })
     })
    }
   }
  })

  $('.edit-user').one('click', function () {
   let profile = $('[id^=edit-]')
   let detail
   var defv = {}
   $.ajax({
    url: '/setting2/getlist',
    type: 'GET',
    dataType: 'json',
    async: false,
    success: function (data) {
     detail = data
    }
   })
   profile.each(function (i, v) {
    $('.edit-user').off('click')
    let id = $(this).attr('id')
    let html, def
    if (id == 'edit-depart') {
     def = $(this)[0].outerText
     html = '<select id="select-edit-depart">' + detail.departlist.map(depart => '<option value="' + depart.depid + '"' + (depart.deptitle == def ? 'selected="selected"' : '') + '>' + depart.deptitle + '</option>') + '</select>'
    } else if (id == 'edit-boss') {
     def = ($(this)[0].outerText).split(" ").splice(0, 2).join(" ")
     html = '<select id="select-edit-boss">' + detail.bosslist.map(boss => '<option value="' + boss.bossmail + '"' + (boss.bossname == def ? 'selected="selected"' : '') + '>' + boss.bossname + '</option>') + '</select>'
    } else if (id == 'edit-bossstatus') {
     def = $(this)[0].outerText
     html = '<select id="select-edit-bossstatus"><option value="0"' + ('พนักงาน' == def ? 'selected="selected"' : '') + '>พนักงาน</option><option value="1"' + ('หัวหน้า' == def ? 'selected="selected"' : '') + '>หัวหน้า</option></select>'
    } else if (id == 'edit-sdate') {
     def = moment($(this)[0].outerText, "DD MMMM YYYY", 'th').format('DD MMMM YYYY')
     html = '<input type="text" id="choose-edit-sdate" value="' + def + '">'
    } else if (id == 'edit-wplace') {
     def = $(this)[0].outerText
     html = '<select id="select-edit-wplace"><option value="0"' + ('หน้างาน' == def ? 'selected="selected"' : '') + '>หน้างาน</option><option value="1"' + ('ออฟฟิศใหญ่' == def ? 'selected="selected"' : '') + '>ออฟฟิศใหญ่</option></select>'
    } else if (id == 'edit-retire') {
     def = ($(this)[0].outerText) == 'ไม่กำหนด' ? '' : moment($(this)[0].outerText, "D MMMM YYYY", 'th').format('DD MMMM YYYY')
     html = '<input type="text" id="choose-edit-retire" value="' + def + '">'
    } else if (id == 'edit-password') {
     def = $(this)[0].outerText
     html = '<button type="button" id="click-edit-password" class="btn btn-sm btn-warning">รีเซ็ตรหัสผ่าน</button>'
    } else {
     def = $(this)[0].outerText
     $(this).attr('contenteditable', 'true').addClass('color-edit')
    }
    defv[id] = def
    if (html) {
     $(this).html(html)
    }
   })

   $('#choose-edit-sdate').datepicker({
    language: 'th',
    ignoreReadonly: true,
    format: 'dd MM yyyy',
    todayHighlight: true,
    isBuddhist: false
   })
   $('#choose-edit-retire').datepicker({
    language: 'th',
    ignoreReadonly: true,
    format: 'dd MM yyyy',
    todayHighlight: true,
    isBuddhist: false
   })

   $(this).removeClass('edit-user').addClass('edit-confirm').val('บันทึกข้อมูล')
   $('#click-edit-password').on('click', function () {
    $.confirm({
     title: 'รีเซ็ตรหัสผ่าน',
     content: 'ยืนยันการรีเซ็ตรหัสผ่าน',
     buttons: {
      ยืนยัน: {
       btnClass: 'btn-success',
       keys: ['enter'],
       action: function () {
        $('#edit-password').attr('data-reset','true')
        $.alert("กดบันทึกข้อมูลเพื่อดำเนินการรีเซ็ต")
       }
      },
      ยกเลิก: {
       btnClass: 'btn-secondary',
       keys: ['esc'],
       action: function () {
        $.alert("ยกเลิกการรีเซ็ตรหัสผ่าน")
       }
      }
     }
    })
   })

   $('.edit-confirm').one('click', function () {
    let profile = $('[id^=edit-]')
    let edit = {}
    let data = {}
    profile.each(function (i, v) {
     let def,dat
     $('.edit-user').off('click')
     let id = $(this).attr('id')
     if (id == 'edit-depart') {
      def = $('#select-edit-depart option:selected')[0].outerText
      dat = $('#select-edit-depart option:selected').val()
     } else if (id == 'edit-boss') {
      def = $('#select-edit-boss option:selected')[0].outerText
      dat = $('#select-edit-boss option:selected').val()
     } else if (id == 'edit-bossstatus') {
      def = $('#select-edit-bossstatus option:selected')[0].outerText
      dat = $('#select-edit-bossstatus option:selected').val()
     } else if (id == 'edit-sdate') {
      def = dat = $('#choose-edit-sdate').val()
     } else if (id == 'edit-wplace') {
      def = $('#select-edit-wplace option:selected')[0].outerText
      dat = $('#select-edit-wplace option:selected').val()
     } else if (id == 'edit-retire') {
      def = dat = $('#choose-edit-retire').val()
     } else if (id == 'edit-password') {
      if ($('#edit-password').data('reset') == "true") {
       let newp = defv['edit-username'] +'1234'
       def = newp.substring(0, 3) + '*'.repeat(newp.length - 3)
       dat = newp
      } else {
       def = defv['edit-password']
      }
     } else {
      def = dat = $(this)[0].outerText
      $(this).attr('contenteditable', 'false').removeClass('color-edit')
     }
     edit[id] = def
     if (dat) {
      data[id] = dat
     }
     $(this).text(def)
     $('#click-edit-password').off('click')
     $('[name="editProfile"]').removeClass("edit-confirm").addClass("edit-user").val("แก้ไขข้อมูล")
    })
    console.log(defv)
    console.log(edit)
    console.log(data)
   })

  })

 }) 
})