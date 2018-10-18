jQuery(function($) {
    $(document).on("click", ".editline", function(){
        var listc = ['sick','personal','vacation','training','sterily','maternity','religious','military'],
        myint = 0
        $(this).parents("tr").find("td:not(:last-child):not(:first-child)").each(function(){
        $(this).html('<input size="2" class="save center" id="'+listc[myint++]+'" value="'+$(this).text()+'">')   
        })
        $(this).parents("tr").find(".saveline").css("display","inline-block")
        $(this).parents("tr").find(".editline").css("display","none")
    })
    $(document).on("click", ".saveline", function(){
        $(this).parents("tr").find(".editline").css("display","inline-block")
        $(this).parents("tr").find(".saveline").css("display","none")
        var empty = false,
        input = $(this).parents("tr").find("input.save"),
        dataid = $(this).parents("tr").attr("class"),
        userName = $(this).parents("tr").find(".thisname").text()
        input.each(function(){
            if(!$(this).val()){
                $(this).addClass("error");
                empty = true;
            } else{
                $(this).removeClass("error");
            }
        })
        $(this).parents("tr").find(".error").first().focus()
        if(!empty){
            var si,pe,va,tr,st,ma,re,mi,
            listc = ['sick','personal','vacation','training','sterily','maternity','religious','military']
            input.each(function(){
                $(this).parent("td").html($(this).val())
                if ($(this).attr('id') === listc[0]) { si = $(this).val() }
                if ($(this).attr('id') === listc[1]) { pe = $(this).val() }
                if ($(this).attr('id') === listc[2]) { va = $(this).val() }
                if ($(this).attr('id') === listc[3]) { tr = $(this).val() }
                if ($(this).attr('id') === listc[4]) { st = $(this).val() }
                if ($(this).attr('id') === listc[5]) { ma = $(this).val() }
                if ($(this).attr('id') === listc[6]) { re = $(this).val() }
                if ($(this).attr('id') === listc[7]) { mi = $(this).val() }
            })
            $.ajax({
                url: '/editentitle',
                type: "POST",
                dataType: 'json',
                async: false,
                data: { 
                    si: si,
                    pe: pe,
                    va: va,
                    tr: tr,
                    st: st,
                    ma: ma,
                    re: re,
                    mi: mi,
                    dataid: dataid,
                    userName: userName
                }
            })
        }
    })
})