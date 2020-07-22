jQuery(function($) {

 CKEDITOR.replace( 'memoeditor' )

 $(document).on('click','.testbutton',function() {
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
   //console.log(data)
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
  $('.modal-memo').html('<div class="modal-page"><img class="modal-logo" src="img/logo.jpg"><div class="modal-memo-head"><div class="modal-memo-title center">บันทึกภายใน</div><table><tbody><tr><td><div class="modal-memo-cell"><div class="modal-memo-topic">ถึง:</div><div class="modal-memo-subject" id="modal-to"></div></div></td><td><div class="modal-memo-cell"><div class="modal-memo-topic">เลขที่เอกสาร:</div><div class="modal-memo-subject" id="modal-no"></div></div></td><td><div class="modal-memo-cell"><div class="modal-memo-topic">วันที่:</div><div class="modal-memo-subject" id="modal-date"></div></div></td></tr><tr><td><div class="modal-memo-cell"><div class="modal-memo-topic">สำเนาเรียน:</div><div class="modal-memo-subject" id="modal-cc"></div></div></td><td colspan="2"><div class="modal-memo-cell"><div class="modal-memo-topic">จาก:</div><div class="modal-memo-subject" id="modal-from"></div></div></td></tr><tr><td colspan="3"><div class="modal-memo-cell"><div class="modal-memo-topic">เรื่อง:</div><div class="modal-memo-subject" id="modal-subject"></div></div></td></tr><tr><td colspan="3"><div class="modal-memo-cell"><div class="modal-memo-topic">เอกสารแนบ:</div><div class="modal-memo-subject" id="modal-attach"></div></div></td></tr></tbody></table><div class="modal-memo-content"></div><div class="modal-section-signature"></div><div class="row justify-content-end"><div class="col-5"><div class="modal-section-admin" id="modal-section-admin"></div></div></div><div class="row justify-content-around"><div class="col-5"><div class="modal-section-approve" id="modal-section-approve"></div></div><div class="col-5"><div class="modal-section-boss" id="modal-section-boss"></div></div></div><div class="modal-memo-end"></div></div></div>')
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
                 <div class="memo-comment-underline"></div>\
                 <br>\
                 <div class="memo-comment-underline"></div>\
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
                 <div class="memo-comment-underline"></div>\
                 <span class="modal-comment-memo"><div class="memo-comment-approve">ผู้อนุมัติ</div><div class="memo-comment-underline"></div></span>\
                <div class="memo-approve-name">('+name+')</div>\
                <div class="memo-approve-job">'+job+'</div>'
    $('#modal-section-approve').html(code)   
   } else {
    $('#modal-section-approve').html("")
   }

   $('.modal-memo').each(function() {
    snipMe.call(this)
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
   //console.log(test)
  }
 })
 var max_pages = 100;
 var page_count = 0;
 function snipMe() {
  page_count++;
  if (page_count > max_pages) {
    return;
  }
  var content = $(this).find('.modal-page .modal-memo-head')
  var long = $(this)[0].scrollHeight - Math.ceil($(this).innerHeight()+10);
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
      long = $(this)[0].scrollHeight - Math.ceil($(this).innerHeight()+10)
     }
    } else {
     removed.unshift(child)
     $(child).detach()
     long = $(this)[0].scrollHeight - Math.ceil($(this).innerHeight())
    }
  }
  if (removed.length > 0) {
    var a4 = $('.modal-memo:last')
    $(a4).after('<div class="modal-memo"><div class="modal-page"><div class="modal-memo-head"></div></div></div>')
    content = $('.modal-memo:last .modal-page .modal-memo-head')
    content.append(removed)
    $(this).after(a4)
    $(a4).addClass("overflow-hidden")
    var a4new = $(".modal-memo:last")
    snipMe.call(a4new[0])
  } else {
   var a4 = $('.modal-memo:last')
   $(a4).addClass("overflow-hidden")
  }
 }

 async function printPDF() {
  var specialElementHandlers = {
   'DIV to be rendered out': function(element, renderer){
    return true;
   }
  }
  var pdf = new jsPDF()
  var doc = $(".modal-memo").html()
  window.html2canvas = html2canvas
  await pdf.html(doc,{
   'elementHandlers': specialElementHandlers
  })
  pdf.save('test.pdf')
 }

 /*
  var doc = new jsPDF();
  var specialElementHandlers = {
      '#editor': function (element, renderer) {
          return true;
      }
  };

  $('#cmd').click(function () {
      doc.fromHTML($('#content').html(), 15, 15, {
          'width': 170,
              'elementHandlers': specialElementHandlers
      });
      doc.save('sample-file.pdf');
  });
 */
})