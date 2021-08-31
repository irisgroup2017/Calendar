jQuery(function ($) {
 // ICON CLICK
 $(document).on('click','.dailyimage',function(e) {
  let date = $(this).parents('td').data('date')
  var dailyModal = '\
   <div class="modal fade" id="dailyModal" data-status='+($(this).hasClass('green') ? "update" : "insert")+' data-date="'+date+'">\
    <div class="modal-dialog modal-lg">\
     <div class="modal-content">\
     <div class="modal-header">\
      <h5 class="modal-title">กรอกรายละเอียดการทำงาน</h5>\
      <button type="button" class="justify-content-end" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
     </div>\
     <div class="modal-body table-responsive">\
      <table class="table table-bordered">\
       <thead>\
        <tr>\
         <td>วันที่</td>\
         <td>รายละเอียดการทำงาน</td>\
         <td>สถานะ</td>\
         <td>หมายเหตุ</td>\
        </tr>\
       </thead>\
       <tbody id="dailyInputLine"></tbody>\
      </table>\
     </div>\
     <div class="modal-footer">\
      <button type="button" id="submit-daily" class="btn btn-sm btn-primary">บันทึก</button>\
     </div>\
     </div>\
    </div>\
   </div>'

     /* FILE UPLOAD
      <div class="modal-header">\
        <h5 class="modal-title">แนบไฟล์บันทึกรายละเอียดการทำงาน</h5>\
        <button type="button" class="justify-content-end" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
      </div>\
      <div class="modal-body">\
       <form class="attach-file-button" method="POST" enctype="multipart/form-data">\
        <div class="input-group">\
         <div class="custom-file">\
          <input type="file" class="custom-file-input" name="file" id="attachFile" accept=".xls,.xlsx,.doc,.docx">\
          <label class="custom-file-label" for="attachFile">เลือกไฟล์</label>\
         </div>\
         <div>\
          <button type="button" class="btn btn-sm btn-success" id="attachFileSubmit" disabled>อัพโหลด</span>\
         </div>\
        </div>\
       </form>\
      </div>\
     </div>\
    </div>\
   </div>'
   */
   dailyModal = $(dailyModal).appendTo('body')

   dailyModal.on('show.bs.modal', function (e) {
    let oldReport
    let data = {date:date}
    let element = []
    $.ajax({
     method: "post",
     url: "/lar/dailyreport/get",
     contentType: 'application/json',
     dataType: "json",
     processData: false,
     async: false,
     data: JSON.stringify(data),
     success: function(result) {
      oldReport = result
     }
    })

    if (oldReport && oldReport.length > 0) {
     oldReport.map((line,i) => {
      element.push(dailyAddLine(line,i))
     })
    }
    element.push(dailyAddLine())
    $('#dailyInputLine').append(element)
   })

   dailyModal.modal('show').on('hidden.bs.modal', function () {
    this.remove()
   })
  })

  $('#attachFile').on('change',function() {
   let value = $(this).val().split('\\').pop()
   $(this).next().text(value)
   if (value == "") {
    $('#attachFileSubmit').prop('disabled',true)
   } else {
    $('#attachFileSubmit').prop('disabled',false)
   }
  })

 function dailyDetail(data) {
  this.id = data.id || "";
  this.date = moment(data.date).format("DD/MM/YYYY");
  this.detail = data.detail || "";
  this.status = data.status || 0;
  this.remark = data.remark || "";
 }

 function dailyAddLine(data = {},index = $("#dailyInputLine tr").length+1) {
  if (data && Object.keys(data).length < 1) {
   data.id = ""
   data.date = moment($('#dailyModal').data('date'),'YYYY-MM-DD')
   data.detail = ""
   data.status = ""
   data.remark = ""
  }
  let row = new dailyDetail(data)
  let $element = $('<tr/>',{
   id: row.id
  })
  let dailyColClass = ["daily-date","daily-detail overflow-hidden limit-255","daily-status","daily-remark limit-255"]
  let dailyColName = ["date","detail","status","remark"]
  let dailyColContenEdit = [false,true,false,true]
  for (var i=0;i<4;i++) {
   let name = dailyColName[i]
   let value = row[name]
   let $td = $('<td/>',{
    class: dailyColClass[i],
    name: name,
    contenteditable: dailyColContenEdit[i],
    text: getValue[name](value)
   })
   if (name == "status") {
    let selectBox = '\
     <select id="select-box-'+row.id+'" class="select">\
      <option value="0" '+(value == 0 ? "selected" : "")+' disabled hidden>เลือกสถานะ</option>\
      <option value="1" '+(value == 1 ? "selected" : "")+'>อยู่ระหว่างดำเนินการ</option>\
      <option value="2" '+(value == 2 ? "selected" : "")+'>รออนุมัติ</option>\
      <option value="3" '+(value == 3 ? "selected" : "")+'>ดำเนินการเสร็จสิ้น</option>\
     </select>'
    $td.append(selectBox)
   }
   $element.append($td)
  }
  return $element
 }

 const getValue = {
  date: (val) => {
   return val
  },
  detail: (val) => {
   return val
  },
  status: (val) => {
   return ""
  },
  remark: (val) => {
   return val
  },
 }
  /* FILE UPLOAD
  $('#attachFileSubmit').on('click',function() {
   let file = $('#attachFile')[0].files[0]
   let data = new FormData()
   data.append('date',$('#dailyModal').data('date'))
   data.append('status',$('#dailyModal').data('status'))
   data.append('file',file)
   $.ajax({
    type: "POST",
    enctype: 'multipart/form-data',
    url: "/upload/dailyfile",
    processData: false, //prevent jQuery from automatically transforming the data into a query string
    contentType: false,
    data: data,
    success: function(result) {
     if (result.status == "insert") {
      let thisIcon = $('.dailyimage[data-date="'+result.date+'"]')
      $(thisIcon).removeClass('maroon')
      $(thisIcon).addClass('green')
     }
     $('#dailyModal').modal("hide")
    }
   })
  })
 */
 // END

 $('#imageUpload').on('change',function() {
  let value = $(this).val().split('\\').pop()
  if (value) {
   let element = $('.file-button')[0]
   let data = new FormData(element)
   $.ajax({
    method: "POST",
    enctype: 'multipart/form-data',
    url: "/upload/pic",
    processData: false, //prevent jQuery from automatically transforming the data into a query string
    contentType: false,
    cache: false,
    data: data,
    success: function(result) {
     let date = moment().format('YYYY-MM-DD')
     if (result.status) {
      $('.fc-content-skeleton thead tr td.fc-day-top[data-date='+date+']').prepend('<i class="dailyimage maroon fa fa-file-image-o fa-2 fc-left" data-date='+date+' data-path='+result.file.path+'></i>')
     } else {
      $('.fc-content-skeleton thead tr td.fc-day-top[data-date='+date+'] .dailyimage').data('path',result.file.urlpath)
     }
    },
    error: function(err) {
     console.log(err)
    }
   })
  }
 })

 $(document).on('keydown','.limit-255',function(e) {
  let key = e.key
  let textLength = $(this).text().length;
  if (key === "Backspace" || key === "Delete") { textLength-- }
  if (textLength > 254) {
   e.preventDefault();
   $(this).addClass("error")
  } else {
   $(this).removeClass("error")
  }
 })

 $(document).on('change','[id^=select-box-]',function() {
  if ($(this).parents('tr').is(':last-child')) {
   $('#dailyInputLine').append(dailyAddLine())
  }
 })

 $(document).on("click","#submit-daily",async function() {
  let dataInput = $("#dailyInputLine tr")
  let status = $("#dailyModal").data('status')
  let data = []
  $.each(dataInput,function(i,row) {
   let id = $(row).attr("id")
   let result = getDataInput(id,$(row).find("td"))
   if (result) {
    data.push(result)
   }
  })
  if (data.length) {
   $.ajax({
    url: "/lar/dailyreport/add",
    method: "POST",
    contentType: 'application/json',
    dataType: "json",
    async: false,
    data: JSON.stringify({
     status: status,
     data: data
    }),
    success: function(result) {
     let thisIcon = $('.dailyimage[data-date="'+result[0].date+'"]')
     $(thisIcon).removeClass('maroon')
     $(thisIcon).addClass('green')
     $('#dailyModal').modal("hide")
    }
   })
  } else {
   $.alert('ไม่มีข้อมูลบันทึก')
  }
 })

 function getDataInput(id,row) {
  let result = {}
  if (id) {
   result.id = id
  }
  $.each(row,function(index,value) {
   let name = $(value).attr("name")
   let val
   switch (name) {
    case "date": 
     val = moment($(value).text(),"DD/MM/YYYY").format("YYYY-MM-DD")
     break
    case "detail":
     val = $(value).text()
     break
    case "status":
     val = $(value).find(":selected").val()
     break
    case "remark":
     val = $(value).text()
     break
   }
   result.dateedit = new Date()
   if (val != "") {
    result[name] = val
   }
  })
  return (result.detail != undefined && result.status != 0 ? result : "")
 }
}) // END OF JQUERY