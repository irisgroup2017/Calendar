$(document).ready(function() {
    // Initialise the table
    $("#contact_td").tableDnD()
    $("#depart_td").tableDnD()

    $("#contact_td").tableDnD({
        onDrop: function(table, row) {
            var rows = table.tBodies[1].rows
            var debugStr = ""
            for (var i=0; i<rows.length; i++) {
                debugStr += rows[i].id+" "
            }
            console.log(debugStr)
            console.log($.tableDnD.serialize())
        }
    })

    $("#depart_td").tableDnD({
        onDrop: function(table, row) {
            var rows = table.tBodies[1].rows
            var debugStr = ""
            for (var i=0; i<rows.length; i++) {
                debugStr += rows[i].id+" "
            }
            console.log(debugStr)
            console.log($.tableDnD.serialize())
        }
    })
})


$('.de-add').on('click',function() {
    var modal = 
    '<div class="modal fade">\
      <div class="modal-dialog modal-sm">\
        <div class="modal-content">\
          <div class="modal-body">\
            <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
            <form class="no-margin">\
            <div class="Input">\
                <input type="text" id="deadd" class="Input-text" placeholder="ชื่อหน่วยงาน">\
                <label for="input" class="Input-label">ชื่อหน่วยงาน</label>\
            </div>\
            </form>\
          </div>\
          <div class="modal-footer">\
            <button type="button" class="btn btn-sm btn-danger" data-action="deadd"><i class="ace-icon fa fa-paper-plane-o"></i> Send Password</button>\
            <button type="button" class="btn btn-sm btn-info" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> Cancel</button>\
          </div>\
        </div>\
      </div>\
    </div>'
    var modal = $(modal).appendTo('body')
    modal.find('button[data-action=deadd]').on('click',function() {
        var depart = $('input[class=Input-text]').val()
        $.ajax({
            url: '/contact',
            type: "POST",
            dataType: 'text',
            data: {
                'state': 'add',
                'depart': depart
                },
            success: function(data) {
                data = JSON.parse(data)
                ID = parseInt(data.ID)+1
                depart = data.depart
                line = parseInt(data.line)+1
                code = '<tr class="'+ID+'"><td>'+depart+'</td><td>'+line+'</td><td><a class="button edit de-edit">แก้ไขชื่อ</a></td></tr>'
                $('.depart_td tbody').append(code)
                modal.remove()
            }     
        })
    })

    modal.modal('show').on('hidden.bs.modal', function(){
        modal.remove()
    })  
})

$('.de-edit').on('click',function() {
    var modal = 
    '<div class="modal fade">\
      <div class="modal-dialog modal-sm">\
        <div class="modal-content">\
          <div class="modal-body">\
            <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
            <form class="no-margin">\
            <div class="Input">\
                <input type="text" id="'+$(this).parents("tr").attr('class')+'" class="Input-text" placeholder="ชื่อหน่วยงาน" value="'+$(this).parents("tr").find('td:first-child').text()+'">\
                <label for="input" class="Input-label">ชื่อหน่วยงาน</label>\
            </div>\
            </form>\
          </div>\
          <div class="modal-footer">\
            <button type="button" class="btn btn-sm btn-danger" data-action="deedit"><i class="ace-icon fa fa-paper-plane-o"></i> Send Password</button>\
            <button type="button" class="btn btn-sm btn-info" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> Cancel</button>\
          </div>\
        </div>\
      </div>\
    </div>'
    var modal = $(modal).appendTo('body')
    modal.find('button[data-action=deedit]').on('click',function() {
        var depart = $('input[class=Input-text]').val(),
        ID = $('input[class=Input-text]').attr('id')
        $.ajax({
            url: '/contact',
            type: "POST",
            dataType: 'text',
            data: {
                'state': 'edit',
                'depart': depart,
                'ID': ID-1
                },
            success: function(data) {
                data = JSON.parse(data)
                ID = parseInt(data.ID)+1
                $('.depart_td tbody').find('tr[class='+ID+']').find('td:first-child').text(data.depart)
                modal.remove()
            }     
        })
    })
    modal.modal('show').on('hidden.bs.modal', function(){
        modal.remove()
    })  
})

$('.more-bt').on('click',function() {
    var modal = 
        '<div class="modal fade">\
          <div class="modal-dialog modal-sm">\
            <div class="modal-content">\
              <div class="modal-body">\
                <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
                <form class="no-margin">\
                <div class="box">\
                    <select>\
                    </select>\
                </div>\
                <div class="Wrapper">\
                    <div class="Input">\
                        <input type="text" id="input" class="Input-text emid" placeholder="รหัสพนักงาน, ต.ย. 0000000">\
                        <label for="input" class="Input-label">รหัสพนักงาน</label>\
                    </div>\
                    <div class="Input">\
                        <input type="text" id="input" class="Input-text name" placeholder="ชื่อ นามสกุล">\
                        <label for="input" class="Input-label">ชื่อ-นามสกุล</label>\
                    </div>\
                    <div class="Input">\
                        <input type="text" id="input" class="Input-text job" placeholder="ตำแหน่งงาน">\
                        <label for="input" class="Input-label">ตำแหน่งงาน</label>\
                    </div>\
                    <div class="Input">\
                        <input type="text" id="input" class="Input-text nname" placeholder="ชื่อเล่น">\
                        <label for="input" class="Input-label">ชื่อเล่น</label>\
                    </div>\
                    <div class="Input">\
                        <input type="text" id="input" class="Input-text ext" placeholder="เบอร์ภายใน">\
                        <label for="input" class="Input-label">เบอร์ภายใน</label>\
                    </div>\
                    <div class="Input">\
                        <input type="text" id="input" class="Input-text com" placeholder="เบอร์บริษัท">\
                        <label for="input" class="Input-label">เบอร์บริษัท</label>\
                    </div>\
                    <div class="Input">\
                        <input type="text" id="input" class="Input-text pri" placeholder="เบอร์ส่วนตัว">\
                        <label for="input" class="Input-label">เบอร์ส่วนตัว</label>\
                    </div>\
                    <div class="Input">\
                        <input type="text" id="input" class="Input-text mail" placeholder="อีเมล์">\
                        <label for="input" class="Input-label">อีเมล์</label>\
                    </div>\
                </div>\
                </form>\
              </div>\
              <div class="modal-footer">\
                <button type="button" class="btn btn-sm btn-danger" data-action="create_data"><i class="ace-icon fa fa-paper-plane-o"></i> Save</button>\
                <button type="button" class="btn btn-sm btn-info" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> Cancel</button>\
              </div>\
            </div>\
          </div>\
        </div>'
    var modal = $(modal).appendTo('body')
    if ($(this).attr('id') != undefined) {
        $.ajax({
            url: '/contact',
            type: "POST",
            dataType: 'text',
            async: false,
            data: {
                'state': 'loado',
                'ID': $(this).attr('id')
                },
            success: function(data) {
                let box = $('.box select')
                data = JSON.parse(data)
                $('.Input .emid').val(data.emid)
                $('.Input .name').val(data.name)
                $('.Input .job').val(data.job)
                $('.Input .mail').val(data.mail)
                box.append('<optgroup label="เลือกแผนก">')
                for (let i=0;i < data.depart.length;i++) {
                    box.append('<option value="'+data.depart[i].ID+'">'+data.depart[i].depart+'</option>')
                }
                box.append('</optgroup>')
            }
        })
    } else {
        $.ajax({
            url: '/contact',
            type: "POST",
            dataType: 'text',
            async: false,
            data: {
                'state': 'load'
                },
            success: function(data) {
                let box = $('.box select')
                data = JSON.parse(data)
                box.append('<optgroup label="เลือกแผนก">')
                for (let i=0;i < data.depart.length;i++) {
                    box.append('<option value="'+data.depart[i].ID+'">'+data.depart[i].depart+'</option>')
                }
                box.append('</optgroup>')
            }
        })
    }
      modal.find('button[data-action=create_data]').on('click',function() {
        let input = $('input#input'),empty = false
        input.each(function(){
			if(!$(this).val()){
				$(this).addClass("error");
				empty = true;
			} else {
                $(this).removeClass("error");
            }
        })

        if (!empty) {
            var email = $('input#email').val()

            $.ajax({
            url: '/contact',
            type: "POST",
            dataType: 'text',
            async: false,
            data: {
                'state': 'cdata',
                'email': email
                },
            success: function(data) {
                    modal.remove() 
                }
            })
        }
    })

    modal.modal('show').on('hidden.bs.modal', function(){
      modal.remove()
    })
})

$('table:first-child td').hover(function() {
    var t = parseInt($(this).index()) + 1
    $('table:first-child td:nth-child(' + t + ')').addClass('highlighted')
    },
    function() {
    var t = parseInt($(this).index()) + 1
    $('table:first-child td:nth-child(' + t + ')').removeClass('highlighted')
})