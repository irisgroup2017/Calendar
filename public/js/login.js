// Opera 8.0+
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined'
// Safari 3.0+ "[object HTMLElementConstructor]" 
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))
// Internet Explorer 6-11
var isIE = /*@cc_on!@*/false || !!document.documentMode
// Edge 20+
var isEdge = !isIE && !!window.StyleMedia
// Chrome 1 - 71
var isChrome = window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)
// Blink engine detection
var isBlink = (isChrome || isOpera) && !!window.CSS

jQuery(function($) {
  $(".toggle-password").on('mousedown',function() {
    $(this).toggleClass("fa-eye fa-eye-slash")
    var input = $($(this).attr("toggle"))
      input.attr("type", "text")
  })
  $(".toggle-password").on('mouseup',function() {
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
                  <h5>ใส่ที่อยู่อีเมล์บริษัท :</h5>\
                  <span class="input-icon">\
                  <input id="email" type="text"/>\
                </form>\
              </div>\
              <div class="modal-footer">\
                <button type="button" class="btn btn-sm btn-danger" data-action="changepw"><i class="ace-icon fa fa-paper-plane-o"></i> ส่งข้อมูล</button>\
                <button type="button" class="btn btn-sm btn-info" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> ยกเลิก</button>\
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