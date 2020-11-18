jQuery(function ($) {
 $("#display-table").DataTable({
  dom: 'Bfrtip',
  scrollX: true,
  paging: true,
  pageLength: 10,
  searching: true,
  ordering: true,
  orderMulti: true,
  fixedHeader: {
      header: true,
      footer: false
  },
  "search": {
      "regex": true,
      "smart": true
  },
  buttons: [
   {
     text: 'สร้างเอกสารใหม่',
     action: function ( e, dt, node, config ) {
      window.open(window.location.origin +"/memo")
     }
   },
   {
    text: 'เอกสารเข้า',
    className: 'btn btn-success',
    attr: {
     "data-retire": 'user-disable'
    },
    action: function ( e, dt, node, config ) {
     $("#display-table").DataTable().columns(3).search($('.data-search').data('find'),true,false).draw()
    }
   },
   {
    text: 'เอกสารออก',
    className: 'btn btn-success',
    attr: {
     "data-retire": 'user-disable'
    },
    action: function ( e, dt, node, config ) {
     $("#display-table").DataTable().column(2).search($('.data-search').data('find'),true,false).draw()
    }
   }
  ],
  columnDefs: [
   {
     "data": null,
     "defaultContent": '\
     <div class="row center">\
      <div class="col-sm-4 datatable-option view-memo"><a class="fa fa-eye color-blue memo-view" title="ดูเอกสาร"></a></div>\
     </div>',
     "targets": -1
     //<div class="col-sm-3 datatable-option del-profile"><i class="fa fa-trash profile-del"></i><span>ลบ</span></div>\
   }
 ]
 })

 $(document).on('click','.memo-view',function() {
  let id = $(this).parents('tr').attr('id')
  window.open(window.location.origin +"/memo/view/" +id)
 })

})
