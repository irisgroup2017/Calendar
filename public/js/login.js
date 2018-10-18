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
})