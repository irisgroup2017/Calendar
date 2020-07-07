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
   contentDisplay.push($(this).addClass('pagebreak'))
  })
  */
 $('#modal-memo-content').html(content)

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
 var long = $(this)[0].scrollHeight - Math.ceil($(this).innerHeight());
 var children = $(content).children().toArray();
 var removed = [];
 while (long > 0 && children.length > 0) {
   var child = children.pop();
   $(child).detach();
   removed.unshift(child);
   long = $(this)[0].scrollHeight - Math.ceil($(this).innerHeight());
 }
 if (removed.length > 0) {
   var a4 = $('.modal-memo:last');
   $(a4).after('<div class="modal-memo"><div class="modal-page"><div class="modal-memo-head"></div></div></div>')
   content = $('.modal-memo:last .modal-page .modal-memo-head')
   content.append(removed);
   $(this).after(a4);
   snipMe.call(a4[page_count]);
 }
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
