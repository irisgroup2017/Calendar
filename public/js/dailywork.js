jQuery(function ($) {
 $(document).on('click','.dailyimage',function(e) {
  var dailyModal = '\
    <div class="modal fade" id="dailyModal" >\
     <div class="modal-dialog">\
      <div class="modal-content">\
       <div class="modal-header">\
         <h5 class="modal-title">แนบไฟล์บันทึกรายละเอียดการทำงาน</h5>\
         <button type="button" class="justify-content-end" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
       </div>\
       <div class="modal-body">\
        <form class="attach-file-button">\
         <div class="input-group">\
          <div class="custom-file">\
           <input type="file" class="custom-file-input" id="attachFile" accept=".xls,.xlsx,.doc,.docx">\
           <label class="custom-file-label" for="attachFile" aria-describedby="attachFileAddon">เลือกไฟล์</label>\
          </div>\
          <div class="input-group-append">\
           <span class="input-group-text btn-sm btn-success" id="attachFileAddon">อัพโหลด</span>\
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
 })
})