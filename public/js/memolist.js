jQuery(function ($) {
 var dt = $("#display-table").DataTable({
  dom: 'Bfrtip',
  scrollX: true,
  paging: true,
  pageLength: 15,
  searching: true,
  order: [1, 'ASC'],
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
    text: 'เอกสารทั้งหมด',
    className: 'btn btn-success',
    action: function (e, dt, node, config) {
     let table = $("#display-table").DataTable()
     table.columns().search('').draw()
    }
   },
   {
    text: 'เอกสารเข้า',
    className: 'btn btn-success',
    action: function (e, dt, node, config) {
     let table = $("#display-table").DataTable()
     table.columns().search('').draw()
     table.column(4).search($('.data-search').data('find'), true, false).draw()
    }
   },
   {
    text: 'เอกสารออก',
    className: 'btn btn-success',
    action: function (e, dt, node, config) {
     let table = $("#display-table").DataTable()
     table.columns().search('').draw()
     table.column(3).search($('.data-search').data('find'), true, false).draw()
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
      <div class="col-sm-1 datatable-option file-memo"><a class="fa fa-file-o color-black memo-file" title="แนบไฟล์ข้อมูล"></a></div>\
      <div class="col-sm-1 datatable-option read-memo"><a class="fa fa-list-alt color-purple memo-read" title="รายชื่อคนเปิดดูเอกสาร"></a></div>\
      <div class="col-sm-1 datatable-option info-memo"><a class="fa fa-info color-navy memo-info" title="รายละเอียดข้อมูลการดำเนินการเอกสาร"></a></div>\
      <div class="col-sm-1 datatable-option edit-memo"><a class="fa fa-pencil-square-o color-olive memo-edit" title="แก้ไขเอกสาร"></a></div>\
      <div class="col-sm-1 datatable-option return-memo"><a class="fa fa-undo color-fuchsia memo-return" id="memo-return" title="ส่งกลับเพื่อแก้ไข"></a></div>\
      <div class="col-sm-1 datatable-option approve-memo"><a class="fa fa-check-circle color-green memo-approve" id="memo-approve" title="อนุมัติเอกสาร"></a></div>\
      <div class="col-sm-1 datatable-option reject-memo"><a class="fa fa-times-circle color-red memo-reject" id="memo-reject" title="ไม่อนุมัติเอกสาร"></a></div>\
      <div class="col-sm-1 datatable-option delete-memo"><a class="fa fa-trash color-orange memo-delete" id="memo-delete" title="ลบ"></a></div>\
     </div>',
   "targets": -1
  }]
  //
  //
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
   <div class="modal-dialog modal-lg">\
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

 $(document).on('click', '#memo-return,#memo-approve,#memo-reject,#memo-delete', function (e) {
  let event = e.target.id
  let matchEvent = ['memo-return', 'memo-approve', 'memo-reject','memo-delete'].indexOf(event)
  let memoSubject = $(this).parents('tr').find('td:nth-child(2)').text()
  let memoId = $(this).parents('tr').attr('id')
  let status = $(this).parents('tr').data('status')
  let admin = $(this).parents('tr').data('admin')
  let boss = $(this).parents('tr').data('boss')
  let approver = $(this).parents('tr').data('approver')
  let titleMessage = ['ตีกลับเอกสาร', 'อนุมัติเอกสาร', 'ไม่อนุมัติเอกสาร','ยกเลิกเอกสาร']
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
  window.location.href = host + "/memo/edit/" + id
 })

 $(document).on('click', '.memo-info', function () {
  let id = $(this).parents('tr').attr('id')
  let memoNo = $(this).parents('tr').find('td:nth-child(1)').text()
  let memoTopic = $(this).parents('tr').find('td:nth-child(2)').text()
  var modal = '\
  <div class="modal fade" id="extraModal" >\
   <div class="modal-dialog" style="max-width: 50%;">\
    <div class="modal-content">\
     <div class="modal-body">\
      <div class="container-timeline">\
       <div class="comment-head">รายการข้อคิดเห็น</div>\
       <div class="comment-doc">' + memoNo + ': ' + memoTopic + '</div>\
      </div>\
     </div>\
     <div class="wrapper">\
      <div class="popup">\
      <i class="fa fa-close fa-3x closefile" style="display:inline;"></i>\
       <div class="showfile">\
       </div>\
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
  $(".popup").hide()
  $.ajax({
   type: 'get',
   url: '/memo/getlog',
   async: false,
   data: {
    memoId: id
   },
   success: function (data) {
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

 $(document).on('click', '.memo-file', function (e) {
  let data = $(this).parents('tr').data()
  var modal = '\
  <div class="modal fade upload" data-id="'+data.id+'" data-status="'+data.status+'" id="uploadModal">\
   <div class="modal-dialog upload-files">\
    <div class="modal-content">\
     <div class="modal-header">\
      <div class="exp">\
       <div class="checkbox">\
        <form>\
         <div>\
          <input type="checkbox" id="approverequest" name="check" value="" />\
          <label for="approverequest">\
           <span></span>โปรดทำเครื่องหมายหากไฟล์นี้เป็นเอกสารลงนามอนุมัติ\
          </label>\
         </div>\
        </form>\
       </div>\
      </div>\
     </div>\
     <form enctype="multipart/form-data" id="formfile" name=""filem>\
      <div class="modal-body body" id="drop">\
       <i class="fa fa-file-text-o pointer-none" aria-hidden="true"></i>\
       <p class="pointer-none"><b>ลากไฟล์มาวาง</b> บริเวณนี้ <br /> หรือ <a class="color-blue" href="" id="triggerFile">ค้นหาไฟล์</a> เพื่อทำการอัพโหลดเอกสาร <br />\
       อนุญาตให้อัพโหลดไฟล์ <b>รูปภาพ</b> และ <b>เอกสาร PDF</b> เท่านั้น</p>\
       <input type="file" name="file" id="filem" multiple="multiple" accept="image/*,.pdf"/>\
      </div>\
     </form>\
     <footer>\
      <div class="divider">\
       <span><AR>รายการไฟล์</AR></span>\
      </div>\
      <div class="list-files">\
       <!--   template   -->\
      </div>\
      <button class="importar">ทำต่อ</button>\
     </footer>\
     <div class="modal-footer">\
      <button type="button" id="closeModal" class="btn btn-info btn-sm">ปิด</button>\
     </div>\
    </div>\
   </div>\
  </div>\
  '
  modal = $(modal).appendTo('body')
  $('#uploadModal').on('click', '#closeModal', function () {
   $('#uploadModal').modal("hide")
  })

  $('#uploadModal').modal('show').on('hidden.bs.modal', function () {
   this.remove()
  })

  // drop events
  var dropzone = $("#drop"),
  input = $(dropzone).add('input[type=file]')
  dropzone.on({
   dragenter : dragin,
   dragover : dragin,
   dragleave : dragout,
   drop: drop
  });
  input.on('change',drop)
  function dragin(e) { //function for drag into element, just turns the bix X white
   e.preventDefault();  
   e.stopPropagation();
   $(dropzone).addClass('active');
  }
  function dragout(e) { //function for dragging out of element  
   e.preventDefault();  
   e.stopPropagation();                       
   $(dropzone).removeClass('active');
  }
  function drop(e) {
   e.preventDefault();  
   e.stopPropagation();
   let status = $(this).parents('.modal').data("status")
   let approveRequest = $("#approverequest").is(':checked')
   var file = (e.type == "drop" ? e.originalEvent.dataTransfer.files : e.target.files);
   $('#drop').removeClass("active")
   // upload file
   if ((!approveRequest) || (approveRequest && status == "3")) {
    handleFileSelect(file);
   } else {
    $.alert("สามารถแนบเอกสารลงนามอนุมัติ เมื่อเอกสารอยู่ในสถานะรออนุมัติเท่านั้น")
   }
  }  

  function handleFileSelect(files) {
    //files template
    let approveRequest = $("#approverequest").is(':checked')
    let template = `${Object.keys(files).
    map(file => `<div class="file file--${file}">
     <div class="name"><span>${files[file].name}</span></div>
     <progress class="progress" value="0" max="100"></progress>
     <div class="done">
     <a href="" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1000 1000">
      <g><path id="path" d="M500,10C229.4,10,10,229.4,10,500c0,270.6,219.4,490,490,490c270.6,0,490-219.4,490-490C990,229.4,770.6,10,500,10z M500,967.7C241.7,967.7,32.3,758.3,32.3,500C32.3,241.7,241.7,32.3,500,32.3c258.3,0,467.7,209.4,467.7,467.7C967.7,758.3,758.3,967.7,500,967.7z M748.4,325L448,623.1L301.6,477.9c-4.4-4.3-11.4-4.3-15.8,0c-4.4,4.3-4.4,11.3,0,15.6l151.2,150c0.5,1.3,1.4,2.6,2.5,3.7c4.4,4.3,11.4,4.3,15.8,0l308.9-306.5c4.4-4.3,4.4-11.3,0-15.6C759.8,320.7,752.7,320.7,748.4,325z"</g>
      </svg>
      </a>
     </div>
    </div>`).
    join("")}`;

    $("#drop").addClass("hidden");
    $("footer").addClass("hasFiles");
    $(".list-files").html(template)

    Object.keys(files).forEach(file => {
     let dat = files[file]
     let formdata = new FormData()
     formdata.append("file", dat)
     formdata.append("list", file)
     formdata.append("approve",approveRequest)
     formdata.append("memoid", data.id)
     $.ajax({
      url: "/fileuploadmemo",
      xhr: function () {
       var xhr = new window.XMLHttpRequest();
       xhr.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable) {
         //console.log('Bytes Loaded: ' + e.loaded);
         //console.log('Total Size: ' + e.total);
         //console.log('Percentage Uploaded: ' + ((e.loaded / e.total) * 100) + '%');
         var percent = Math.round((e.loaded / e.total) * 100);
         $('.file--'+file).find(".progress").val(percent)
        }
       });
       return xhr;
      },
      type: "POST",
      enctype: 'multipart/form-data',
      data: formdata,
      processData: false, //prevent jQuery from automatically transforming the data into a query string
      contentType: false,
      cache: false,
      success: (data) => {
       $(".importar").addClass("active");
       $('.file--'+data.files).find(".progress").val("100").next().addClass("anim")
      },
      error: (e) => {
       console.log(e.responseText)
      }
     })
    });
  }

  // trigger input
  $("#triggerFile").on("click",function(evt) {
    evt.preventDefault();
    $("input[type=file]").click();
  })

  //upload more
  $(".importar").on("click", () => {
   $("footer").removeClass("hasFiles");
   $(".list-files").html("")
   $(".importar").removeClass("active");
   setTimeout(() => {
     $("#drop").removeClass("hidden");
   }, 500);
  });
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
         <textarea rows="3" id="modal-comment" style="min-width: 100%" maxlength="' + maxChar + '" data-id="' + memoId + '">' + (oldComment ? oldComment : "") + '</textarea>\
         <label id="maxLength" class="d-flex justify-content-end">' + (oldComment ? oldComment.length : 0) + '/' + maxChar + '</label>\
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
   $('#extraModal').find('#maxLength').text(count + "/" + maxChar)
  })
  $('#extraModal').on('keyup', '#modal-comment', function (e) {
   let count = $(this).val().length
   $('#extraModal').find('#maxLength').text(count + "/" + maxChar)
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
    console.log(line)
    switch (line.status) {
     case 0:
      code.push('<div class="timeline-item doc-cancel" date-is="' + line.timeshow + '"><h1>' + line.user + '</h1><p>ยกเลิกเอกสาร</p></div>')
      break
     case 1:
      code.push('<div class="timeline-item doc-create" date-is="' + line.timeshow + '"><h1>' + line.user + '</h1><p>สร้างเอกสาร</p></div>')
      break
     case 2:
      code.push('<div class="timeline-item doc-return-c" date-is="' + line.timeshow + '"><h1>' + line.user + '</h1><p>ผู้ตรวจสอบส่งกลับเอกสารเพื่อแก้ไข</p></div>')
      break
     case 3:
      code.push('<div class="timeline-item doc-check" date-is="' + line.timeshow + '"><h1>' + line.user + '</h1><p>ยืนยันการตรวจสอบเอกสาร</p></div>')
      break
     case 4:
      code.push('<div class="timeline-item doc-return-a" date-is="' + line.timeshow + '"><h1>' + line.user + '</h1><p>ผู้อนุมัติส่งกลับเอกสารเพื่อแก้ไข</p></div>')
      break
     case 5:
      code.push('<div class="timeline-item doc-approve" date-is="' + line.timeshow + '"><h1>' + line.user + '</h1><p>อนุมัติเอกสาร</p></div>')
      break
     case 6:
      code.push('<div class="timeline-item doc-reject" date-is="' + line.timeshow + '"><h1>' + line.user + '</h1><p>ไม่อนุมัติเอกสาร</p></div>')
      break
     case 7:
      code.push('<div class="timeline-item doc-read" date-is="' + line.timeshow + '"><h1>' + line.user + '</h1><p>เปิดดูเอกสาร</p></div>')
      break
     case 8:
      code.push('<div class="timeline-item doc-comment" date-is="' + line.timeshow + '"><h1>' + line.user + '</h1><p>' + line.comment + '</p></div>')
      break
     case 9:
      code.push('<div class="timeline-item doc-edit" date-is="' + line.timeshow + '"><h1>' + line.user + '</h1><p>แก้ไขเอกสาร</p></div>')
      break
     case 10:
      code.push('<div class="timeline-item doc-attach" date-is="' + line.timeshow + '"><h1>' + line.user + '</h1><p>แนบไฟล์เอกสาร <i class="fa fa-paperclip modal-attach-file" title="'+line.originalName+'" data-path="'+line.path+'"> '+line.originalName+'</i></p></div>')
      break
    }
   }
  }
  return code
 }

 $(document).on('click','.modal-attach-file',function() {
  let data = window.location.origin +''+ $(this).data('path')
  fileExt = data.substring(data.lastIndexOf('.')).toLowerCase()
  $('.showfile').empty().append('<' + (fileExt == '.jpg' ? 'img' : 'iframe') + ' src="' + data + '" style="height: 100vh; width:100vh;"></iframe>')
  $(".modal-body").hide('slow')
  $(".popup").show('slow')
 })
 $(document).on('click','.closefile',function() {
  $(this).parent().hide("slow");
  $(".modal-body").show("slow");
});

var detailRows = [];

 $('#display-table tbody').on('click', 'tr td.details-control', function () {
  var tr = $(this).closest('tr');
  var icon = $(this).find('i.fa-arrow-right')
  var row = dt.row(tr);
  var idx = $.inArray(tr.attr('id'), detailRows);
  let loaded = $(this).data('loaded')
  let id = $(this).parents('tr').attr('id')

  if (row.child.isShown()) {
   icon.addClass('fa-rotate-0')
   icon.removeClass('fa-rotate-90')
   setTimeout(function() { icon.removeClass('fa-rotate-0') }, 1000)
   tr.removeClass('details');
   row.child.hide();

   // Remove from the 'open' array
   detailRows.splice(idx, 1);
  } else {
   tr.addClass('details');
   icon.addClass('fa-rotate-90')
   if (loaded) {

   } else {
    $.ajax({
     method: 'POST',
     url: '/memo/getdetail',
     data: {
      id:id
     },
     success: function(data) {
      row.child(format(data)).show()
     }
    })
   }
   //row.child(format(row.data())).show();

   // Add to the 'open' array
   if (idx === -1) {
    detailRows.push(tr.attr('id'));
   }
  }
 });

 // On each draw, loop over the `detailRows` array and show any child rows
 dt.on('draw', function () {
  $.each(detailRows, function (i, id) {
   $('#' + id + ' td.details-control').trigger('click');
  });
 });

 function format(data) {
  let text = "สร้างเอกสาร,ตรวจสอบเอกสาร,ผู้ตรวจสอบส่งกลับเอกสาร,ตรวจสอบแล้ว,รออนุมัติ,ผู้อนุมัติส่งกลับเอกสาร,อนุมัติแล้ว,ไม่อนุมัติ,บันทึกแล้ว".split(',')
  let progress = text.map((v,i) => {
   let disabled = (data.disabled.indexOf(i) > -1 ? ' disabled' : '')
   let checked = ((data.data[i] && data.data[i][0]) ? ' checked' : '')
   let time = (data.data[i] && data.data[i][1] ? moment(data.data[i][1]).add(543,'y').format('DD/MM/YYYY HH:mm') : '')
   return '<input type="checkbox" name="debt-amount" id="'+i+'" value="'+i+'"' +disabled+ '' +checked+ '><label data-debt-text="'+v+'"><div class="debt-time">'+time+'</div><div class="debt-amount-pos"></div>\</label>'
  })
  return '<div id="form-wrapper">\
   <form>\
    <h2 id="form-title">สถานะเอกสาร</h1>\
    <div id="debt-amount-slider">'+progress.join("")+'</div>\
   </form>\
  </div>'
 }
})