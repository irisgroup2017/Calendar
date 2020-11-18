$(function($) {
 let source = $('.modal-memo-content').text()
 $('.modal-memo-content').text("").html(source)
 $('.modal-memo').each(function() {
  snipMe.call(this)
 })

 var max_pages = 30;
 var page_count = 0;
 function snipMe() {
  page_count++;
  if (page_count > max_pages) {
    return;
  }
  var content = $(this).find('.modal-page .modal-memo-head')
  var page = $(this).find('.modal-page')
  var long = ($(page)[0].scrollHeight) - Math.ceil($(this).height());
  var children = $(content).children().toArray();
  var removed = [];
  while (long > 0 && children.length > 0) {
    var child = children.pop()
    var cont = $(child).attr('class')
    var childcontent = $(child).children().toArray()
    if (cont == "modal-memo-content") {
     while (long > 0 && childcontent.length > 0) {
      child = childcontent.pop()
      removed.unshift('<div class="modal-memo-content">'+child.outerHTML+'</div>')
      $(child).detach()
      long = ($(page)[0].scrollHeight) - Math.ceil($(this).height());
     }
    } else {
     removed.unshift(child)
     $(child).detach()
     long = ($(page)[0].scrollHeight) - Math.ceil($(this).height());
    }
  }
  if (removed.length > 0) {
    var a4 = $('.modal-memo:last')
    $(a4).after('<div class="modal-memo page-break"><div class="modal-page"><div class="modal-memo-head"></div></div></div>')
    content = $('.modal-memo:last .modal-page .modal-memo-head')
    content.append(removed)
    $(this).after(a4)
    $(a4).addClass("overflow-hidden")
    var a4new = $(".modal-memo:last")
    snipMe.call(a4new[0])
  } else {
   var a4 = $('.modal-memo:last')
   $(a4).addClass("overflow-hidden")
   if ($('.print-button').length == 0) {
    $(a4).after('\
    <div class="button-section" style="position:relative; top:-20px;">\
     <button class="btn btn-secondary close-button" type="button">ปิด</button>\
    </div>')
   }
  }
 }
 $(document).on('click','.close-button',function(){
  window.close()
 })
})