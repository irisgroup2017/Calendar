$(function($) {
 var clicked = true
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
     <button class="btn btn-secondary print-button" type="button">พิมพ์</button>\
     <button class="btn btn-secondary close-button" type="button">ปิด</button>\
    </div>')
   }
  }
 }
 $(document).on('click','.print-button',function() {
  if (clicked) {
   clicked = false
   printDiv()
  }
  clicked = true
 })
 $(document).on('click','.close-button',function(){
  window.close()
 })

 function printDiv() {
  printElement = $('.modal-memo')
  var mywindow = window.open('', 'PRINT');
  var cssList = ['../public/css/ace.min.css','../public/css/memo.css','../public/css/bootstrap.min.css','https://fonts.googleapis.com/css2?family=Sarabun&display=swap']
  var loadCount = cssList.length
 
  mywindow.document.write('<html><head><title>' + document.title  + ' test</title>');
  for (css in cssList) {
   var link = mywindow.document.createElement('link');
   link.setAttribute("rel", "stylesheet");
   if (cssList[css].split('.').pop() == 'css') { link.setAttribute("type", "text/css"); }
   link.onload = function(){
    if (--loadCount == 0) {
     mywindow.print();
     mywindow.close();
    }
   }
   link.setAttribute("href", cssList[css]);
   mywindow.document.getElementsByTagName("head")[0].appendChild(link);
  }

  mywindow.document.write('</head><body>');
  for (item of printElement) {
   mywindow.document.write(item.innerHTML);
  }
  mywindow.document.write('</body></html>');
 }
 window.printDiv = printDiv

 $(document).on('click','.modal-attach-file',function() {
  let data = window.location.origin +''+ $(this).data('path')
  $("#animatedModal").animatedModal({
   modalTarget: 'animatedModal',
   animatedIn: 'bounceInUp',
   animatedOut: 'bounceOutDown',
   color: '#FFFFFF',
   animationDuration: '.5s',
   beforeOpen: function () {
    var children = $(".thumb")
    var index = 0
    function addClassNextChild() {
     if (index == children.length) return;
     children.eq(index++).show().velocity("transition.slideUpIn", {
      opacity: 1,
      stagger: 450,
      defaultDuration: 100
     })
     window.setTimeout(addClassNextChild, 100)
    }
    addClassNextChild()
   },
   afterClose: function () {
    $(".thumb").hide()
    $('.showfile').empty()
   }
  })
  fileExt = data.substring(data.lastIndexOf('.')).toLowerCase()
  $('.showfile').append('<' + (fileExt == '.jpg' ? 'img' : 'iframe') + ' src="' + data + '" style="height: 100vh; width:100vh;"></iframe>')
 })
})
