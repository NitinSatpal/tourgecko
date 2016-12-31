$(function() {
    var minimized_elements = $('p.minimize');
    
    minimized_elements.each(function(){    
        var textdata = $(this).text();   
        
        if(textdata.length < 250) return;
        
        $(this).html(
            textdata.slice(0,250)+'<span>... </span><a href="#" class="more" style="color:#ff9800;">Read More</a>'+
            '<span style="display:none;">'+ textdata.slice(250,textdata.length)+' <a href="#" class="less" style="color:#ff9800;">Less</a></span>'
        );
        
    }); 
    
    $('a.more', minimized_elements).click(function(event){
        event.preventDefault();
        $(this).hide().prev().hide();
        $(this).next().show();        
    });
    
    $('a.less', minimized_elements).click(function(event){
        event.preventDefault();
        $(this).parent().hide().prev().show().prev().show();    
    });
});
