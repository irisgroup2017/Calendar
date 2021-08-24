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
    $('#dailyInputLine').append(dailyAddLine())
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

 function dailyAddLine() {
  let $element = $('<tr/>',{
   id: "thisid",
  })
  let dailyColType = ["date","text","select","text"]
  let dailyColClass = ["daily-date","daily-detail overflow-hidden","daily-status","daily-remark"]
  for (var i=0;i<4;i++) {
   let $td = $('<td/>',{
    class: dailyColClass[i],
    contenteditable: true
   })
   if (dailyColClass[i] == "daily-status") {
    let selectBox = '\
    <div class="select-box">\
     <div class="select-box__current" tabindex="1">\
      <div class=".select-box__value">\
       <input class="select-box__input" type="radio" id="status-inprogress" value="1" checked>\
       <p>อยู่ระหว่างดำเนินการ</p>\
      </div>\
      <div class=".select-box__value">\
       <input class="select-box__input" type="radio" id="status-waitapprove" value="2">\
       <p>รออนุมัติ</p>\
      </div>\
      <div class=".select-box__value">\
       <input class="select-box__input" type="radio" id="status-complete" value="3">\
       <p>ดำเนินการเสร็จสิ้น</p>\
      </div>\
      <i cless="fa fa-arrow-down select-box__icon" aria-hidden="true"></i>\
     </div>\
     <ul class="select-box__list">\
      <li>\
       <label class="select-box__option" for="status-inprogress" aria-hidden="aria-hidden">อยู่ระหว่างดำเนินการ</label>\
      </li>\
      <li>\
       <label class="select-box__option" for="status-waitapprove" aria-hidden="aria-hidden">รออนุมัติ</label>\
      </li>\
      <li>\
       <label class="select-box__option" for="status-complete" aria-hidden="aria-hidden">ดำเนินการเสร็จสิ้น</label>\
      </li>\
     </ul>\
    </div>'
    $td.append(selectBox)
   }
   /*
   let input = $('<input/>',{
    type: dailyColType[i],
   })
   $(td).append(input)*/
   $element.append($td)
  }
  return $element
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
     console.log(result)
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
})