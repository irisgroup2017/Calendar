jQuery(function($) {
  $(".toggle-password").mousedown(function() {
    $(this).toggleClass("fa-eye fa-eye-slash")
    var input = $($(this).attr("toggle"))
      input.attr("type", "text")
  })
  $(".toggle-password").mouseup(function() {
    $(this).toggleClass("fa-eye fa-eye-slash")
    var input = $($(this).attr("toggle"))
      input.attr("type", "password")
  })

  $('#fpw').on('click',function() {
    var modal = 
        '<div class="modal fade">\
          <div class="modal-dialog modal-sm">\
            <div class="modal-content">\
              <div class="modal-body">\
                <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
                <form class="no-margin">\
                  <h5>อีเมล์บริษัท :</h5>\
                  <span class="input-icon">\
                  <input id="email" type="text"/>\
                </form>\
              </div>\
              <div class="modal-footer">\
                <button type="button" class="btn btn-sm btn-danger" data-action="changepw"><i class="ace-icon fa fa-paper-plane-o"></i> Send Password</button>\
                <button type="button" class="btn btn-sm btn-info" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> Cancel</button>\
              </div>\
            </div>\
          </div>\
        </div>'
    var modal = $(modal).appendTo('body')
      modal.find('button[data-action=changepw]').on('click',function() {
        var email = $('input#email').val()
        $.ajax({
          url: '/privacy',
          type: "POST",
          dataType: 'text',
          async: false,
          data: {
              'state': 'fpw',
              'email': email
              },
          success: function(data) {
              if (data == "NE") {
                  modal.find('input[id=email]').addClass('error')
                  modal.find(".oldpass").css("display","inline-block")
                  modal.find(".error").first().focus()
                  alert('ไม่พบที่อยู่อีเมล์ในระบบ')
              } else { 
                alert('ตรวจสอบอีเมล์เพื่อรับรหัสผ่าน')
                modal.remove() 
              }
          }
      })
    })

    modal.modal('show').on('hidden', function(){
      modal.remove()
    })
  })
})