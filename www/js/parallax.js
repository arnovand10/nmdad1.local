$(window).scroll(function(){
	var scroll = $(this).scrollTop();
	$(".bhome").css({
		"transform":'translate(0px,'+ scroll/15+ '%)'
	});
});


$(window).scroll(function(){
	var scroll = $(this).scrollTop();
	$(".bregister").css({
		"transform":'translate(0px,'+ (scroll/40)+ '%)'
	});
});