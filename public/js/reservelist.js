jQuery(function () {
 //initial script
 $("#display-table").DataTable({
  dom: 'Bfrtip',
  scrollX: true,
  paging: false,
  searching: true,
  ordering: true,
  orderMulti: true,
  order: [1, 'asc'],
  fixedHeader: {
   header: true,
   footer: false
  },
  "search": {
   "regex": true,
   "smart": true
  },
  
 })
})