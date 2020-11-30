$(function($) {
 let start = moment();
 var clicked = true
 function cb(start, end, label) {
  $('#memo-date').html(start)
 }
 $('#memo-date').daterangepicker({
   singleDatePicker: true,
   showDropdowns: true,
   autoApply: true,
   minYear: 2013,
   maxYear: parseInt(moment().format('YYYY'),10),
   locale: {
    format: 'DD/MM/YYYY',
    daysOfWeek: [
     "อา.",
     "จ.",
     "อ.",
     "พ.",
     "พฤ.",
     "ศ.",
     "ส."
 ],
 monthNames: [
     "มกราคม",
     "กุมภาพันธ์",
     "มีนาคม",
     "เมษายน",
     "พฤษภาคม",
     "มิถุนายน",
     "กรกฏาคม",
     "สิงหาคม",
     "กันยายน",
     "ตุลาคม",
     "พฤศจิกายน",
     "ธันวาคม"
 ],
   }
 }, cb);
 cb(start)
 let fileStroage = JSON.parse(sessionStorage.getItem('attachm'))
 if (fileStroage) {
  $.ajax({
   url: '/memo/attachmultidel',
   type: 'post',
   async: false,
   data: {
    file: fileStroage
   },
   success: function() {
    sessionStorage.removeItem('attachm')
   }
  })
 }
 CKEDITOR.replace( 'memoeditor' )
 var users,departs,documents
 $.ajax({
  url: '/cross',
  type: "POST",
  async: false,
  data: {
   path: '/users/find/field',
   option: {
    attributes: ['dataid','name','lastName','mail','jobPos','depart'],
    where: {
    status: 1
    },
    raw: true
   }
  },
  success: function (data) {
   users = data.map(item => {
    return { dataid: item.dataid, name: item.name +' '+ item.lastName, mail:item.mail , jobPos: item.jobPos }
   })
  }
 })

 $.ajax({
  url: '/cross',
  type: "POST",
  async: false,
  data: {
   path: '/depart/find/field',
   option: {
    attributes: ['ID','depart','depart_mail','depart_short'],
    raw: true
   }
  },
  success: function (data) {
   departs = data
  }
 })

 $.ajax({
  url: '/cross',
  type: 'POST',
  async: false,
  data: {
   path: '/memo/getdocumentcode',
   option: 'getcode'
  },
  success: function (data) {
   let doccount = data[0].memo_counts[0].count
   let count = (doccount == 0 ? 1 : doccount+1).toString()
   count = "0".repeat(4-count.length) + count
   let depart = data[0].memo_counts[0].depart_row.departShort
   let departId = data[0].memo_counts[0].depart_row.ID
   let memoyear = data[0].memo_counts[0].year
   let year = (memoyear+543).toString().substring(2,5)
   documents = "FM-" +depart+ "-" +year+ "-" +count
   $('#memo-no').data("number",{ docid: documents, count: parseInt(count), depart: departId,year: memoyear }).val(documents)
  }
 })

 let result = getList('',users,departs)
 let html = '<ol class="popupUserlist hide" style="z-index: '+(maxZIndex()+1)+';">'
 html += '<li class="popupUserlistItem">ไม่พบข้อมูล</li>'
 result.forEach(item => {
  if (item.dataid != undefined) {
   html += '<li class="popupUserlistItem" data-type="user" data-id="'+item.dataid+'" data-mail="'+item.mail+'" data-name="'+item.name+'" data-etc="'+item.jobPos+'">'+item.name+'</li>'
  } else {
   html += '<li class="popupUserlistItem" data-type="depart" data-id="'+item.ID+'" data-mail="'+item.depart_mail+'" data-name="'+item.depart+'" data-etc="'+item.depart_short+'">'+item.depart+'</li>'
  }
 })
 html += '</ol>'
 $('.container').append(html)

 $(document).on('click','.memo-input',function(e){
  $('.memo-input.focus').removeClass('focus')
  $('.popupUserlist').addClass('hide')
 })

 $(document).on('click','.memo-head .target-select',function(){
  let inputField = $(this).parents('ul').find('.memo-input')
  if ($(inputField).hasClass('single-input')) {
   $(inputField).prop('disabled',false)
  }
  $(this).remove()
 })

 $(document).on('click','.memo-head .remove-file',function(){
  let item = $(this).next()
  let target = $(this).parent('.btn--corners')
  let filename = $(item).text()
  let filelist = JSON.parse(sessionStorage.getItem('attachm'))
  let match = filelist.find(e => e.originalname == filename)
  let path = match.path
  let index = filelist.indexOf(match)
  filelist.splice(index,1)
  $.ajax({
  url: '/memo/attachdel',
  type: "POST",
  async: false,
  data: {
   path: path
  },
  success: function () {
   $(target).remove()
   sessionStorage.setItem('attachm',JSON.stringify(filelist))
   }
  })
 })

 $(document).on('keyup','.memo-input:focus',function(e){
  if ($(this).parents('ul').find('.span-select').length > 0) {
   let have = $(this).parents('ul').find('.span-select').text()
   $(this).addClass('focus')
   let input = $(this).val()
   let regex = new RegExp(input,'g')
   let sect = $('.popupUserlist')
   let list = $(sect).find('.popupUserlistItem')
   let th = Math.floor($(this).offset().top-37)
   let tl = Math.floor($(this).offset().left)
   let tw = Math.floor($(this).width()+22)
   $(sect).removeClass('hide')
   $(sect).css({top: th, left: tl , width: tw})
   $(list).each((i,e) => {
    let data = $(e).data()
    let regCheck = new RegExp(data.name,'g')
    if (data.mail != null && (have == "" || !(regCheck.test(have))) && ($(e).hasClass('select') || regex.test(data.mail) || regex.test(data.name) || regex.test(data.etc))) {
     $(e).removeClass('hide')
    } else {
     $(e).addClass('hide')
    }
   })
  }
 })

 $(document).on('keydown', function(e) {
  if((e.ctrlKey || e.metaKey) && (e.key == "p" || e.charCode == 16 || e.charCode == 112 || e.keyCode == 80) ){
   e.cancelBubble = true;
   e.preventDefault();
   e.stopImmediatePropagation();
   printDiv()
  }
 });

 $(document).on('click','.popupUserlistItem',function(e){
  jQuery.noConflict()
  let target = $(e.target)
  let inputField = $('.memo-input.focus')
  let input = $(inputField).parents('ul').find('.span-select')
  let select = $(target).data()
  let source = '<span>'+ select.name +'</span>'
  $(input).append(source)
  $(input).find('span:last-child').attr({
   'class': 'target-select',
   'data-type': select.type,
   'data-id': select.id,
   'data-mail': select.mail,
   'data-etc': select.etc
  })
  $(inputField).val("")
  if ($(inputField).hasClass('single-input')) {
   $(inputField).prop('disabled', true)
  }
  $('.popupUserlist').addClass('hide')
 })
 
 $(document).on('focusout','.memo-ans',function() {

 })

 $(document).on('click','.preview-button',function() {
  let val,target,id
  let checkAns = true
  let data = {}
  let check = ["",[],undefined,null]
  $('.memo-ans').each(function(index,item) {
   target = $(item).parents('.memo-span2')
   if ($(item).hasClass('memo-input')) {
    val = $(item).val()
   } else {
    if ($(item).hasClass('span-select')) {
     val = $(item).html()
    } else {
     val = $(item).html()
    }
   }
   id = $(item).attr("id")
   if (check.indexOf(val) > -1 && (id != 'memo-boss' && id != 'memo-approve' && id != 'memo-cc' && id != 'memo-file')) {
    $(target).addClass("memo-error")
    checkAns = false
   } else {
    data[id] = val
    $(target).removeClass("memo-error")
   }
  })

  if (checkAns) {
   let content = CKEDITOR.instances.memoeditor.getData()
   /*
   let contentDisplay = []
   $(content).each(function() {
    contentDisplay.push($(this).addClass('modal-memo-content'))
   })
   */
  $('.modal-memo').not(':first').remove()
  $('.modal-memo').html('\
  <div class="modal-page">\
   <img class="modal-logo" src="/img/logo.jpg">\
   <div class="modal-memo-head">\
    <div class="modal-memo-title center">บันทึกภายใน</div>\
    <table>\
     <tbody>\
      <tr>\
       <td>\
        <div class="modal-memo-cell">\
         <div class="modal-memo-topic">ถึง:</div>\
         <div class="modal-memo-subject" id="modal-to"></div>\
        </div>\
       </td>\
       <td>\
        <div class="modal-memo-cell">\
         <div class="modal-memo-topic">เลขที่เอกสาร:</div>\
         <div class="modal-memo-subject" id="modal-no"></div>\
        </div>\
       </td>\
       <td>\
        <div class="modal-memo-cell">\
         <div class="modal-memo-topics">วันที่:</div>\
         <div class="modal-memo-subject" id="modal-date"></div>\
        </div>\
       </td>\
      </tr>\
      <tr>\
       <td colspan="2">\
        <div class="modal-memo-cell">\
         <div class="modal-memo-topic">สำเนาเรียน:</div>\
         <div class="modal-memo-subject" id="modal-cc"></div>\
        </div>\
       </td>\
       <td>\
        <div class="modal-memo-cell">\
        <div class="modal-memo-topics">จาก:</div>\
        <div class="modal-memo-subject" id="modal-from"></div>\
        </div>\
       </td>\
      </tr>\
      <tr>\
       <td colspan="3">\
        <div class="modal-memo-cell">\
        <div class="modal-memo-topic">เรื่อง:</div>\
        <div class="modal-memo-subject" id="modal-subject"></div>\
        </div>\
       </td>\
      </tr>\
      <tr>\
       <td colspan="3">\
        <div class="modal-memo-cell">\
         <div class="modal-memo-topic">เอกสารแนบ:</div>\
         <div class="modal-memo-subject" id="modal-file"></div>\
        </div>\
       </td>\
      </tr>\
     </tbody>\
    </table>\
    <div class="modal-memo-content"></div>\
    <div class="modal-section-signature"></div>\
    <div class="justify-content-end">\
     <div class="justify-item">\
      <div class="modal-section-admin" id="modal-section-admin"></div>\
     </div>\
    </div>\
    <div class="justify-content-around">\
     <div class="justify-around">\
      <div class="modal-section-approve" id="modal-section-approve"></div>\
     </div>\
     <div class="justify-around">\
      <div class="modal-section-boss" id="modal-section-boss"></div>\
     </div>\
    </div>\
    <div class="modal-memo-end"></div>\
   </div>\
  </div>')
  $('.modal-memo-content:first').html(content)
  if (data["memo-file"] != "") {
   let filelist = data["memo-file"]
  }

   if (data["memo-admin"] != undefined) {
    let name = data["memo-admin"]
    let job = ($(name).data("type") == "user" ? $(name).data("etc") : "")
    let code = '<div class="memo-admin-name">('+name+')</div>\
                <div class="memo-admin-job">'+job+'</div>'
    $('#modal-section-admin').html(code)             
   }

   if (data["memo-boss"] != "") {
    let name = data["memo-boss"]
    let job = ($(name).data("type") == "user" ? $(name).data("etc") : "")
    let code = '<div class="modal-section-seperate memo-approve-comment">ความคิดเห็น\
                <br><br></div>\
                 <div class="memo-comment-underline"></div><br>\
                 <div class="memo-comment-underline"></div>\
                 <div class="memo-comment-approve">ผู้ตรวจสอบ</div>\
                <div class="memo-boss-name">('+name+')</div>\
                <div class="memo-boss-job">'+job+'</div>'
    $('#modal-section-boss').html(code)
   } else {
    $('#modal-section-boss').html("")
   }

   if (data["memo-approve"] != "") {
    let name = data["memo-approve"]
    let job = ($(name).data("type") == "user" ? $(name).data("etc") : "")
    let code = '<div class="modal-section-seperate memo-approve-comment">ความคิดเห็น\
                <br><br></div>\
                 <div class="memo-comment-underline"></div><br>\
                 <div class="memo-comment-underline"></div>\
                 <div class="memo-comment-approve">ผู้อนุมัติ</div>\
                <div class="memo-approve-name">('+name+')</div>\
                <div class="memo-approve-job">'+job+'</div>'
    $('#modal-section-approve').html(code)   
   } else {
    $('#modal-section-approve').html("")
   }
   
   $('.modal-memo').each(function() {
    snipMe.call(this)
   })

   $(document).on('click','.close-button',function() {
    $('.close-editorModal').trigger('click')
   })

   $(document).on('click','.save-button',function() {
    if (clicked) {
     clicked = false
     saveDiv()
    }
    clicked = true
   })

   $(document).on('click','.print-button',function() {
    if (clicked) {
     clicked = false
     saveDiv()
     printDiv()
    }
    clicked = true
   })

   $("#editorModal").animatedModal({
    modalTarget:'editorModal',
    animatedIn:'bounceInUp',
    animatedOut:'bounceOutDown',
    color:'#FFFFFF',
    animationDuration:'.5s',
    beforeOpen: function() {
     var children = $(".thumb")
     var index = 0
     function addClassNextChild() {
      if (index == children.length) return;
      children.eq(index++).show().velocity("transition.slideUpIn", { opacity:1, stagger: 450,  defaultDuration: 100 })
      window.setTimeout(addClassNextChild, 100)
     }
     addClassNextChild()
     
     for (let key in data) {
      let check = ["meme-no","memo-date","memo-subject"]
      let modalKey = key.replace("memo","modal")
      if (check.indexOf(key) > -1) {
       $("#"+modalKey).text(data[key])
      } else {
       $("#"+modalKey).html(data[key])
      }
     }
    }
   })
  }
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
     <button class="btn btn-secondary close-button" type="button">ย้อนกลับ</button>\
     <button class="btn btn-success save-button" type="button">บันทึก</button>\
     <button class="btn btn-info print-button" type="button">บันทึกและสั่งพิมพ์</button>\
    </div>')
   }
  }
 }
 function checkfile(sender) {
  let filename = sender.value.split(/.*[\/|\\]/)[1];
  var validExts = new Array(".pdf",".jpg")
  var fileExt = sender.value;
  let filelist = JSON.parse(sessionStorage.getItem("attachm"))
  fileExt = fileExt.substring(fileExt.lastIndexOf('.')).toLowerCase()
  if (validExts.indexOf(fileExt) < 0) {
    alert("นามสกุลไฟล์ไม่ถูกต้อง สามารถแนบได้เฉพาะไฟล์: " + validExts.toString() + " เท่านั้น")
    return false
  } else if (filelist != null && filelist.find(e => e.originalname == filename)) {
   alert("มีไฟล์นี้อยู่ในรายการแล้ว: " + filename)
   return false
  }
  else {
   let form = $('upsiwa')[0]
   let file = $(sender)[0].files[0]
   let data = new FormData(form)
   data.append('file',file)
   data.append('ext',fileExt)
   $.ajax({
    url: "/attachment",
    type: 'POST',
    enctype: 'multipart/form-data',
    data: data,
    processData: false, //prevent jQuery from automatically transforming the data into a query string
    contentType: false,
    //cache: false,
    success: (data) => {
     let item = sessionStorage.getItem('attachm')
     item = (item ? JSON.parse(item) : new Array())
     let file = { 
      destination: data.file.originalname,
      filename: data.file.filename,
      originalname: data.file.originalname,
      path: data.file.path
     }
     item.push(file)
     $('.memo-span3 > .span-select').append('<div class="btn--corners"><div class="remove-file"></div><a data-path="'+data.file.path+'">'+data.file.originalname+'</a></div>')
     sessionStorage.setItem('attachm',JSON.stringify(item))
    },
    error: (e) => {
     console.log(e.responseText)
    }
   })
   return true 
  }
 }

 function saveDiv() {
  let list = $('.modal-memo-subject')
  let data = {}
  let admin = $('.memo-admin-name').find('.target-select').data()
  let boss = ($('.memo-boss-name') ? $('.memo-boss-name').find('.target-select').data() : "")
  let approve = ($('.memo-approve-name') ? $('.memo-approve-name').find('.target-select').data() : "")
  let doc = $('#memo-no').data("number")
  let content = $('.modal-memo .modal-memo-content').html()
  $(list).each((index,item) => {
   let source = returnDiv(item)
   let key = replaceKey($(item).attr('id'))
   data[key] = (key == "memoDate" ? moment(source,'DD/MM/YYYY').format('YYYY-MM-DD') : source)
  })
  data.doc = doc
  data.memoContent = content
  data.memoAdmin = admin.id
  data.memoBoss = (boss ? boss.id : "")
  data.memoApprover = (approve ? approve.id : "")
  if (data.memoApprover || data.memoBoss) {
   data.memoStatus = 1
  } else {
   data.memoStatus = 7
  }
  console.log(data)
  $.ajax({
   url: '/cross',
   type: 'post',
   async: false,
   data: {
    path: '/memo/updateorcreate',
    option: data
   },
   success: function(data) {
    sessionStorage.removeItem('attachm')
   }
  })
 }

 function returnDiv(item) {
  let id = $(item).attr('id')
  switch(id) {
   case "modal-cc": return ($(item).find('.target-select').map((i,e) => $(e).data("id")).get()).toString()
   case "modal-date": return $(item).text()
   case "modal-file": return ($(item).find('.btn--corners a').map((i,e) => $(e).data("path")).get()).toString()
   case "modal-from": return ($(item).find('.target-select').map((i,e) => $(e).data("id")).get()).toString()
   case "modal-no": return $(item).text()
   case "modal-subject": return $(item).text()
   case "modal-to": return ($(item).find('.target-select').map((i,e) => $(e).data("id")).get()).toString()
  }
 }

 function replaceKey(key) {
  switch(key) {
   case 'modal-to': return 'memoTo'
   case 'modal-no': return 'memoCode'
   case 'modal-date': return 'memoDate'
   case 'modal-cc': return 'memoCc'
   case 'modal-from': return 'memoFrom'
   case 'modal-subject': return 'memoSubject'
   case 'modal-file': return 'memoFile'
  }
 }

 function printDiv() {
  printElement = $('.modal-memo')
  var mywindow = window.open('', 'PRINT');
  var cssList = ['../css/ace.min.css','../css/memo.css','../css/bootstrap.min.css','https://fonts.googleapis.com/css2?family=Sarabun&display=swap']
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
 window.checkfile = checkfile
 window.printDiv = printDiv
})

function maxZIndex() { return Array.from(document.querySelectorAll('body *')).map(a => parseFloat(window.getComputedStyle(a).zIndex)).filter(a => !isNaN(a)).sort().pop(); }

function getList(m,users,departs) {
 let ans
 let regex = new RegExp(m,'g')
 users = users.filter(item => {
  return (item.mail != null && (regex.test(item.name) || regex.test(item.mail)))
 })
 departs = departs.filter(item => {
  return (item.depart_mail != null && (regex.test(item.depart) || regex.test(item.depart_mail)))
 })
 ans = [...users,...departs]
 return ans
}