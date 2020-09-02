$('document').on('click','for=[tabpage*]',function() {
 console.log($(this))
 $('.tabcheck:checked').prop('checked',false)
 $(this).prop('checked',true)
})