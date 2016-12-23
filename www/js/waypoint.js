$(".form_register").css("opacity","0");
$(".bhome").css("opacity","0");
$('.about').css({
	"opacity":"0",
	"margin-left":"-100px",
});



$("#btnreg").click(function(ev){
	ev.preventDefault();
});

$(".wregister").waypoint(function(){
	$(".form_register").animate({
		opacity: "1"
	},1500);
	
},"100vh");



$(".wabout").waypoint(function(){
	$('.about').animate({
		marginLeft:"12.5%",
		opacity: "1"
	},500);
});


$(document).ready(function(){
	$(".bhome").animate({
		opacity: 1
	},1000);
});

//Header
updateHeaderTitle();

function updateHeaderTitle(){
	var titleValue = $(".headerTitle");
	var posHeader = document.querySelector(".header").getBoundingClientRect.bottom;
	var url = location.pathname.substring(1);
	console.log(url)
	if(url== "" || url=="index.html"){
		
		var posHomeStart = document.querySelector(".home").getBoundingClientRect().top;
		var posHomeStop = document.querySelector(".home").getBoundingClientRect().bottom;
		var posAboutStart = document.querySelector(".about").getBoundingClientRect().top;
		var posAboutStop = document.querySelector(".about").getBoundingClientRect().bottom;
		var posRegisterStart = document.querySelector(".register").getBoundingClientRect().top;
		var posRegisterStop = document.querySelector(".register").getBoundingClientRect().bottom;
		var posContactStart = document.querySelector(".contact").getBoundingClientRect().top;
		var posContactStop = document.querySelector(".contact").getBoundingClientRect().bottom;
		
		
		if(posHomeStart>=posHeader<posHomeStop){
			titleValue.text("Home");
		}
		else if(posAboutStart>=posHeader<posAboutStop){
			titleValue.text("About");
		}
		else if(posRegisterStart>=posHeader<posRegisterStop){
			titleValue.text("Register");
		}
		else if(posContactStart-50>=posHeader<posContactStop){
			titleValue.text("Contact");
		}
	}
	else if(url=="_pages/browse.html"){
		titleValue.text("Browse");
	}
	else if(url=="_pages/action.html"){
		titleValue.text("Activiteit toevoegen");
	}
	else if(url=="_pages/myprofile.html"){
		titleValue.text("Mijn profiel");
	}
	else if(url=="_pages/activities.html"){
		titleValue.text("Opgeslagen activiteiten");
	}
	else if(url=="_pages/hondenvoorzieningen.html"){
		titleValue.text("Hondenvoorzieningen");
	}
	else if(url=="_pages/editmyprofile.html"){
		titleValue.text("Profiel aanpassen");
	}
}


$(window).scroll(function(){
	updateHeaderTitle();
});