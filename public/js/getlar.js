$(document).ready(function(){
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
    $(window).on("load",function() {
       var d = new Date()
       $('.datepickera').datepicker('setDate',new Date(d.getFullYear(),d.getMonth(),d.getDate()-1))
       $('.datepickerb').datepicker('setDate',new Date(d.getFullYear(),d.getMonth(),d.getDate()))
    })
    $("#searchdata").click(function() {
        searchData() 
    })

   function searchData() {
       var datepicka = $('.datepickera').datepicker('getDate'),
       datepickb = $('.datepickerb').datepicker('getDate')
           $.ajax({
               url: '/searchb',
               type: "POST",
               dataType: 'json',
               async: false,
               data: { 
                   'datea': datepicka.getTime(),
                   'dateb': datepickb.getTime()
               },
               success: function(data) {
               if (data.objs == "") {  
                   $('.col-sm-2 h4').text("ไม่พบข้อมูล")
                   $('table tbody tr').remove()
               } else { 
                   $('.col-sm-2 h4').text("")
                   $('table tbody tr').remove()
                   $('table').append(rows(data))
               }
           }
       })
   }

   function rows(data) {
       var i = 0,
       dataset = '',
       classn
       while (i < data.tbl) {
           dataset += '<tr '+ data.objs[i].classn +'>\
           <td>'+data.objs[i].cTime+'</td>\
           <td>'+data.objs[i].lartype+'</td>\
           <td>'+data.objs[i].title+'</td>\
           <td>'+data.objs[i].dateStart+'</td>\
           <td>'+data.objs[i].dateEnd+'</td>\
           <td>'+(data.objs[i].timeEnd ? data.objs[i].timeStart+'-'+data.objs[i].timeEnd : data.objs[i].timeStart)+'</td>\
           <td>'+data.objs[i].daylength+'</td>\
           <td>'+data.objs[i].larstatus+'</td>\
           <td>'+data.objs[i].userName+'</td>\
           <tr>'
           i++
       }

       dataset += '<tr>\
       <td>รวม '+data.tbl+' รายการ</td>\
       <td></td>\
       <td></td>\
       <td></td>\
       <td></td>\
       <td></td>\
       <td>'+data.lengthPlus+'</td>\
       <td></td>\
       <td></td>\
       <tr>'

       return dataset
   }
})