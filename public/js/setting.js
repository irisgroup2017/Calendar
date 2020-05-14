jQuery(function ($) {
    $(document).on('click','#wplace',function() {
        $('#wplace').attr('checked',this.checked)
        $.ajax({
            url: '/setting',
            type: "POST",
            dataType: 'json',
            async: false,
            data: { 
                'state': 'checkbox',
                'emid': $('#privacyID').text(),
                'dataid': $('#privacyID').attr('class'),
                'cname': 'wplace',
                'cstatus': this.checked
            },
            success: function() {
                /*$("link").each(function() {
                    if ($(this).attr("href").indexOf("checkbox") > -1) {
                        $(this).attr("href", $(this).attr("href") + "?v=" + new Date().getMilliseconds())
                    }
                })
                window.location.reload(true)*/
            }
        })
    })
    $(document).on('click',"#comSelectbox",function() {
        let comp = $("#comSelectbox :selected").val()
        $.ajax({
            url: '/setting',
            type: "POST",
            dataType: 'json',
            async: false,
            data: { 
                'state': 'comp',
                'emid': $('#privacyID').text(),
                'dataid': $('#privacyID').attr('class'),
                'comp': comp,
            }
        })
    })
    $(document).on('click','#boss',function() {
        $('#boss').attr('checked',this.checked)
        $.ajax({
            url: '/setting',
            type: "POST",
            dataType: 'json',
            async: false,
            data: { 
                'state': 'checkbox',
                'emid': $('#privacyID').text(),
                'dataid': $('#privacyID').attr('class'),
                'cname': 'boss',
                'cstatus': this.checked
            },
            success: function() {
            }
        })
    })
    $('.datepicker').datepicker({
        ignoreReadonly: true,
        format: 'dd MM yyyy',
        todayHighlight: true,
        isBuddhist: true
    })
    $(".datepicker").datepicker().on('changeDate',function(e){
        $.ajax({
            url: '/setting',
            type: "POST",
            dataType: 'json',
            async: false,
            data: { 
                'state': 'cdate',
                'emid': $('#privacyID').text(),
                'dataid': $('#privacyID').attr('class'),
                'cdate': e.date.getTime()/1000,
                'userName': $('#privacyName').text()
            }
        })
    })
    $('#timepicker1').chungTimePicker({
        viewType: 1,
        confirmCallback: function(e) {
            $.ajax({
                url: '/setting',
                type: "POST",
                dataType: 'json',
                async: false,
                data: { 
                    'state': 'swtime',
                    'emid': $('#privacyID').text(),
                    'dataid': $('#privacyID').attr('class'),
                    'swtime': e.val()
                }
            })
        }
    })
    $('#timepicker2').chungTimePicker({
        viewType: 1,
        confirmCallback: function(e) {
            $.ajax({
                url: '/setting',
                type: "POST",
                dataType: 'json',
                async: false,
                data: { 
                    'state': 'ewtime',
                    'emid': $('#privacyID').text(),
                    'dataid': $('#privacyID').attr('class'),
                    'ewtime': e.val()
                }
            })
        }
    })
})

$(document).ready(function(){
    $(document).on("click",".active-status", function(){
        $(this).children("span").toggleClass("active not-active")
        let status = $(this).children("span").hasClass("active")
        let id = $(this).parents("tr").attr("class")
        $.ajax({
            url: '/setting',
            type: "POST",
            dataType: 'json',
            async: false,
            data: { 
                'state': 'stc',
                'dataid': id,
                'status': status
            }
        })
    })
    $(document).on("click", ".addline", function(){
        function Generator() { }
        Generator.prototype.rand = Math.floor(Math.random() * 26) + Date.now()
        Generator.prototype.getId = function () {
            return this.rand++
        }
        var idGen = new Generator(),
        empty = false,
        input = $(this).parents("tr").find("input.add")
        input.each(function(){
            if(!$(this).val()){
				$(this).addClass("error")
				empty = true
			} else{
                $(this).removeClass("error")
            }
        })
        $(this).parents("tr").find(".error").first().focus()
        if(!empty){
            var dataid = idGen.getId(),emid,name,lastName,jobPos,depart,mail,mailGroup,userName
			input.each(function(){
                $(this).parent("td").html('<p>'+$(this).val()+'</p')
                if ($(this).attr('id') === 'emid') { emid = $(this).val() }
                if ($(this).attr('id') === 'name') { name = $(this).val() }
                if ($(this).attr('id') === 'lastName') { lastName = $(this).val() }
                if ($(this).attr('id') === 'jobPos') { jobPos = $(this).val() }
                if ($(this).attr('id') === 'depart') { depart = $(this).val() }
                if ($(this).attr('id') === 'mail') { mail = $(this).val() }
                if ($(this).attr('id') === 'mailGroup') { mailGroup = $(this).val() }
                if ($(this).attr('id') === 'userName') { userName = $(this).val() }
            })
            $.ajax({
                url: '/setting',
                type: "POST",
                dataType: 'json',
                async: false,
                data: { 
                    'state': 'add',
                    'dataid': dataid,
                    'cdate': new Date().getTime()/1000,
                    'emid': emid,
                    'name': name,
                    'lastName': lastName,
                    'mail': mail,
                    'jobPos': jobPos,
                    'depart': depart,
                    'mailGroup': mailGroup,
                    'userName': userName,
                    'password': userName+'1234'},
                success: function(data) {
                    var signs = '<td class="center">\
                    <a class="saveline hvr-icon-bounce" title="Save"><i class="fa fa-floppy-o hvr-icon"></i></a>\
                    <a class="editline hvr-icon-bounce" title="Edit"><i class="fa fa-pencil-square-o hvr-icon"></i></a>\
                    <a class="privacy hvr-icon-bounce" title="Privacy Setting"><i class="fa fa-address-card-o hvr-icon"></i></a>\
                    <a class="resetline hvr-icon-spin" title="Reset Password"><i class="fa fa-refresh hvr-icon"></i></a>\
                    <a class="delete hvr-icon-bounce" title="Delete"><i class="fa fa-trash hvr-icon"></i></a>\
                    <a class="active-status hvr-icon-bounce" title="User Status">\
                        <span class="status active">Active</span></a>\
                    </td>'

                    $('tbody[id=manage]').find('tr:last-child').addClass(data.dataid)
                    $('.'+data.dataid).find('td:last-child').remove()
                    $('.'+data.dataid).append(signs)

                    var posts = '<tr>\
                    <td><input class="add inputex" id="emid"></td>\
                    <td><input class="add inputex" id="name"></td>\
                    <td><input class="add inputex" id="lastName"></td>\
                    <td><input class="add inputex" id="jobPos"></td>\
                    <td><input class="add inputex" id="depart"></td>\
                    <td><input class="add inputex" id="mail"></td>\
                    <td><input class="add inputex" id="mailGroup"></td>\
                    <td><input class="add inputex" id="userName"></td>\
                    <td class="center"><a class="addline hvr-icon-pulse-shrink" title="Add" data-toggle="tooltip"><i class="fa fa-plus hvr-icon"></i></a></td>\
                    </tr>'
                    $("table[id=manage]").append(posts)
                }
            })
		}	
    })


    $(document).on('click','.resetline',function(){
        dataid = $(this).parents('tr').attr('class')
        datausername = $(this).parents('tr').find('td:nth-child(8)').text()
        $.confirm({
            title: 'กู้คืนรหัสผ่าน',
            content: 'ยืนยันการกู้คืนรหัสผ่านบัญชี '+ datausername,
            theme: 'bootstrap',
            closeIcon: true,
            animation: 'scale',
            type: 'blue',
            buttons: {
                confirm: function() {
                    $.ajax({
                        url: '/setting',
                        type: "POST",
                        dataType: 'json',
                        async: false,
                        data: { 
                            'state': 'resetpassword',
                            'dataid': dataid,
                            'username': datausername
                        },
                        success: function(data) {
                            $.alert('ดำเนินการกู้คืนรหัสผ่านของบัญชี '+data.username+' เรียบร้อยแล้ว')
                        }
                    })
                },
                cancel: function() {
                    $.alert('ยกเลิกการกู้คืนรหัสผ่าน')
                }
            }
        })
    })

    $(document).on('click','.delete',function(){
        dataid = $(this).parents('tr').attr('class')
        datausername = $(this).parents('tr').find('td:nth-child(8)').text()
        $.confirm({
            title: 'ลบบัญชีผู้ใช้',
            content: 'ยืนยันการลบบัญชี '+ datausername,
            theme: 'bootstrap',
            closeIcon: true,
            animation: 'scale',
            type: 'red',
            buttons: {
                confirm: function() {
                    $.ajax({
                        url: '/setting',
                        type: "POST",
                        dataType: 'json',
                        async: false,
                        data: { 
                            'state': 'delete',
                            'dataid': dataid,
                            'userName': datausername,
                            'userName': $('#privacyName').text()
                        },
                        success: function(data) {
                            $('tr[class='+data.dataid+']').remove()
                        }
                    })
                },
                cancel: function() {
                    $.alert('ยกเลิกการลบบัญชีผู้ใช้')
                }
            }
        })
    })

    $(document).on('click','.rb-txt',function() {
        $(this).addClass('rotate')
        $(this).one("webkitAnimationEnd oanimationend msAnimationEnd animationend",function(event) {
            if (event.target.className=='rb-txt rotate') {
                $(this).removeClass('rotate')
            }
        })

        var chk,sel,
        sl = $(this).attr('id'),
        state = 'rb',
        dataname = $('table').find('#privacyName').text()
        if (sl == 'super-happy') { chk = [1,1,0,0,0,0,0] , sel = 0 }
        else if (sl == 'happy') { chk = [1,1,0,0,1,0,0] , sel = 1 }
        else if (sl == 'neutral') { chk = [1,1,1,1,1,0,0] , sel = 2 }
        else if (sl == 'sad') { chk = [1,1,0,1,1,1,1] , sel = 3 }
        else { chk = [1,1,1,1,1,1,1] , sel = 4 }
        $('input:radio[name=access]').each(function(){
            if (sl == $(this).attr('class')) {
                $(this).attr('checked',true)
            } else {
                $(this).attr('checked',false)
            }
        })
        $('input:checkbox[class=privacy]').each(function(){
            if (chk[$(this).attr('id')]) { 
                $(this).attr('checked',true)
            } else {
                $(this).attr('checked',false)
            }
        })
        $.ajax({
            url: '/privacy',
            type: "POST",
            dataType: 'text',
            data: { 
                state: state,
                sel: sel,
                dataname: dataname
            }
        })
    })
    $(document).on("click", ".sort-row", function(){
        var col = $(this).index()+1
        var table = $(this).parents("table")
        var n = 0
        var switching = true
        while (switching) {
            var allrow = $(table).find("tbody tr")
            switching = false
            $.each(allrow, function(index,thisrow) {
                let nextrow = $(thisrow).next()
                let thisdata = $(thisrow).find("td:nth-child("+col+")").data("source")
                let nextdata = $(nextrow).find("td:nth-child("+col+")").data("source")
                if (thisdata && (nextdata || nextdata == "") && thisdata != nextdata) {
                    if (nextdata != "") {
                        thisdata = (isNaN(thisdata) ? thisdata.toLowerCase() : parseInt(thisdata))
                        nextdata = (isNaN(nextdata) ? nextdata.toLowerCase() : parseInt(nextdata))
                        if (thisdata > nextdata) {
                            $(thisrow).before($(nextrow))
                            switching = true
                            n++
                        }
                    } else {
                        $(thisrow).before($(nextrow))
                        switching = true
                        n++
                    }
                } 
            })
        }
    })
    $(document).on("click", ".privacy", function(){
        var dataid = $(this).parents('tr').attr('class')
        $.ajax({
            url: '/setting',
            type: "POST",
            dataType: 'json',
            async: false,
            data: { 
                'state': 'privacy',
                'dataid': dataid
            },
            success: function(data) {
                var a = data.operator,
                b = ['super-happy','happy','neutral','sad','super-sad'],
                c = b[a]
                if (a == 0) { chk = [1,1,0,0,0,0,0] }
                else if (a == 1) { chk = [1,1,0,0,1,0,0] }
                else if (a == 2) { chk = [1,1,1,1,1,0,0] }
                else if (a == 3) { chk = [1,1,0,1,1,1,1] }
                else { chk = [1,1,1,1,1,1,1] }
                $('.datepicker').datepicker('update',data.cdate)
                $('#timepicker1').val(data.swtime)
                $('#timepicker2').val(data.ewtime)
                $('#privacyID').text(data.emid)
                $('#privacyID').attr('class',data.dataid)
                $('#comSelectbox').val(data.company_id)
                $('#privacyName').text(data.userName)
                $('#privacyMailGroup').text(data.mailGroup)
                if (data.wplace) { $('#wplace').attr('checked',true) }
                else { $('#wplace').attr('checked',false) }
                if (data.boss) { $('#boss').attr('checked',true) }
                else { $('#boss').attr('checked',false) }
                $('input:radio[name=access]').each(function(){
                    if (c == $(this).attr('class')) {
                        $(this).attr('checked',true)
                    } else {
                        $(this).attr('checked',false)
                    }
                })
                $('input:checkbox[class=privacy]').each(function(){
                    if (chk[$(this).attr('id')]) { 
                        $(this).attr('checked',true)
                    } else {
                        $(this).attr('checked',false)
                    }
                })
                $("#animatedModal").animatedModal({
                    modalTarget:'animatedModal',
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
                    },
                    afterClose: function() {
                        //$(".thumb").hide()
                        //window.location.reload(true)
                    }
                })
            }
        })
    })
    $(document).on("click", ".editline", function(){
        var listc = ['emid','name','lastName','jobPos','depart','mail','mailGroup','userName','password'],
        myint = 0
        $(this).parents("tr").find("td:not(:last-child)").each(function(){
            $(this).html('<input class="save center" id="'+listc[myint++]+'" value="'+$(this).text()+'">')   
        }) 
        $(this).parents("tr").find(".saveline").css("display","inline-block")
        $(this).parents("tr").find(".editline").css("display","none")
    })

    $(document).on("click", ".saveline", function(){
        var empty = false,
        input = $(this).parents("tr").find("input.save"),
        dataid = $(this).parents("tr").attr("class")

        input.each(function(){
			if(!$(this).val()){
				$(this).addClass("error");
				empty = true;
			} else {
                $(this).removeClass("error");
            }
        })
        $(this).parents("tr").find(".error").first().focus()
        if(!empty){
            $(this).parents("tr").find(".editline").css("display","inline-block")
            $(this).parents("tr").find(".saveline").css("display","none")
            var emid,name,lastName,jobPos,depart,mail,mailGroup,userName
			input.each(function(){
                $(this).parent("td").html($(this).val())
                if ($(this).attr('id') === 'emid') { emid = $(this).val() }
                if ($(this).attr('id') === 'name') { name = $(this).val() }
                if ($(this).attr('id') === 'lastName') { lastName = $(this).val() }
                if ($(this).attr('id') === 'jobPos') { jobPos = $(this).val() }
                if ($(this).attr('id') === 'depart') { depart = $(this).val() }
                if ($(this).attr('id') === 'mail') { mail = $(this).val() }
                if ($(this).attr('id') === 'mailGroup') { mailGroup = $(this).val() }
                if ($(this).attr('id') === 'userName') { userName = $(this).val() }
            })
            $.ajax({
                url: '/setting',
                type: "POST",
                dataType: 'json',
                async: false,
                data: { 
                    'state': 'save',
                    'dataid': dataid,
                    'emid': emid,
                    'name': name,
                    'lastName': lastName,
                    'mail': mail,
                    'jobPos': jobPos,
                    'depart': depart,
                    'mailGroup': mailGroup,
                    'userName': userName
                }
            })
	    	}
    })
})