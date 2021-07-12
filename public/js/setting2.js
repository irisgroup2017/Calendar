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
   render: function (data,type,row) {
    if (data == 1) {
     return '<div class="row center">\
     <div class="col-sm-4 datatable-option edit-profile"><i class="fa fa-pencil-square-o profile-edit"></i><span>ดู/แก้ไข</span></div>\
     <div class="col-sm-3 datatable-option status-profile"><i class="fa fa-check-circle text-success profile-status"></i><span data-status="0">ปิดบัญชี</span></div>\
     </div>'
    } else {
     return '<div class="row center">\
     <div class="col-sm-4 datatable-option remove-profile"><i class="fa fa-trash profile-edit"></i><span>ลบบัญชี</span></div>\
     <div class="col-sm-3 datatable-option status-profile"><i class="fa fa-times-circle text-danger profile-status"></i><span data-status="1">เปิดบัญชี</span></div>\
     </div>'
    }
   },
   targets: -1
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
    let tel = $(this).val().replace(/[\-|\s]/,'')
    data[id] = (tel != '' && tel != 0 ? tel : '-')
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

 $('.edit-profile').on("click", function () {
  let id = $(this).parents('tr').attr('id')
  //init
  $.ajax({
   url: '/setting2/get/' + id,
   type: 'POST',
   dataType: 'json',
   async: false,
   success: function (data) {
    if (data != "N/A") {
     $('.profile-id').attr('id',id)
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
     $('#edit-operator').text(data.operator)
     $('#edit-job').text(data.jobPos)
     $('#edit-depart').text(data.depart)
     $('#edit-sdate').text(data.cdate)
     $('#edit-boss').text(data.bossname)
     $('#edit-bossstatus').text((data.boss == 0 ? 'พนักงาน' : 'หัวหน้า'))
     $('#edit-username').text(data.username)
     $('#edit-password').text(data.password)
     $('#edit-retire').text((data.retire ? data.retire : 'ไม่กำหนด'))

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
      $('.edit-user').off()
      $('.edit-confirm').off()
      $('#click-edit-password').off('click')
      $('#edit-password').data('reset','false')
      profile.each(function (i, v) {
       editb.removeClass("edit-confirm").addClass("edit-user").val("แก้ไขข้อมูล")
       $(this).removeClass("color-edit").attr('contenteditable','false').html("")
      })
     })
    }
   }
  })

  $('.edit-user').one('click', function (e) {
   editClick(e.target)
  })

  async function editClick(e) {
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
    let id = $(this).attr('id')
    let html, def
    if (id == 'edit-depart') {
     def = $(this).html()
     html = '<select id="select-edit-depart">' + detail.departlist.map(depart => '<option value="' + depart.depid + '"' + (depart.deptitle == def ? 'selected="selected"' : '') + '>' + depart.deptitle + '</option>') + '</select>'
    } else if (id == 'edit-boss') {
     def = ($(this).html()).split(" ").splice(0, 2).join(" ")
     html = '<select id="select-edit-boss">' + detail.bosslist.map(boss => '<option value="' + boss.bossmail + '"' + (boss.bossname == def ? 'selected="selected"' : '') + '>' + boss.bossname + '</option>') + '</select>'
    } else if (id == 'edit-bossstatus') {
     def = $(this).html()
     html = '<select id="select-edit-bossstatus"><option value="0"' + ('พนักงาน' == def ? 'selected="selected"' : '') + '>พนักงาน</option><option value="1"' + ('หัวหน้า' == def ? 'selected="selected"' : '') + '>หัวหน้า</option></select>'
    } else if (id == 'edit-sdate') {
     def = moment($(this).html(), "DD MMMM YYYY", 'th').format('DD MMMM YYYY')
     html = '<input type="text" id="choose-edit-sdate" value="' + def + '">'
    } else if (id == 'edit-wplace') {
     def = $(this).html()
     html = '<select id="select-edit-wplace"><option value="0"' + ('หน้างาน' == def ? 'selected="selected"' : '') + '>หน้างาน</option><option value="1"' + ('ออฟฟิศใหญ่' == def ? 'selected="selected"' : '') + '>ออฟฟิศใหญ่</option></select>'
    } else if (id == 'edit-retire') {
     def = ($(this).html()) == 'ไม่กำหนด' ? 'ไม่กำหนด' : moment($(this).html(), "D MMMM YYYY", 'th').format('DD MMMM YYYY')
     html = '<input type="text" id="choose-edit-retire" value="' + def + '">'
    } else if (id == 'edit-password') {
     def = $(this).html()
     html = '<button type="button" id="click-edit-password" class="btn btn-sm btn-warning">รีเซ็ตรหัสผ่าน</button>'
    } else if (id == 'edit-operator') {
     def = $(this).html()
     html = '<select id="select-edit-operator"><option value="1"' + ('ผู้ใช้งาน' == def ? 'selected="selected"' : '') + '>ผู้ใช้งาน</option><option value="2"' + ('หัวหน้า' == def ? 'selected="selected"' : '') + '>หัวหน้า</option><option value="3"' + ('ฝ่ายบุคคล' == def ? 'selected="selected"' : '') + '>ฝ่ายบุคคล</option><option value="4"' + ('ผู้ดูแลระบบ' == def ? 'selected="selected"' : '') + '>ผู้ดูแลระบบ</option></select>'
    } else {
     def = $(this).html()
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
    isBuddhist: false,
    clearBtn:true
   })
   
   $(e).removeClass('edit-user').addClass('edit-confirm').val('บันทึกข้อมูล')
   
   $('#click-edit-password').on('click', function () {
    $.confirm({
     title: 'รีเซ็ตรหัสผ่าน',
     content: 'ยืนยันการรีเซ็ตรหัสผ่าน',
     buttons: {
      ยืนยัน: {
       btnClass: 'btn-success',
       keys: ['enter'],
       action: function () {
        $('#edit-password').data('reset','true')
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

   $('.edit-confirm').one('click', function (ev) {
    e = ev.target
    let profile = $('[id^=edit-]')
    let edit = {}
    let data = {}
    profile.each(function (i, v) {
     let def,dat
     let id = $(this).attr('id')
     if (id == 'edit-depart') {
      def = $('#select-edit-depart option:selected').html()
      dat = $('#select-edit-depart option:selected').val()
     } else if (id == 'edit-boss') {
      def = $('#select-edit-boss option:selected').html() +' ('+ $('#select-edit-boss option:selected').val() +')'
      dat = $('#select-edit-boss option:selected').val()
     } else if (id == 'edit-bossstatus') {
      def = $('#select-edit-bossstatus option:selected').html()
      dat = $('#select-edit-bossstatus option:selected').val()
     } else if (id == 'edit-operator') {
      def = $('#select-edit-operator option:selected').html()
      dat = $('#select-edit-operator option:selected').val()
     } else if (id == 'edit-sdate') {
      def = dat = $('#choose-edit-sdate').val()
     } else if (id == 'edit-wplace') {
      def = $('#select-edit-wplace option:selected').html()
      dat = $('#select-edit-wplace option:selected').val()
     } else if (id == 'edit-retire') {
      def = dat = ($('#choose-edit-retire').val() ? $('#choose-edit-retire').val() : "ไม่กำหนด")
     } else if (id == 'edit-password') {
      if ($('#edit-password').data('reset') == 'true') {
       let newp = defv['edit-username'] +'1234'
       def = newp.substring(0, 3) + '*'.repeat(newp.length - 3)
       dat = newp
      } else {
       def = defv['edit-password']
      }
     } else {
      def = dat = $(this).html()
      $(this).attr('contenteditable', 'false').removeClass('color-edit')
     }
     edit[id] = def
     if (dat) {
      data[id] = dat
     }
     if (id == 'edit-password') {
      if ($('#edit-password').data('reset') == 'false')
      delete data[id]
     } else if (id == 'edit-boss') {
      if (defv[id] == edit[id].split(" ").splice(0, 2).join(" ")) {
       delete data[id]
      }
     } else if (id == 'edit-retire') {
      if (edit[id] == 'ไม่กำหนด' && defv[id] == 'ไม่กำหนด') {
       delete data[id]
      }
     } else if (defv[id] == edit[id]) {
      delete data[id]
     }
     data.profileId = $('.profile-id').attr('id')
     $(this).html(def)
    })

    if (data['edit-name'] || data['edit-lastname']) {
     data['edit-name'] = (edit['edit-name'] ? edit['edit-name'] : defv['edit-name'])
     data['edit-lastname'] = (edit['edit-lastname'] ? edit['edit-lastname'] : defv['edit-lastname'])
    }
    if (data['edit-sdate']) {
     data['edit-sdate'] = moment(data['edit-sdate'],"DD MMMM YYYY", 'th').unix()
    }
    if (data['edit-retire']) {
     data['edit-retire'] = (data['edit-retire'] == 'ไม่กำหนด' ? '' : moment(data['edit-retire'],"DD MMMM YYYY", 'th').format("YYYY-MM-DD"))
    }
    $('#click-edit-password').off('click')
    $('input[name="editProfile"]').removeClass("edit-confirm").addClass("edit-user").val("แก้ไขข้อมูล")
    $('#edit-password').data('reset','false')
    $('.edit-user').one('click', function (e) {
     editClick(e.target)
    })
    $.ajax({
     url: '/setting2/edit',
     type: 'POST',
     dataType: 'json',
     async: false,
     data : data,
     success: function (data) {
      let id = data.profileId
      let row = $('tr[id='+id+']')
      delete data.profileId
      for (d in data) {
       if (d == 'edit-emid') { row.find('td:nth-child(1)').html(data[d]) }
       if (d == 'edit-name') { row.find('td:nth-child(2)').html(data[d]) }
       if (d == 'edit-lastname') { row.find('td:nth-child(3)').html(data[d]) }
       if (d == 'edit-job') { row.find('td:nth-child(4)').html(edit[d]) }
       if (d == 'edit-depart') { row.find('td:nth-child(5)').html(edit[d]) }
       if (d == 'edit-email') { row.find('td:nth-child(6)').html(data[d]) }
       if (d == 'edit-boss') { row.find('td:nth-child(7)').html(data[d]) }
      }
     }
    })
   })
  }
 })

 $(document).on('click','.del-user',function(e) {
  let id = $('.profile-id').attr('id')
  let row = $('tr[id='+id+']')
  let name = row.find('td:nth-child(2)').html()
  let lastname = row.find('td:nth-child(3)').html()
  let content = 'ยืนยันการลบข้อมูลบัญชีของ '+ name +' '+ lastname
  $.confirm({
   title: 'ลบข้อมูลบัญชี',
   content: content,
   buttons: {
    ยืนยัน: {
     btnClass: 'btn-success',
     keys: ['enter'],
     action: function () {
      $.ajax({
       url: '/setting2/delete',
       type: 'DELETE',
       data: {
        id:id
       },
       success: function(data) {
        $('.close-editorModal').trigger('click')
        $("#display-table").DataTable().row(row).remove().draw()
       }
      })
     }
    },
    ยกเลิก: {
     btnClass: 'btn-secondary',
     keys: ['esc']
    }
   }
  })
 })

 $(document).on('click','.remove-profile',function(e) {
  let target = $(e.target)
  let row = target.parents('tr:last')
  let id = row.attr('id')
  let name = row.find('td:nth-child(2)').html()
  let lastname = row.find('td:nth-child(3)').html()
  let content = 'ยืนยันการลบข้อมูลบัญชีของ '+ name +' '+ lastname
  $.confirm({
   title: 'ลบข้อมูลบัญชี',
   content: content,
   buttons: {
    ยืนยัน: {
     btnClass: 'btn-success',
     keys: ['enter'],
     action: function () {
      $.ajax({
       url: '/setting/delete',
       type: 'DELETE',
       data: {
        id:id
       },
       success: function(data) {
        $("#display-table").DataTable().row(row).remove().draw()
       }
      })
     }
    },
    ยกเลิก: {
     btnClass: 'btn-secondary',
     keys: ['esc']
    }
   }
  })
 })
 $(document).on('click','.status-profile',function(e) {
  let target = $(e.target)
  let row = target.parents('tr:last')
  let id = row.attr('id')
  let name = row.find('td:nth-child(2)').html()
  let lastname = row.find('td:nth-child(3)').html()
  let status = target.data('status')
  let title = (status ? 'เปิดใช้งานบัญชี' : 'ปิดการใช้งานบัญชี')
  let content = (status ? 'เปิดใช้งานบัญชีของ' : 'ปิดการใช้งานบัญชีของ') +' '+ name +' '+ lastname
  $.confirm({
   title: title,
   content: content,
   buttons: {
    ยืนยัน: {
     btnClass: 'btn-success',
     keys: ['enter'],
     action: function () {
      $.ajax({
       url: '/setting2/togglestatus',
       type: 'PUT',
       data: {
        id:id,
        status:status
       },
       success: function(data) {
        let bef = target.prev()
        let classremove = (status ? 'fa-times-circle text-danger' : 'fa-check-circle text-success')
        let classadd = (status ? 'fa-check-circle text-success' : 'fa-times-circle text-danger')
        if (status) {
         row.removeClass('user-disable')
        } else {
         row.addClass('user-disable')
        }
        bef.removeClass(classremove).addClass(classadd)
        target.data('status',(status ? 0 : 1))
        $("#display-table").DataTable().draw()
       }
      })
     }
    },
    ยกเลิก: {
     btnClass: 'btn-secondary',
     keys: ['esc'],
     action: function () {
     }
    }
   }
  })
 })
 
})