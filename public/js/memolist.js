jQuery(function ($) {
 $("#display-table").DataTable({
  dom: 'Bfrtip',
  scrollX: true,
  paging: true,
  pageLength: 10,
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
  buttons: [{
    text: 'สร้างเอกสารใหม่',
    action: function (e, dt, node, config) {
     window.open(window.location.origin + "/memo")
    }
   },
   {
    text: 'เอกสารเข้า',
    className: 'btn btn-success',
    attr: {
     "data-retire": 'user-disable'
    },
    action: function (e, dt, node, config) {
     let table = $("#display-table").DataTable()
     table.columns().search('').draw()
     table.column(3).search($('.data-search').data('find'), true, false).draw()
    }
   },
   {
    text: 'เอกสารออก',
    className: 'btn btn-success',
    attr: {
     "data-retire": 'user-disable'
    },
    action: function (e, dt, node, config) {
     let table = $("#display-table").DataTable()
     table.columns().search('').draw()
     table.column(2).search($('.data-search').data('find'), true, false).draw()
    }
   }
  ],
  rowCallback: function (row, data) {

  },
  columnDefs: [{
   "data": null,
   "defaultContent": '\
     <div class="row center">\
      <div class="col-sm-1 datatable-option view-memo"><a class="fa fa-eye color-blue memo-view" title="ดูเอกสาร"></a></div>\
      <div class="col-sm-1 datatable-option comment-memo"><a class="fa fa-commenting-o color-teal memo-comment" title="แสดงความคิดเห็น"></a></div>\
      <div class="col-sm-1 datatable-option read-memo"><a class="fa fa-list-alt color-purple memo-read" title="รายชื่อคนเปิดดูเอกสาร"></a></div>\
      <div class="col-sm-1 datatable-option info-memo"><a class="fa fa-info color-navy memo-info" title="รายละเอียดข้อมูลการดำเนินการเอกสาร"></a></div>\
      <div class="col-sm-1 datatable-option edit-memo"><a class="fa fa-pencil-square-o color-olive memo-edit" title="แก้ไขเอกสาร"></a></div>\
      <div class="col-sm-1 datatable-option return-memo"><a class="fa fa-undo color-fuchsia memo-return" id="memo-return" title="ส่งกลับเพื่อแก้ไข"></a></div>\
      <div class="col-sm-1 datatable-option approve-memo"><a class="fa fa-check-circle color-green memo-approve" id="memo-approve" title="อนุมัติเอกสาร"></a></div>\
      <div class="col-sm-1 datatable-option reject-memo"><a class="fa fa-times-circle color-red memo-reject" id="memo-reject" title="ไม่อนุมัติเอกสาร"></a></div>\
     </div>',
   "targets": -1
   //<div class="col-sm-3 datatable-option del-profile"><i class="fa fa-trash profile-del"></i><span>ลบ</span></div>\
  }]
 })

 $(document).on('click', '.memo-view', function () {
  let id = $(this).parents('tr').attr('id')
  window.open(window.location.origin + "/memo/view/" + id)
 })

 $(document).on('click', '.memo-read', function () {
  let id = $(this).parents('tr').attr('id')
  let memoNo = $(this).parents('tr').find('td:nth-child(1)').text()
  let memoTopic = $(this).parents('tr').find('td:nth-child(2)').text()
  let table
  var modal = '\
  <div class="modal fade" id="extraModal" >\
   <div class="modal-dialog">\
    <div class="modal-content">\
     <div class="modal-header">\
       <h5 class="modal-title">รายชื่อผู้เปิดอ่านเอกสาร\n<br>' + memoNo + ': ' + memoTopic + '</h5>\
       <button type="button" class="justify-content-end" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
     </div>\
     <div class="modal-body">\
      <table class="display cell-border nowrap" id="modalTable" style="width:100%">\
       <thead>\
        <tr>\
         <th>ชื่อ-สกุล</th>\
         <th>ตำแหน่ง</th>\
         <th>เปิดดูเอกสารครั้งแรก</th>\
        </tr>\
       </thead>\
      </table>\
     </div>\
     <div class="modal-footer">\
      <button type="button" id="closeModal" class="btn btn-info btn-sm">ปิด</button>\
     </div>\
    </div>\
   </div>\
  </div>\
  '
  $.ajax({
   url: '/cross',
   type: "GET",
   dataType: "json",
   async: false,
   data: {
    path: '/memolog/findread',
    method: 'GET',
    option: {
     memoId: id
    }
   },
   success: function (data) {
    table = data
   },
   error: function (request, status, error) {
    table = error
   }
  })
  modal = $(modal).appendTo('body')
  $('#extraModal').on('click', '#closeModal', function () {
   $('#extraModal').modal("hide")
  })

  $('#extraModal').modal('show').on('hidden.bs.modal', function () {
   this.remove()
  })

  $("#modalTable").DataTable({
   data: table,
   columns: [{
     data: 'userRead'
    },
    {
     data: 'userPosition'
    },
    {
     data: 'dateRead'
    }
   ]
  })
 })

 $(document).on('click', '#memo-return,#memo-approve,#memo-reject', function (e) {
  let event = e.target.id
  let matchEvent = ['memo-return', 'memo-approve', 'memo-reject'].indexOf(event)
  let memoSubject = $(this).parents('tr').find('td:nth-child(2)').text()
  let memoId = $(this).parents('tr').attr('id')
  let status = $(this).parents('tr').data('status')
  let admin = $(this).parents('tr').data('admin')
  let boss = $(this).parents('tr').data('boss')
  let approver = $(this).parents('tr').data('approver')
  let titleMessage = ['ตีกลับเอกสาร', 'อนุมัติเอกสาร', 'ไม่อนุมัติเอกสาร']
  $.confirm({
   title: titleMessage[matchEvent],
   content: 'ยืนยันการ' + titleMessage[matchEvent] + ' เรื่อง' + memoSubject,
   theme: 'bootstrap',
   closeIcon: true,
   animation: 'scale',
   type: 'blue',
   buttons: {
    confirm: function () {
     $.ajax({
      url: '/memo/action',
      type: "POST",
      dataType: 'json',
      async: false,
      data: {
       event: event,
       memoId: memoId,
       status: status,
       eventId: matchEvent,
       admin: admin,
       boss: boss,
       approver: approver
      },
      success: function (data) {
       //$.alert('ดำเนินการ'+ titleMessage[matchEvent] +'เรียบร้อยแล้ว')
       location.reload()
      }
     })
    },
    cancel: function () {
     $.alert('ยกเลิกการ' + titleMessage[matchEvent])
    }
   }
  })
 })

 $(document).on('click', '.memo-edit', function () {
  let id = $(this).parents('tr').attr('id')
  let host = window.location.origin
  window.location.href = host +"/memo/edit/" + id
 })

 $(document).on('click','.memo-info',function(){
  let id = $(this).parents('tr').attr('id')
  let memoNo = $(this).parents('tr').find('td:nth-child(1)').text()
  let memoTopic = $(this).parents('tr').find('td:nth-child(2)').text()
  var modal = '\
  <div class="modal fade" id="extraModal" >\
   <div class="modal-dialog">\
    <div class="modal-content">\
     <div class="modal-body">\
      <div class="container-timeline">\
       <div class="comment-head">รายการข้อคิดเห็น</div>\
       <div class="comment-doc">'+ memoNo +': '+ memoTopic +'</div>\
      </div>\
     </div>\
     <div class="modal-footer">\
      <button type="button" id="closeModal" class="btn btn-info btn-sm">ปิด</button>\
     </div>\
    </div>\
   </div>\
  </div>\
  '

  modal = $(modal).appendTo('body')

  $.ajax({
   type: 'get',
   url: '/memo/getlog',
   async: false,
   data: {
    memoId: id
   },
   success: function(data) {
    $('.container-timeline').append(toHtml(data))
   }
  })

  $('#extraModal').on('click', '#closeModal', function () {
   $('#extraModal').modal("hide")
  })

  $('#extraModal').modal('show').on('hidden.bs.modal', function () {
   this.remove()
  })
 })

 $(document).on('click', '.memo-comment', function () {
  let maxChar = 250
  let memoId = $(this).parents('tr').attr('id')
  let memoNo = $(this).parents('tr').find('td:nth-child(1)').text()
  let memoTopic = $(this).parents('tr').find('td:nth-child(2)').text()
  let oldComment
  $.ajax({
   url: '/cross',
   type: "GET",
   dataType: "json",
   async: false,
   data: {
    path: "/memolog/getlast",
    method: "get",
    option: {
     memoId: memoId
    }
   },
   success: function (data) {
    oldComment = data.text
   }
  })
  var modal = '\
  <div class="modal fade" id="extraModal" >\
   <div class="modal-dialog">\
    <div class="modal-content">\
     <div class="modal-header">\
       <h5 class="modal-title">แสดงความคิดเห็นเพิ่มเติมสำหรับเอกสาร\n<br>' + memoNo + ': ' + memoTopic + '</h5>\
       <button type="button" class="justify-content-end" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
     </div>\
     <div class="modal-body">\
      <form>\
       <div class="row align-items-center">\
        <label class="col-sm-4 col-form-label">เพิ่มความคิดเห็น</label>\
        <div class="col-sm-8">\
         <textarea rows="3" id="modal-comment" style="min-width: 100%" maxlength="'+maxChar+'" data-id="' + memoId + '">'+(oldComment ? oldComment : "")+'</textarea>\
         <label id="maxLength" class="d-flex justify-content-end">'+(oldComment ? oldComment.length : 0)+'/'+maxChar+'</label>\
        </div>\
       </div>\
      </form>\
     </div>\
     <div class="modal-footer">\
     <button type="submit" id="saveExtraDate" class="btn btn-success btn-sm mr-1">บันทึก</button>\
     <button type="button" id="cancelExtraDate" class="btn btn-danger btn-sm">ยกเลิก</button>\
     </div>\
    </div>\
   </div>\
  </div>\
  '

  modal = $(modal).appendTo('body')
  $('#extraModal').on('click', '#saveExtraDate', function () {
   let comment = $('#modal-comment').val() || null
   let memoId = $('#modal-comment').data('id')
   if (comment == null) {
    alert("กรุณากรอกความคิดเห็น")
   } else {
    $.ajax({
     url: '/cross/commentpost',
     type: "POST",
     dataType: "json",
     async: false,
     data: {
      memoId: memoId,
      comment: comment
     },
     success: function (data) {

     }
    })
    $('#extraModal').modal("hide")
   }
  })

  $('#extraModal').on('keypress', '#modal-comment', function (e) {
   let count = $(this).val().length
   $('#extraModal').find('#maxLength').text(count + "/"+maxChar)
  })
  $('#extraModal').on('keyup', '#modal-comment', function (e) {
   let count = $(this).val().length
   $('#extraModal').find('#maxLength').text(count + "/"+maxChar)
  })

  $('#extraModal').on('click', '#cancelExtraDate', function () {
   $('#extraModal').modal("hide")
  })

  $('#extraModal').modal('show').on('hidden.bs.modal', function () {
   this.remove()
  })
 })

 function toHtml(data) {
  let code = []
  for (let day in data) {
   for (let time in data[day]) {
    let line = data[day][time]
    switch (line.status) {
     case 0:
      code.push('<div class="timeline-item" date-is="'+line.timeshow+'"><h1>'+line.user+'</h1><p>ยกเลิกเอกสาร</p></div>')
      break
     case 1:
      code.push('<div class="timeline-item" date-is="'+line.timeshow+'"><h1>'+line.user+'</h1><p>สร้างเอกสาร</p></div>')
      break
     case 2:
      code.push('<div class="timeline-item" date-is="'+line.timeshow+'"><h1>'+line.user+'</h1><p>ผู้ตรวจสอบส่งกลับเอกสารเพื่อแก้ไข</p></div>')
      break
     case 3:
      code.push('<div class="timeline-item" date-is="'+line.timeshow+'"><h1>'+line.user+'</h1><p>ยืนยันการตรวจสอบเอกสาร</p></div>')
      break
     case 4:
      code.push('<div class="timeline-item" date-is="'+line.timeshow+'"><h1>'+line.user+'</h1><p>ผู้อนุมัติส่งกลับเอกสารเพื่อแก้ไข</p></div>')
      break
     case 5:
      code.push('<div class="timeline-item" date-is="'+line.timeshow+'"><h1>'+line.user+'</h1><p>อนุมัติเอกสาร</p></div>')
      break
     case 6:
      code.push('<div class="timeline-item" date-is="'+line.timeshow+'"><h1>'+line.user+'</h1><p>ไม่อนุมัติเอกสาร</p></div>')
      break
     case 7:
      code.push('<div class="timeline-item" date-is="'+line.timeshow+'"><h1>'+line.user+'</h1><p>เปิดดูเอกสาร</p></div>')
      break
     case 8:
      code.push('<div class="timeline-item" date-is="'+line.timeshow+'"><h1>'+line.user+'</h1><p>'+line.comment+'</p></div>')
      break
     case 9:
      code.push('<div class="timeline-item" date-is="'+line.timeshow+'"><h1>'+line.user+'</h1><p>แก้ไขเอกสาร</p></div>')
      break
    }
   }
  }
  return code
 }

})