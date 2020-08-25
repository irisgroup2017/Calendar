jQuery(function($) {

 CKEDITOR.replace( 'memoeditor' )
 var users,departs
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
 let result = getList('',users,departs)
 let html = '<ol class="popupUserlist hide" style="z-index: '+(maxZIndex()+1)+';">'
 if (result.length == 0) {
  '<li class="popupUserlistItem">ไม่พบข้อมูล</li>'
 } else {
  html = '<ol class="popupUserlist hide" style="z-index: '+(maxZIndex()+1)+';">'
  result.forEach(item => {
   if (item.dataid != undefined) {
    html += '<li class="popupUserlistItem" data-type="user" data-id="'+item.dataid+'" data-mail="'+item.mail+'" data-name="'+item.name+'" data-etc="'+item.jobPos+'">'+item.name+'</li>'
   } else {
    html += '<li class="popupUserlistItem" data-type="depart" data-id="'+item.ID+'" data-mail="'+item.depart_mail+'" data-name="'+item.depart+'" data-etc="'+item.depart_short+'">'+item.depart+'</li>'
   }
  })
  html += '</ol>'
 }
 $('.container').append(html)

 $(document).on('keyup','.memo-ans:focus',function(e){
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
   if (data.mail != null && ($(e).hasClass('select') || regex.test(data.mail) || regex.test(data.name) || regex.test(data.etc))) {
    $(e).removeClass('hide')
   } else {
    $(e).addClass('hide')
   }
  })
 })

 $(document).on('click','.popupUserlistItem',function(e){
  let target = $(e.target) 
  let input = $('.memo-ans.focus')
  $(input).after('<span>test</span>')
 })
 
 $(document).on('focusout','.memo-ans',function() {
  //$('.popupUserlist').addClass('hide')
 })
 

 $(document).on('click','.preview-button',function() {
  let checkAns = true
  let data = {}
  $('.memo-ans').each(function(index,item) {
   let val = $(item).val()
   let id = $(item).attr("id")
   if (val == "") {
    if (id != 'memo-boss' && id != 'memo-bossj' && id != 'memo-approve' && id != 'memo-approvej') {
     $(item).addClass("memo-error")
     checkAns = false
    }
   } else {
    data[id] = val
    $(item).removeClass("memo-error")
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
   <img class="modal-logo" src="img/logo.jpg">\
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
         <div class="modal-memo-topic">วันที่:</div>\
         <div class="modal-memo-subject" id="modal-date"></div>\
        </div>\
       </td>\
      </tr>\
      <tr>\
       <td>\
        <div class="modal-memo-cell">\
         <div class="modal-memo-topic">สำเนาเรียน:</div>\
         <div class="modal-memo-subject" id="modal-cc"></div>\
        </div>\
       </td>\
       <td colspan="2">\
        <div class="modal-memo-cell">\
        <div class="modal-memo-topic">จาก:</div>\
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
         <div class="modal-memo-subject" id="modal-attach"></div>\
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

   if (data["memo-admin"] != undefined) {
    let name = data["memo-admin"]
    let job = (data["memo-adminj"] != undefined ? data["memo-adminj"] : "......................................")
    let code = '<div class="memo-admin-name">('+name+')</div>\
                <div class="memo-admin-job">'+job+'</div>'
    $('#modal-section-admin').html(code)             
   }

   if (data["memo-boss"] != undefined) {
    let name = data["memo-boss"]
    let job = (data["memo-bossj"] != undefined ? data["memo-bossj"] : "......................................")
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

   if (data["memo-approve"] != undefined) {
    let name = data["memo-approve"]
    let job = (data["memo-approvej"] != undefined ? data["memo-approvej"] : "......................................")
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
    $('.close-editorModal').click()
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
      let modalKey = key.replace("memo","modal")
      $("#"+modalKey).text(data[key])
     }
    }
   })
  }
 })
 
 var max_pages = 30;
 var page_count = 0;
 var pagesize = 20*0.2645833333
 function snipMe() {
  page_count++;
  if (page_count > max_pages) {
    return;
  }
  var content = $(this).find('.modal-page .modal-memo-head')
  var long = ($(this)[0].scrollHeight) - Math.ceil($(this).height());
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
      long = ($(this)[0].scrollHeight) - Math.ceil($(this).height());
     }
    } else {
     removed.unshift(child)
     $(child).detach()
     long = ($(this)[0].scrollHeight) - Math.ceil($(this).height());
    }
  }
  if (removed.length > 0) {
    var a4 = $('.modal-memo:last')
    $(a4).after('<div class="modal-memo"><div class="modal-page" style="page-break-before: always;"><div class="modal-memo-head"></div></div></div>')
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
     <button class="btn btn-secondary testbutton close-button" type="button">Close</button>\
     <button class="btn btn-success testbutton print-button" type="button" onclick="printDiv()">Print</button>\
    </div>')
   }
  }
 }
})

async function printDiv() {
 printElement = $('.modal-memo')
 var mywindow = window.open('', 'PRINT');
 var cssList = ['../css/ace.min.css','../css/memo.css','../css/bootstrap.min.css','https://fonts.googleapis.com/css2?family=Sarabun&display=swap']
 var loadCount = cssList.length

 mywindow.document.write('<html><head><title>' + document.title  + '</title>');
 for (css in cssList) {
  var link = mywindow.document.createElement('link');
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.onload = function(){
   if (--loadCount == 0) {
    mywindow.print();
    mywindow.close();
   }
  }
  link.setAttribute("href", cssList[css]);
  mywindow.document.getElementsByTagName("head")[0].appendChild(link);
 }
 mywindow.document.write('</head><body >');
 for (item of printElement) {
  mywindow.document.write(item.innerHTML);
 }
 mywindow.document.write('</body></html>');
}

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