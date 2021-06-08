$("#display-table").DataTable({
 dom: 'Bfrtip',
 scrollX: false,
 paging: true,
 searching: true,
 ordering: false,
 pageLength: 25,
 autoWidth: true,
 fixedHeader: {
  header: true,
  footer: false
 },
 search: {
  regex: true,
  smart: true
 },
 buttons: [{
  text: 'เพิ่มประกาศ',
  action: function (e, dt, node, config) {
   $("#adderModal").animatedModal({
    modalTarget: 'adderModal',
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
    }, //$(".close-adderModal").click()
    afterClose: function () {}
   })
  }
 }]
})

$(document).on('click','#form-submit',(e) => {
 var validExts = new Array(".pdf", ".jpg")
 var fileExt = $('#announceFile').val()
 fileExt = fileExt.substring(fileExt.lastIndexOf('.')).toLowerCase()
 if (validExts.indexOf(fileExt) < 0) {
  alert("นามสกุลไฟล์ไม่ถูกต้อง สามารถแนบได้เฉพาะไฟล์: " + validExts.toString() + " เท่านั้น")
  return false
 } else {
  let file = $('#upsiwa')[0]
  let data = new FormData(file)
  data.append('ext', fileExt)
  $.ajax({
   type: "POST",
   enctype: 'multipart/form-data',
   url: "/upload/createannounce",
   async: false,
   data: data,
   processData: false, //prevent jQuery from automatically transforming the data into a query string
   contentType: false,
   cache: false,
   success: (data) => {
    //var file = data.start + '' + data.ext
   },
   error: (e) => {
    console.log(e.responseText)
   }
  })
 }
})

$(document).on('mouseover','tr.announce',(ev) => {
 $('.tooltip:not(:last-child)').remove()
 let e = $(ev.currentTarget)
 let title = e.find('td.note_title').text()
 let desc = e.find('td.note_desc').text()
 let date = e.find('td.note_create').text()
 let tooltip = $("<div/>",{
  class: 'tooltip'
 })
 $("<span/>",{
  class: 'note-title',
  text: title +' '+ date
 }).appendTo(tooltip)
 $("<span/>",{
  class: 'note-desc',
  text: desc
 }).appendTo(tooltip)
 $(tooltip).appendTo("body")
})

$(document).on('mouseleave','tr.announce',(ev) => {
 $('.tooltip').remove()
})

$(document).on('click','.announce',function(ev) {
 let e = $(ev.currentTarget)
 let file = e.data('filename')
 $('.tooltip:not(:last-child)').remove()
 let data = window.location.origin +''+ file
 let title = e.find('td.note_title').text()
 let desc = e.find('td.note_desc').text()
 let date = e.find('td.note_create').text()
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
   //window.location.href = "/"
  }
 })
 let fileExt = data.substring(data.lastIndexOf('.')).toLowerCase()
 let viewer = (fileExt == '.jpg' ? '<a data-gallery="photoviewer" data-title="" data-group="a" href="' + data + '"><img src="' + data + '" style="height: 100vh; width:100vh;" alt=""></a>' : '<iframe src="' + data + '" style="height: 100vh; width:100vh;"></iframe>')
 $('.showfile').append(viewer)
 $('.modal-title').text(title +' '+ date)
 $('.modal-desc').text(desc)
 $.ajax({
  type: "POST",
  url: "/read",
  data: { id: e.attr('id') },
  success: function () {
   let content = '<div class="fa fa-envelope-open-o d-inline pr-2"></div>'
   e.addClass('gray')
   e.find('td:first-child').html(content)
  }
 })
})

$(document).on('mousemove',(event) => {
 $('.tooltip:not(:last-child)').remove()
 let maxW = screen.width-50;
 let maxH = screen.height-70;
 let target = $( ".tooltip:last-child" );
 let ew = target.width();
 let eh = target.height();
 let mpw = event.pageX + ew;
 let mph = event.pageY + eh;
 let evW = (mpw < maxW ? event.pageX : maxW - ew)
 let evH = (mph < maxH ? event.pageY : maxH - eh)
 target.css({
  "left" : evW+30,
  "top" : evH+50
 });
});

$(document).on('click','[data-gallery=photoviewer]',(e) => {

 e.preventDefault();

 var items = [],options

 $('[data-gallery=photoviewer]').each(function () {
   items.push({
     src: $(this).attr('href'),
     title: $(this).attr('data-title')
   });
 });

 new PhotoViewer(items, options);

});