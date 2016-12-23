(function(){
	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	window.addEventListener("resize",function(){
		w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	if(w>'850'){
		$('.navigatie').css('left',0);
	}else{
		$('.navigatie').css('left',100+'vw');
	}
});
	$(".hamburger").click(function(){
		usedHamburger = true;
		if($("#main").position().left == "0"){
			//navigatie openen;
			$(".navigatie").animate({
				left: "30vw"
			},300);
			$("#main").animate({
				left: "-70vw"
			},300);
			$(".hamburger").children().removeClass("fa-bars");
			$(".hamburger").children().addClass("fa-times");
		}

		//navigatie sluiten
		else{
			$(".navigatie").animate({
				left: "100vw"
			},300);
			$("#main").animate({
				left: "0"
			},300);
			$(".hamburger").children().removeClass("fa-times");
			$(".hamburger").children().addClass("fa-bars");
			console.log("closed");
		}
		$(".navigatie").children().click(function(){
		if(w<'850'){
			$(".navigatie").animate({
				left: "100vw"
			},0);
			$("#main").animate({
				left: "0"
			},0);
			$(".hamburger").children().removeClass("fa-times");
			$(".hamburger").children().addClass("fa-bars");
			console.log("child click");
		}
		});
	});
	

	$(".toggleMap").click(function(e){
		console.log(false);
		if($(this).hasClass("fa-map")){
			console.log(true);
			$(this).removeClass("fa-map").addClass("fa-list");
			$(".map").fadeIn().css('display','inline');
			$(".browseList").fadeOut().css('display','none');
			
		}else{
			$(this).removeClass("fa-list").addClass("fa-map");
			$(".map").fadeOut().css('display','none');
			$(".placeholderMap").fadeOut().css('display','none');
			$(".browseList").css('display','inline');
		}
	});

	$(".toggleFilter").click(function(e){
		if($(".filter").position().left == "0"){
			$(".filter").animate({
				left: "-70vw"
			},500);	
		}else{
			$(".filter").animate({
				left: "0vw"
			},500);
		}
	});
	
	$(".sluiten").click(function(){
		console.log("click");
		$(".placeholderMap").fadeOut().css({
            position: 'absolute',
        }).animate({
            top: '1000',
        },800,function(){
        });
	});
})();