function format(d) {
 return '<div class="detail-content"><h5>รายละเอียดเพิ่มเติม</h5>\
 <dl class="row">\
  <dt class="col-2">เลขไมล์</dt><dd class="col-10">'+ d.miles +' - '+ d.milee+'</dd>\
  <dt class="col-2">รายละเอียดการใช้งาน</dt><dd class="col-10">'+ d.title +'</dd>\
  <dt class="col-2">หมายเหตุ</dt><dd class="col-10">'+ d.remark +'</dd>\
 </dl></div>'
}

jQuery(function () {
 //initial script
 var dt
 $.ajax({
  url: '/reservelist/table',
  type: 'GET',
  async: false,
  success: function (data) {
   dt = $("#display-table").DataTable({
    scrollX: true,
    paging: false,
    searching: true,
    ordering: true,
    orderMulti: true,
    autoWidth: true,
    order: [1, 'asc'],
    fixedHeader: {
     header: true,
     footer: false
    },
    search: {
     regex: true,
     smart: true
    },
    data: data,
    columns: [{
      class: 'details-control',
      orderable: false,
      data: null,
      render: function (data, type, row) {
       return (row.remark != '' ? '<i class="fa fa-lightbulb-o text-dark mr-2"></i>' : '') +'<i class="fa fa-arrow-right"></i>'
      //defaultContent: '<i class="fa fa-arrow-right fa-3 center"></i>'
      }
     },
     {
      data: "date",
      render: function (data, type, row) {
       return moment(data).locale('th').format('DD MMM YYYY')
      }
     },
     {
      data: "license"
     },
     {
      data: "name"
     },
     {
      data: "place",
      render: function (data, type, row) {
       data = (data != null ? data.map(p => '<div class="badge badge-info">' + p + '</div>') : '<div class="badge badge-dark">'+row.title+'</div>')
       return (typeof data == 'string' ? data : data.join(" "))
      }
     },
     {
      data: "times",
      render: function (data, type, row) {
       let diff = moment(row.date +' '+row.rstart,'YYYY-MM-DD HH:mm:ss').diff(moment())
       if (diff >= 0) {
        if (row.allday && row.timee != null && row.timee != '00:00:00') {
         return "08:30:00"
        } else if ((data == null || data == '00:00:00') && (row.timee != null && row.timee != '00:00:00')) {
         return moment(row.rstart).format('HH:mm:ss')
        } else {
         return data
        }
       } else {
        return ""
       }
      }
     },
     {
      data: "timee",
      render: function (data, type, row) {
       if (data == null || data == '00:00:00') {
        return ""
       } else {
        return data
       }
      }
     },
     {
      data: 'miled',
      render: function (data,type,row) {
       return (row.miles > 0 && row.milee > 0 ? row.milee - row.miles +' กิโลเมตร' : 'ยังไม่บันทึกข้อมูล')
      }
     }
    ]
   })
  }
 })

 var detailRows = [];

 $('#display-table tbody').on('click', 'tr td.details-control', function () {
  var tr = $(this).closest('tr');
  var icon = $(this).find('i.fa-arrow-right')
  var iconl = $(this).find('i.fa-lightbulb-o')
  var row = dt.row(tr);
  var idx = $.inArray(tr.attr('id'), detailRows);

  if (row.child.isShown()) {
   icon.addClass('fa-rotate-0')
   icon.removeClass('fa-rotate-90')
   setTimeout(function() { icon.removeClass('fa-rotate-0') }, 1000)
   iconl.removeClass('text-warning')
   iconl.addClass('text-dark')
   tr.removeClass('details');
   row.child.hide();

   // Remove from the 'open' array
   detailRows.splice(idx, 1);
  } else {
   tr.addClass('details');
   icon.addClass('fa-rotate-90')
   iconl.removeClass('text-dark')
   iconl.addClass('text-warning')
   row.child(format(row.data())).show();

   // Add to the 'open' array
   if (idx === -1) {
    detailRows.push(tr.attr('id'));
   }
  }
 });

 // On each draw, loop over the `detailRows` array and show any child rows
 dt.on('draw', function () {
  $.each(detailRows, function (i, id) {
   $('#' + id + ' td.details-control').trigger('click');
  });
 });

})