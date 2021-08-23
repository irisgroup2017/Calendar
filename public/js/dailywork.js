jQuery(function ($) {
 // ICON CLICK
 $(document).on('click','.dailyimage',function(e) {
  var dailyModal = '\
   <div class="modal fade" id="dailyModal" data-date="'+$(this).parents('td').data('date')+'">\
    <div class="modal-dialog">\
     <div class="modal-content">\
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
   dailyModal = $(dailyModal).appendTo('body')

   dailyModal.on('show.bs.modal', function (e) {

   })

  $('#dailyModal').modal('show').on('hidden.bs.modal', function () {
   this.remove()
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

  $('#attachFileSubmit').on('click',function() {
   let file = $('.attach-file-button')[0]
   let data = new FormData(file)
   data.append('id',$('#dailyModal').data('date'))
   $.ajax({
    type: "POST",
    enctype: 'multipart/form-data',
    url: "/upload/dailyfile",
    processData: false, //prevent jQuery from automatically transforming the data into a query string
    contentType: false,
    cache: false,
    data: data,
    success: function(result) {
     let thisIcon = $('.dailyimage[data-date="'+result.id+'"]')
     $(thisIcon).removeClass('maroon')
     $(thisIcon).addClass('green')
     $('#dailyModal').modal("hide")
    }
   })
  })
 })
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