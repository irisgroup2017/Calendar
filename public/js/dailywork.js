jQuery(function ($) {
 $(document).on('click','.dailyimage',function(e) {
  var dailyModal = '\
   <div class="modal fade" id="dailyModal" data-id="'+$(this).data('id')+'">\
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
         <div class="input-group-append">\
          <button class="input-group-text btn btn-sm btn-success" id="attachFileSubmit" disabled>อัพโหลด</span>\
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
   data.append('id',$('#dailyModal').data('id'))
   $.ajax({
    type: "POST",
    enctype: 'multipart/form-data',
    url: "/upload/dailyfile",
    data: data,
    processData: false, //prevent jQuery from automatically transforming the data into a query string
    contentType: false,
    cache: false,
    success: function(result) {
     let thisIcon = $('.dailyimage[data-id="'+result.id+'"]')
     $(thisIcon).removeClass('maroon')
     $(thisIcon).addClass('green')
     $('#dailyModal').modal("hide")
    }
   })
  })
 })
})