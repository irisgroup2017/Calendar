$(document).ready(function(){ 
    $(window).on("load",function() {
        var d = new Date()
        $('.datepickera').datepicker('setDate',new Date(d.getFullYear(),d.getMonth()-1,21))
        $('.datepickerb').datepicker('setDate',new Date(d.getFullYear(),d.getMonth(),20))
    })
    $('.datepicker').datepicker({
        ignoreReadonly: true,
        format: 'dd/MM/yyyy',
        todayHighlight: true
    })
    $('.datepickera').datepicker().on('changeDate',function(e){
        $('.datepickera').datepicker('hide')
        $('.datepickerb').datepicker('show')
    })
    $('.datepickerb').datepicker().on('changeDate',function(e){
        $('.datepickerb').datepicker('hide')
    })

    $(".tyear").on("click",function(){
        $(".month-list").toggleClass("hide")
    })

    $(".dropdown dt a").on('click', function() {
        $(".dropdown dd ul").slideToggle('fast')
    })
    $("#view").on("click",function() {
        let datepicka = $('.datepickera').datepicker('getDate').getTime()/1000
        let datepickb = $('.datepickerb').datepicker('getDate').getTime()/1000
        let selected = $(".multiselect span")
        let id = $.map(selected,function(span,index) {
            return span.className
        })
        console.log(id)

        if (!id.length) { id = "empty" }
        $.ajax({
            url: '/exportmanager',
            type: "POST",
            async: false,
            data: {
                "state": "view",
                "id": id,
                "start": datepicka,
                "end": datepickb
            },
            success: function (data,res,jqXHR) {
                let status = jqXHR.status
                if (status == 204) { alert('ไม่พบข้อมูลในรายการที่คุณกำหนด') }
                if (status == 200) {
                    $(".show-table").DataTable({
                        destroy: true,
                        scrollX: true,
                        paging: true,
                        searching: true,
                        ordering: true,
                        orderMulti: true,
                        pageLength: 50,
                        data: data,
                        fixedColumns: {
                            leftColumns: 2
                        },
                        fixedHeader: {
                            header: true,
                            footer: false
                        },
                        //orderFixed: [0, 'asc'],
                        /*rowGroup: {
                            dataSrc: 'name'
                        },*/
                        "search": {
                            "regex": true,
                            "smart": true
                        },
                        columns:[
                            { data: "name", title: "ชื่อ - นามสกุล" },
                            { data: "depart", title: "สังกัดฝ่าย" },
                            { data: "insert", title: "วันที่ยื่นขอ" },
                            { data: "start", title: "วันเริ่มต้น" },
                            { data: "startTime", className: "dt-body-center", title: "เวลาเริ่มต้น" },
                            { data: "end", title: "วันสิ้นสุด" },
                            { data: "endTime", className: "dt-body-center", title: "เวลาสิ้นสุด" },
                            { data: "type", title: "ประเภทการลา" },
                            { data: "title", title: "เหตุผลการลา" },
                            { data: "swap", className: "dt-body-center", title: "วันที่สลับวันหยุด" },
                            { data: "thisyear", className: "dt-body-center", title: "สิทธิได้รับปีนี้" },
                            { data: "lastyear" , className: "dt-body-center" , title: "สิทธิคงเหลือปีก่อน" },
                            { data: "totalyear" , className: "dt-body-center" , title: "สิทธิในปีนี้" },
                            { data: "used" , className: "dt-body-center" , title: "ใช้" },
                            { data: "remain" , className: "dt-body-center" , title: "คงเหลือ" },
                            { data: "status", title: "สถานะ" },
                            { data: "approver", title: "ผู้อนุมัติ" },
                            { data: "approved", title: "วันที่อนุมัติ" }
                        ]
                    })
                }
            },
            error: function (e) {
                console.log("error",e)
            }
        })
    })

    $("#export").click(function() {
        let rdo = $("input[name=option]:checked").val()
        let datepicka = $('.datepickera').datepicker('getDate').getTime()/1000
        let datepickb = $('.datepickerb').datepicker('getDate').getTime()/1000
        let selected = $(".multiselect span")
        let id = $.map(selected,function(span,index) {
            return span.className
        })

        if (!id.length) { id = "empty"}
        $.ajax({
            url: '/exportmanager',
            type: "POST",
            async: false,
            data: {
                "state": "export",
                "option": rdo,
                "id": id,
                "start": datepicka,
                "end": datepickb
            },
            success: function (data,res,jqXHR) {
                let status = jqXHR.status
                if (status == 204) { alert('ไม่พบข้อมูลในรายการที่คุณกำหนด') }
                if (status == 200) {
                    window.location = data
                }
            },
            error: function (e) {
            console.log("error",e)
            }
        })
    })
})
    
$('.multi-select li').on('click', function() {
    $(this).find("input").attr("checked",!$(this).find("input").attr("checked"))
    let title = $(this).find("input").val() + ","
    let id = $(this).attr("class")
    if ($(this).find("input").is(':checked')) {
        var html = '<span class="'+ id +'" title="' + title + '">' + title + '</span>'
        $('.multiselect').append(html)
        $(".hida").hide()
    } else {
        $('span[title="' + title + '"]').remove()
        if ($(".dropdown a span").length == 1) {
        $(".hida").show()
        }
    }
})