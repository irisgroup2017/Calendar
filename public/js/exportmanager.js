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

    $(".dropdown dd ul li").on('click', function() {
        $(this).find("input").attr("checked",!$(this).find("input").attr("checked"))
    })
    $("#view").on("click",function() {
        let datepicka = $('.datepickera').datepicker('getDate').getTime()/1000
        let datepickb = $('.datepickerb').datepicker('getDate').getTime()/1000
        let selected = $(".multiselect span")
        let id = $.map(selected,function(span,index) {
            return span.className
        })

        if (!id.length || rdo !== "choose") { id = "empty" }
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
                        paging: false,
                        searching: true,
                        ordering: true,
                        orderMulti: true,
                        pageLength: 50,
                        data: data,
                        rowGroup: {
                            dataSrc: 'name'
                        },
                        "search": {
                            "regex": true,
                            "smart": true
                        },
                          columnDefs:[
                            {
                                searchPanes:{
                                    threshold: 0.99,
                                },
                                targets:[0]
                            }
                        ],
                        columns:[
                            { data: "name"},
                            { data: "insert"},
                            { data: "start"},
                            { data: "startTime"},
                            { data: "end"},
                            { data: "endTime"},
                            { data: "type"},
                            { data: "title"},
                            { data: "swap"},
                            { data: "thisyear"},
                            { data: "lastyear"},
                            { data: "totalyear"},
                            { data: "used"},
                            { data: "remain"},
                            { data: "status"},
                            { data: "approver"},
                            { data: "approved"}
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

        if (!id.length || rdo !== "choose") { id = "empty"}
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

function getSelectedValue(id) {
    return $("#" + id).find("dt a span.value").html()
    }
    
    $('.multi-select li').on('click', function() {
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