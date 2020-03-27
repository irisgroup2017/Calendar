$(document).ready(function() {
    // Initialise the table
    if ($('#contact_td > .headt > tr:first > th:last-child').text() == "เครื่องมือ") {
        refreshContact()
        refreshDepart()
        $('#contact_td tr').addClass('nodrag nodrop')
        $('#depart_td tr').addClass('nodrag nodrop')
        $('#contact_td tr').css('cursor','default')
        $('#depart_td tr').css('cursor','default')
    }
    // jquery
    $('.contact_td').on('click','.li-edit',function() {
        $(this).parents('tr').find('td:not(:last-child)').each(function(index,row) {
            $(row).html('<div contenteditable="true" class="nostyle">'+$(row).text()+'</div>')  
        })
        $(this).parents('tr').find('.li-edit').toggle()
        $(this).parents('tr').find('.li-save').toggle()
    })

    $('.contact_td').on('click','.li-save',function() {
        let input = $(this).parents('tr').find('.nostyle'),empty = false
        input.each(function(){
            if(!$(this).text()){
                $(this).parents("td").addClass("error")
                empty = true
            } else {
                $(this).parents("td").removeClass("error")
            }
        })
        if (!empty) {
            let data = {},val,item
            data.item = []
            input.each(function(i) {
                val = (3 < i && i < 7 ? telRem($(this).text()) : $(this).text())
                item = $(this).parents("td").attr('class')
                $(this).parents("td").html((3 < i && i < 7 ? telFormat(val) : val))
                if (item == 'emid') { val = parseInt(val) }
                data.item.push(item,val)
            })
            data.ID = parseInt($(this).parents("tr").attr('id').substring(5))
            $.ajax({
                url: '/contact',
                type: "POST",
                dataType: 'json',
                data: {
                    'state': 'save',
                    'data': data
                }
            })
            $(this).parents('tr').find('.li-edit').toggle()
            $(this).parents('tr').find('.li-save').toggle()
        }
    })
    
    $('.contact_td').on('click','.li-delete',function() {
        let table = $(this).closest('tbody')
        $.ajax({
            url: '/contact',
            type: "POST",
            dataType: 'json',
            data: {
                'state': 'del',
                'ID': $(this).parents('tr').attr('id')
            }
        })
        $(this).parents('tr').remove()
        refreshContact()
        let rows = table[0].rows,
        order = []
        for (var i=0; i<rows.length; i++) {
            order.push(rows[i].id)
        }
        $.ajax({
            url: '/contact',
            type: "POST",
            dataType: 'json',
            data: {
                'state': 'move-li',
                'order': order
            }
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
                        <div class="input">\
                            <input type="text" id="input" class="input-text emid" placeholder="รหัสพนักงาน, ต.ย. 0000000" onkeypress="return isNumber(event)" onchange="checkEmp(this.value)">\
                            <label for="input" class="input-label">รหัสพนักงาน</label>\
                        </div>\
                        <div class="input">\
                            <input type="text" id="input" class="input-text name" placeholder="ชื่อ นามสกุล">\
                            <label for="input" class="input-label">ชื่อ-นามสกุล</label>\
                        </div>\
                        <div class="input">\
                            <input type="text" id="input" class="input-text job" placeholder="ตำแหน่งงาน">\
                            <label for="input" class="input-label">ตำแหน่งงาน</label>\
                        </div>\
                        <div class="input">\
                            <input type="text" id="input" class="input-text nname" placeholder="ชื่อเล่น">\
                            <label for="input" class="input-label">ชื่อเล่น</label>\
                        </div>\
                        <div class="input">\
                            <input type="text" id="input" class="input-text ext" placeholder="เบอร์ภายใน" onkeypress="return isPhone(event)">\
                            <label for="input" class="input-label">เบอร์ภายใน</label>\
                        </div>\
                        <div class="input">\
                            <input type="text" id="input" class="input-text com" placeholder="เบอร์บริษัท" onkeypress="return isPhone(event)">\
                            <label for="input" class="input-label">เบอร์บริษัท</label>\
                        </div>\
                        <div class="input">\
                            <input type="text" id="input" class="input-text pri" placeholder="เบอร์ส่วนตัว" onkeypress="return isPhone(event)">\
                            <label for="input" class="input-label">เบอร์ส่วนตัว</label>\
                        </div>\
                        <div class="input">\
                            <input type="text" id="input" class="input-text mail" placeholder="อีเมล์" onkeypress="return isMail(event)" pattern=".+@iris.co.th">\
                            <label for="input" class="input-label">อีเมล์</label>\
                        </div>\
                    </div>\
                    </form>\
                  </div>\
                  <div class="modal-footer">\
                    <button type="button" class="btn btn-sm btn-danger" data-action="create_data"><i class="ace-icon fa fa-paper-plane-o"></i> บันทึก</button>\
                    <button type="button" class="btn btn-sm btn-info" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> ยกเลิก</button>\
                  </div>\
                </div>\
              </div>\
            </div>'
        var modal = $(modal).appendTo('body')
        if ($(this).attr('id') != undefined) {
            $('.box select').attr('ID',$(this).attr('id'))
            $.ajax({
                url: '/contact',
                type: "POST",
                dataType: 'json',
                async: false,
                data: {
                    'state': 'loado',
                    'ID': $(this).attr('id')
                    },
                success: function(data) {
                    let box = $('.box select')
                    $('.input .emid').val(data.emid)
                    $('.input .name').val(data.name)
                    $('.input .job').val(data.job)
                    $('.input .mail').val(data.mail)
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
                dataType: 'json',
                async: false,
                data: {
                    'state': 'load'
                    },
                success: function(data) {
                    let box = $('.box select')
                    box.append('<optgroup label="เลือกแผนก">')
                    for (let i=0;i < data.depart.length;i++) {
                        box.append('<option value="'+data.depart[i].ID+'">'+data.depart[i].depart+'</option>')
                    }
                    box.append('</optgroup>')
                }
            })
        }
          modal.find('button[data-action=create_data]').on('click',function() {
            let input = $('input#input'),empty = false,data = {}
            input.each(function(){
                if(!$(this).val()){
                    $(this).addClass("error")
                    empty = true
                } else {
                    data[$(this).attr('class').split(' ').pop()] = $(this).val()
                    $(this).removeClass("error")
                }
            })
            if (!empty) {
                let depart = $('.box select option:selected').val(),
                ID = $('.box select').attr('id')
                $.ajax({
                url: '/contact',
                type: "POST",
                dataType: 'JSON',
                async: false,
                data: {
                    'state': 'cdata',
                    'data': data,
                    'depart': depart,
                    'ID': ID
                    },
                success: function(data) {
                        let line,info=data.data,
                        code = '\
                        <tr class="boding" id="body-'+data.ID+'">\
                            <td>'+info.emid+'</td>\
                            <td>'+info.name+'</td>\
                            <td>'+info.job+'</td>\
                            <td>'+info.nname+'</td>\
                            <td>'+info.ext+'</td>\
                            <td>'+info.com+'</td>\
                            <td>'+info.pri+'</td>\
                            <td>'+info.mail+'</td>\
                            <td class="small_buttons">\
                                <div>\
                                    <a class="button edit li-edit">แก้ไข</a>\
                                    <a class="button save li-save" style="display: none;">บันทึก</a>\
                                    <a class="button delete li-delete">ลบ</a>\
                                </div>\
                            </td>\
                        </tr>'
                        line = $('tr[id=head-'+data.depart+']').index()
                        line += info.line
                        console.log(line,data)
                        $('li[id='+data.ID+']').remove()
                        $('.bodyt tr:eq('+line+')').after(code)
                        refreshContact()
                        $('body').removeClass('modal-open')
                        modal.remove() 
                    }
                })
            }
        })
    
        modal.modal('show').on('hidden.bs.modal', function(){
          modal.remove()
        })
    })

    $('#contact_td').on('click','#toggleDragAndDrop',function(){
        if ($('#contact_td').hasClass('nodrag')) {
            $('#contact_td').removeClass('nodrag nodrop')
            $('#contact_td tr').addClass('nodrag nodrop')
            $('#depart_td tr').addClass('nodrag nodrop')
            $('#contact_td tr').css('cursor','default')
            $('#depart_td tr').css('cursor','default')
        } else {
            $('#contact_td').addClass('nodrag nodrop')
            $('#contact_td tr').removeClass('nodrag nodrop')
            $('#depart_td tr').removeClass('nodrag nodrop')
            $('#contact_td tr').css('cursor','move')
            $('#depart_td tr').css('cursor','move')
        }
    })
    
    $('.depart_td').on('click','.de-add',function() {
        var modal = 
        '<div class="modal fade">\
          <div class="modal-dialog modal-sm">\
            <div class="modal-content">\
              <div class="modal-body">\
                <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
                <form class="no-margin">\
                <div class="input">\
                    <input type="text" id="deadd" class="input-text" placeholder="ชื่อหน่วยงาน">\
                    <label for="input" class="input-label">ชื่อหน่วยงาน</label>\
                </div>\
                </form>\
              </div>\
              <div class="modal-footer">\
                <button type="button" class="btn btn-sm btn-danger" data-action="deadd"><i class="ace-icon fa fa-paper-plane-o"></i> บันทึก</button>\
                <button type="button" class="btn btn-sm btn-info" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> ยกเลิก</button>\
              </div>\
            </div>\
          </div>\
        </div>'
        var modal = $(modal).appendTo('body')
        modal.find('button[data-action=deadd]').on('click',function() {
            var depart = $('input[class=input-text]').val()
            $.ajax({
                url: '/contact',
                type: "POST",
                dataType: 'JSON',
                data: {
                    'state': 'add',
                    'depart': depart
                    },
                success: function(data) {
                    ID = parseInt(data.ID)
                    depart = data.depart
                    line = parseInt(data.line)+1
                    code = '<tr id="'+ID+'"><td>'+depart+'</td><td>'+line+'</td><td><a class="button edit de-edit">แก้ไขชื่อ</a></td></tr>'
                    head = '<tr id="head'+ID+'" class="group_heading nodrag"><th colspan="9">'+depart+'</th></tr>'
                    $('.depart_td tbody').append(code)
                    $('#contact_td tr:last').after(head)
                    $('body').removeClass('modal-open')
                    refreshDepart()
                    modal.remove()
                }     
            })
        })
    
        modal.modal('show').on('hidden.bs.modal', function(){
            modal.remove()
        })  
    })
    
    $('.depart_td').on('click','.de-edit',function() {
        var modal = 
        '<div class="modal fade">\
          <div class="modal-dialog modal-sm">\
            <div class="modal-content">\
              <div class="modal-body">\
                <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
                <form class="no-margin">\
                <div class="input">\
                    <input type="text" id="'+$(this).parents("tr").attr('id')+'" class="input-text" placeholder="ชื่อหน่วยงาน" value="'+$(this).parents("tr").find('td:first-child').text()+'">\
                    <label for="input" class="input-label">ชื่อหน่วยงาน</label>\
                </div>\
                </form>\
              </div>\
              <div class="modal-footer">\
                <button type="button" class="btn btn-sm btn-danger" data-action="deedit"><i class="ace-icon fa fa-paper-plane-o"></i> บันทึก</button>\
                <button type="button" class="btn btn-sm btn-info" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> ยกเลิก</button>\
              </div>\
            </div>\
          </div>\
        </div>'
        var modal = $(modal).appendTo('body')
        modal.find('button[data-action=deedit]').on('click',function() {
            var depart = $('input[class=input-text]').val(),
            ID = $('input[class=input-text]').attr('id')
            $.ajax({
                url: '/contact',
                type: "POST",
                dataType: 'json',
                data: {
                    'state': 'edit-de',
                    'depart': depart,
                    'ID': ID
                    },
                success: function(data) {
                    ID = parseInt(data.ID)
                    $('.depart_td tbody').find('tr[id='+ID+']').find('td:first-child').text(data.depart)
                    $('body').removeClass('modal-open')
                    refreshDepart()
                    modal.remove()
                }     
            })
        })
        modal.modal('show').on('hidden.bs.modal', function(){
            modal.remove()
        })  
    })
})

function refreshContact() {
    $("#contact_td").tableDnDUpdate()
    $("#contact_td").tableDnD({
        onDrop: function(table, row) {
            var rows = table.tBodies[0].rows
            var order = []
            for (var i=0; i<rows.length; i++) {
                order.push(rows[i].id)
            }
            $.ajax({
                url: '/contact',
                type: "POST",
                dataType: 'json',
                data: {
                    'state': 'move-li',
                    'order': order
                }
            })
        }
    })
}

function refreshDepart() {
    $("#depart_td").tableDnDUpdate()
    $("#depart_td").tableDnD({
        onDrop: function(table, row) {
            var rows = table.tBodies[0].rows
            var order = []
            for (var i=0; i<rows.length; i++) {
                order.push(parseInt(rows[i].id))
            }
            $.ajax({
                url: '/contact',
                type: "POST",
                dataType: 'json',
                data: {
                    'state': 'move-de',
                    'order': order
                }
            })
        }
    })
}


function checkEmp(emid) {
    let len = emid.length
    if (len == 7) {
        $.ajax({
            url: '/contact',
            type: "POST",
            dataType: 'json',
            async: false,
            data: {
                'state': 'search-li',
                'emid': emid 
            },
            success: function(data) {
                if (data != 'empty') {
                    for (const item of data) {
                        $('.box select').attr('id',item.ID)
                        $('.input .name').val(item.name)
                        $('.input .job').val(item.job)
                        $('.input .nname').val(item.nickname)
                        $('.input .ext').val(item.ext)
                        $('.input .com').val(item.work)
                        $('.input .pri').val(item.private)
                        $('.input .mail').val(item.email)
                    }
                }
            }
        })
    } else { return emid }
}

function telFormat(number) {
    if (number) {
        let len = number.length
        if (len == 9) {
            number = number.substring(0,2) +"-"+ number.substring(2,6) +"-"+ number.substring(6)
        }
        else if (len == 10) {
            number = number.substring(0,3) +"-"+ number.substring(3,7) +"-"+ number.substring(7)
        }
        return number
    } 
}

function telRem(num) {
    if (num.length > 1) {
        return num.replace(/\-/g,"")
    } else return num
}

function isNumber(evt) {
    evt = (evt) ? evt : window.event
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 != 45 && ((charCode < 48) || charCode > 57)) {
        return false
    } 
    return true
}

function isPhone(evt) {
    evt = (evt) ? evt : window.event
    var charCode = (evt.which) ? evt.which : evt.keyCode,
    value = evt.target.value
    if (charCode > 31 && charCode != 45 && ((charCode < 48) || charCode > 57)) {
        return false
    } else if (charCode == 45 && value.length > 0) { return false }
    return true
}

function isMail(evt) {
	let val = evt.target.value.replace(/@(\w*)i(\w*)r(\w*)i(\w*)s(\w*)\.(\w*)c(\w*)o(\w*)\.(\w*)t(\w*)h(\w*)/g,""),index,target = evt.target
    index = evt.target.selectionStart
    if (evt.keyCode != 45) {
        target.value = val+ "@iris.co.th"
    }
    target.setSelectionRange(index,index)
}

$('#contact_td').on('mouseenter','td',function() {
    var t = parseInt($(this).index()) + 1
    $('table:first-child td:nth-child(' + t + ')').addClass('highlighted')
})
$('#contact_td').on('mouseleave','td',function() {
    var t = parseInt($(this).index()) + 1
    $('table:first-child td:nth-child(' + t + ')').removeClass('highlighted')
})