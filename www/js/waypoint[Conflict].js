$(".register").css("opacity","0");
$(".bregister").css("opacity","0");
$(".bhome").css("opacity","0");
$('.about').css({
	"opacity":"0",
	"margin-left":"-100px",
});



$(".wregister").waypoint(function(){
	$(".register").animate({
		opacity: "1"
	},1500);
	$(".bregister").animate({
		opacity: "1"
	},2000);
	console.log("register");

	if($(".about").css("opacity")=="1"){
		$(".about").animate({
		marginLeft:"0",
		opacity: "0"
	},500);
	}else{
		$('.about').animate({
		marginLeft:"12.5%",
		opacity: "1"
	},500);
	}
	
},"100vh");



$(".wabout").waypoint(function(){
	$('.about').animate({
		marginLeft:"12.5%",
		opacity: "1"
	},500);
});


$("main").waypoint(function(){
	$(".bhome").animate({
		opacity: 1
	},1000)
});


