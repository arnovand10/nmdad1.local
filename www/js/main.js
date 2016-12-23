function ready(cb) {
    /in/.test(document.readyState)
    ? setTimeout(ready.bind(null, cb), 90)
    : cb();
};

ready(function(){

    var App = {
        "init": function() {
            this._unitTesting = false; // Unit Testing the ApplicationDbContext or not

            this._applicationDbContext = applicationDbContext; // Reference to the ApplicationDbContext object
            this._applicationDbContext.init('ahs.ab.WAF'); // Intialize the ApplicationDbContext with the connection string as parameter value

            //user manager verwerkt login
            this._userManager = UserManager;
            this._userManager.init(this._applicationDbContext);


           	this.checkCurrentPage();

            //alleprofiles
            this.profiles = this._applicationDbContext._dbData.profiles;

            //activeUser
            this._dbActiveUser = this._applicationDbContext._dbData.activeuser;
            if(this._dbActiveUser!=null){
            	this._activeUser = this.findActiveUserId(this._dbActiveUser["id"]);
        	}
            

           	//index.html/#home
           	this._formLogin = document.querySelector(".form_home");
           	this._btnLogin = document.querySelector(".btnLogin");
            
        	//data ophalen bij login
        	if(this._formLogin!=null){
           		this.loginEventListeners();
                if(this._applicationDbContext._dbData.activeuser != null){
                    
                    //disable inlogveld en register veld
                    var inputvelden = document.querySelectorAll(".form_home>input");
                    for(var i=0; i<inputvelden.length;i++){
                        inputvelden[i].disabled = true;
                    }
                    document.querySelector(".form_home").style.display = "none";
                    // toon weer
                    this.getWeather();
                }else{
                    var inputvelden = document.querySelectorAll(".form_home>input");
                    for(var i=0; i<inputvelden.length;i++){
                        inputvelden[i].disabled = false;
                    }
                }
           	}

           	//index.html/#register
           	this._formRegister = document.querySelector(".form_register");
           	if(this._formRegister != null){
           		this.registerEventListeners();
                //disablen van register form wanneer de gebruiker is ingelogd
                if(this._applicationDbContext._dbData.activeuser != null){
                    console.log("ingelogd");
                    var inputvelden2 = document.querySelectorAll(".form_register>input");
                    var buttonRegister = document.querySelector(".form_register>button");

                    for(var i=0; i<inputvelden2.length;i++){
                        inputvelden2[i].disabled = true;
                    }
                    buttonRegister.disabled = true;
                    document.querySelector(".infoRegister").innerHTML = "U bent al geregistreerd!"
                }else{
                    console.log("uitgelogd");
                    var inputvelden2 = document.querySelectorAll(".form_register>input");
                    var buttonRegister = document.querySelector(".form_register>button");
                    for(var i=0; i<inputvelden2.length;i++){
                        inputvelden2[i].disabled = false;
                    }
                }
           	}

           	//uitloggen
           	this._btnLogout = document.querySelector(".btnLogout");
           	this.logoutEventListeners();

           	


            //myprofile.html
            this._myprofilePage = document.querySelector(".myprofilePage");
            this._myprofileUsername = document.querySelector('.myUsername');
            this._myprofileStatus = document.querySelector('.myStatus');
            this._myprofileLocation = document.querySelector('.myLocation');
            this._myprofileRating = document.querySelector(".myRating");
            this._myprofileDog = document.querySelector('.myDog');
            this._myprofileRace = document.querySelector('.myRace');
            this._myprofileImage = document.querySelector('.myImage');
            this._myprofileBtn=  document.querySelector(".myprofileAanpassen");
            //check of we op myprofile.html pagina zijn
            if(this._myprofilePage!=null){
            	//check of er een active user is
            	if(this._applicationDbContext._dbData.activeuser != null){
            		//data myprofile uit local storage halen
            		console.log(this._applicationDbContext._dbData.activeuser["id"]);
            		//this.updateUIMyProfile(this._applicationDbContext._dbData.activeuser["id"]);	
            		this.updateUIMyProfile(this._activeUser);

                    //check of er op de profielaanpassen knop gedrukt wordt
                    this.myprofilePageBtnEventListener();
            	}
            	//geen active user -> redirect naar home
            	else{
            		window.location = "/index.html";
            	}
            }

            //editmyprofile.html
            this._myProfilePageEdit = document.querySelector('.myprofilePageEdit');
            if(this._myProfilePageEdit != null){
                this._dogRaceDbUrl =  "https://raw.githubusercontent.com/dariusk/corpora/master/data/animals/dogs.json";
                this._dogRaceArray = this.getDogRace(this._dogRaceDbUrl);
                this._btnEdit = document.querySelector('.btnEditMyProfile');
                this.myProfilePageEdit(this._dogRaceArray);
            }

            //action.html
            this._actionPage = document.querySelector(".action");
            if(this._actionPage != null){
                this.actionEventListener();
            }

            //browse.html
            this._browsePage = document.querySelector(".browse");
            if(this._browsePage != null){
                this._activiteiten = this.getActivities();
                var self= this;
                document.querySelector(".btnFilter").addEventListener("click",function(e){
                    e.preventDefault();
                    $(".filter").animate({
                        left: "-70vw"
                    },500); 
                    self.filterActivities(self._activiteiten);
                    self.addOrDeleteActivities();
                
                });
                document.querySelector(".btnReset").addEventListener("click",function(e){
                    e.preventDefault();
                    $(".filter").animate({
                        left: "-70vw"
                    },500);
                    if($(".toggleMap").hasClass("fa-map")){
                        console.log(true);
                        $(".toggleMap").removeClass("fa-map").addClass("fa-list");
                        $(".map").fadeIn().css('display','inline');
                        $(".browseList").fadeOut().css('display','none');
                    }
                    self.activiteiten = self.getActivities();
                    self.addOrDeleteActivities();
                
                });
                if(this._activiteiten != null){
                    this.addOrDeleteActivities();
                }
            }

            //activities.html
            this._savedActivitiesPage = document.querySelector(".activities");
            if(this._savedActivitiesPage != null){
                this._savedActivities = this.getSavedActivities();
                if(this._savedActivities != null){
                    this.deleteSavedActivities(this._savedActivities);
                }
            }

            //hondenvoorzieningen.html
            this._hondenvoorzieningenPage = document.querySelector(".hondenvoorzieningen");
            if(this._hondenvoorzieningenPage != null){
                GMap.init();
            
                Utils.getJSONPByPromise(this.urlYQL);
                console.log(this.parsed);
                console.log(this.parseRespond);
            }
            



        },

        "getWeather":function(){
            var urlYQL = "https://query.yahooapis.com/v1/public/yql?";
            var query = "q=select * from weather.forecast where u='c' and woeid in (select woeid from geo.places(1) where text='ghent')";
            var format = "&format=json";
            var parseYQL = urlYQL+query+format;
            var getJSON =$.ajax({type: "GET", url: parseYQL, async: false}).responseText;
            var getWeather = JSON.parse(getJSON);
            console.log(getWeather)
            var weatherPlaceholder = document.querySelector(".weather");
            if(getWeather.query.results!=null){
                var weersvoorspelling = "<p>"+getWeather.query.results.channel.description+"</p";
                weersvoorspelling += "<p>"+getWeather.query.results.channel.item.description+"</p>";
                //split op '(' omdat de result iets tussen '(' weergeeft dat we niet nodig hebben
                var text = weersvoorspelling.split("(");
                weatherPlaceholder.innerHTML = text[0];
            }
            else{
                weatherPlaceholder.innerHTML = "<p>YQL weersvoorspelling werd niet geladen, onze excuses.</p>";
            }
        },

        "checkCurrentPage":function(){
        	//checken of user is ingelogt (m.a.w. check of useractive != null)
            if(this._applicationDbContext._dbData.activeuser == null){
            	//indien niet ingelogd wordt navigatie aangepast
            	document.querySelector(".inlogNav").style.visibility = "hidden";

            	//De huidige url opvragen en splitsen op '/'
            	//bv https://127.0.0.1:400/_pages/action.html
      			//zoeken naar _pages => na 3de '/'
            	var currentPage = window.location.href;
            	var currentDir = currentPage.split("/")[3];

            	//als we op /_pages/ komen en niet ingelogd zijn moeten we geriderect worden
            	// /_pages/ mag enkel bezocht worden indien je ingelogd bent
            	if(currentDir == "_pages"){
            		window.location = "/index.html";	
            	}
            }
        },

        "loginEventListeners": function() {
            // Event Listeners for Form Login
            if(this._formLogin != null) {
                var self = this; // Hack for this keyword within an event listener of another object
                this._btnLogin.addEventListener('click', function(ev) {
                	ev.preventDefault();
                    var userName = Utils.trim(document.querySelectorAll('[name="user"]')[0].value);
                    var passWord = Utils.trim(document.querySelectorAll('[name="pass"]')[0].value);
                    var result = self._userManager.login(userName, passWord);
                    console.log(result);
                    if(result == null) {
                        document.querySelector('[name="user"]').style.border = "2px solid red";
                        document.querySelector('[name="pass"]').style.border = "2px solid red";
                    	console.log("niets gevonden of leeg veld");
                    } else if(result == false) {
                        document.querySelector('[name="user"]').style.border = "2px solid red";
                        document.querySelector('[name="pass"]').style.border = "2px solid red";
                    	console.log("gebruikersnaam en wachtwoord komen niet overeen");
                    } else {
                        self._activeUser = result; // User is Logged in
                        self._applicationDbContext._dbData.activeuser = result;
                        self._applicationDbContext.save();
                        self.updateUI();
                        return self._activeUser;
                    }
                    
                    return false;
                });
            }else{
            	console.log("form_home false");
            }
        },

        "updateUI":function(){
            //wanneer ingelogd update de navigatie
        	document.querySelector(".inlogNav").style.visibility = "visible";
            //check of het de 1ste keer is dat de gebruiker inlogt
            //als het de 1ste keer is, redirect naar edit my profile
        	if(this._activeUser.lastLogin == ""){
                this.updateLastLoginById(this._activeUser.id);
                window.location = "/_pages/editmyprofile.html";
                console.log(this._activeUser.id);
            }else{
                this.updateLastLoginById(this._activeUser.id);
                window.location = "/_pages/myprofile.html";
                console.log(this._activeUser.id);
            }
        },

        "updateLastLoginById":function(activeId){
            //alle profielen doorlopen, en zoeken waar de activeuserID = profileID
            for(var i=0;i<this._applicationDbContext._dbData.profiles.length;i++){
                if(this._applicationDbContext._dbData.profiles[i].id == activeId){
                    //gevonden -> update last login
                    this._applicationDbContext._dbData.profiles[i].lastLogin = new Date();
                    this._applicationDbContext.save();
                }
            }
            
        },

        "myprofilePageBtnEventListener":function(){
            this._myprofileBtn.addEventListener("click",function(ev){
                ev.preventDefault();
                window.location = "/_pages/editmyprofile.html";
            });
        },

        "getDogRace":function(dogRaceUrl){
            var races = $.ajax({type: "GET", url: dogRaceUrl, async: false}).responseText;
            var response = JSON.parse(races);
            console.log(response.dogs);
            return response.dogs;
        },

        "myProfilePageEdit":function(arrayDogRaces){


            //textvelden upvullen met de profiel waardes uit de localstorage
            console.log(this._applicationDbContext._dbData.profiles[this._activeUser]);
            document.querySelector('[name="foto"]').value =  this._applicationDbContext._dbData.profiles[this._activeUser].profielfoto;
            document.querySelector('[name="status"]').value =  this._applicationDbContext._dbData.profiles[this._activeUser].status;
            document.querySelector('[name="locatie"]').value =  this._applicationDbContext._dbData.profiles[this._activeUser].locatie;
            document.querySelector('[name="hond"]').value =  this._applicationDbContext._dbData.profiles[this._activeUser].hondnaam;
            document.querySelector("#ras").innerHTML =  this._applicationDbContext._dbData.profiles[this._activeUser].hondras;
            document.querySelector("#ras").value =  this._applicationDbContext._dbData.profiles[this._activeUser].hondras;
            document.querySelector('[name="email"').value = this._applicationDbContext._dbData.profiles[this._activeUser].email;
            
            //select vullen met hondenrassen
            for(var i =0; i<arrayDogRaces.length;i++){
                document.querySelector('[name="ras"').innerHTML += '<option value="'+arrayDogRaces[i]+'">'+arrayDogRaces[i]+'</option>';
            }



            //wanneer er op de knop gedrukt wordt, textveld values opvragen en opslaan in database
            var self = this;
            this._btnEdit.addEventListener("click",function(ev){
                ev.preventDefault();
                //waardes uit textvelden halen
                var profileId = self._activeUser;
                var profilePic = Utils.trim(document.querySelector('[name="foto"]').value);
                var profileStatus = Utils.trim(document.querySelector('[name="status"]').value);
                var profileLocatie = Utils.trim(document.querySelector('[name="locatie"]').value);
                var profileHondNaam = Utils.trim(document.querySelector('[name="hond"]').value);
                var profileHondRas = Utils.trim(document.querySelector('[name="ras"]').value);
                var profileEmail =  Utils.trim(document.querySelector('[name="email"]').value);
                
                //textveld values in array stoppen en meegeven aan functie updateMyProfile()
                var profileEdited = [profileId,profilePic,profileStatus,profileLocatie,profileHondNaam,profileHondRas, profileEmail];

                var result = self._applicationDbContext.updateMyProfile(profileEdited);
                if(result!=null){
                    window.location = "/_pages/myprofile.html";
                }
                
            });
        },

        "logoutEventListeners":function(){
        	//klik op logout knop
        	var self = this;
        	this._btnLogout.addEventListener("click",function(ev){
        		//active user op null stellen
        		//opslaan in de data
        		//navigatie aanpassen
        		//redirecten naar homepage
        		ev.preventDefault();
        		self._activeUser = null;
        		self._userManager.logout();
        		self._applicationDbContext.save();
        		document.querySelector(".inlogNav").style.visibility = "hidden";
        		window.location = "/index.html";
        	});
        },

        "registerEventListeners":function(){
        	//check knop registreer klik
        	var self = this;
	        var _regBtn = document.querySelector("#regreg");
        	_regBtn.addEventListener("click",function(ev){
        		//Geen default actie
        		ev.preventDefault();
        	
	        	//waardes uit de textvelden halen wanneer register form aanwezig is
		        var _regUser = Utils.trim(document.querySelector('[name="reguser"]').value);
		        var _regEmail = Utils.trim(document.querySelector('[name="email"]').value);
		        var _regPass = Utils.trim(document.querySelector('[name="regpass"]').value);
		        var _regRePass = Utils.trim(document.querySelector('[name="reregpass"]').value);
                
                //p tag wordt vervangen door errormessage
                var _errorMessage = document.querySelector(".placeholderErrorMessage");
                _errorMessage.style.color = "red";

                //borders normale kleur geven (anders blijven ze rood, ookal zijn ze na een fout gecorrigeerd)
                document.querySelectorAll(".form_register>input")[0].style.border = "2px solid rgba(52,95,137,1)";
                document.querySelectorAll(".form_register>input")[1].style.border = "2px solid rgba(52,95,137,1)";
                document.querySelectorAll(".form_register>input")[2].style.border = "2px solid rgba(52,95,137,1)";
                document.querySelectorAll(".form_register>input")[3].style.border = "2px solid rgba(52,95,137,1)";

                
                
	        	//checken of alle waardes ingevuld zijn en _regPass == _regRePass
	        	if(_regPass!="" && _regEmail!="" && _regUser!="" && _regRePass!=""){
                    if(_regPass==_regRePass){


    	        		//check of username al bestaat| neen => ok | ja=> niets doen
    	        		var getUser = self._applicationDbContext.getProfileByUserName(_regUser);
    	        		if(getUser==null || getUser==undefined){
    	        			//toevoegen van gebruikers
    	        			var profile = new Profile();
    	        			profile.gebruikersnaam = _regUser;
    	        			profile.email = _regEmail;
    	        			profile.wachtwoord = _regPass;
                            profile.profielfoto = "../css/img/dog-placeholder.jpg";
                            profile.status = "";
                            profile.locatie = "";
                            profile.rating = "";
                            profile.hondnaam = "";
                            profile.hondras = "";
                            profile.CreatedAt = new Date();
                            profile.lastLogin = "";
                            profile.opgeslagenActiviteiten = [];
                            


    	        			var addedprofile = self._applicationDbContext.addProfile(profile);
    	        			if(addedprofile != null){
                                document.querySelector("#btnreg>a").innerHTML = "Geregistreerd";
    	        				window.location = "index.html";
    	        				console.log("gebruiker toegevoegd");
                                return true;
    	        			}
                            else{
                                _errorMessage.innerHTML = "Interne fout bij het registreren.";
    	        				console.log("fout bij profiel toevoegen");
    	        				return false;
    	        			}
    	        		}
                        else{
                            _errorMessage.innerHTML = "Gebruikersnaam al in gebruik.";
                            //focus in textveld zetten en rode rend geven
                            document.querySelector('[name="reguser"').focus();
                            document.querySelectorAll(".form_register>input")[0].style.border = "2px solid red";
    	        			console.log("gebruikersnaam al in gebruik");
    	        			return false;
    	        		}
                    }
                    else{
                        _errorMessage.innerHTML = "Passwoorden komen niet overeen.";
                        document.querySelector('[name="regpass"').focus();
                        document.querySelectorAll(".form_register>input")[2].style.border = "2px solid red";
                        document.querySelectorAll(".form_register>input")[3].style.border = "2px solid red";
                        console.log("wachtwoorden zijn niet identiek");
                        return false;
                    }
                }
                else{
                    _errorMessage.innerHTML = "Gelieve alle velden correct in te vullen.";
                    document.querySelector('[name="reguser"').focus();
                    //document.querySelector('[name="reguser"').style.border = "2px solid red";
                    document.querySelectorAll(".form_register>input")[0].style.border = "2px solid red";
                    document.querySelectorAll(".form_register>input")[1].style.border = "2px solid red";
                    document.querySelectorAll(".form_register>input")[2].style.border = "2px solid red";
                    document.querySelectorAll(".form_register>input")[3].style.border = "2px solid red";
                    console.log(_borderUser);
	        		console.log("niet alle waardes ingevuld");
	        		return false;
	        	}

        	});
        },



        "findActiveUserId":function(activeuser){
        	var i = 0;
        	while(this.profiles[i]["id"]!=activeuser){
        		i++;
        	}
        	return i;
        },

        "updateUIMyProfile":function(activeId){
        	this._myprofileUsername.innerHTML = this.profiles[activeId]["gebruikersnaam"];
        	this._myprofileStatus.innerHTML = this.profiles[activeId]["status"];
        	this._myprofileLocation.innerHTML = this.profiles[activeId]["locatie"];
        	this._myprofileDog.innerHTML = this.profiles[activeId]["hondnaam"];
        	this._myprofileRace.innerHTML = this.profiles[activeId]["hondras"];
        	this._myprofileImage.style.backgroundImage = "url("+this.profiles[activeId]["profielfoto"]+")";
        },

        "actionEventListener":function(){
            
            //GOOGLE API PLACES
            var latLng;
            var searchBox = new google.maps.places.SearchBox(document.querySelector('[name="locatie"]'));

            google.maps.event.addListener(searchBox, 'places_changed',function(){
                var places = searchBox.getPlaces();
                var i, place;
                for(i=0; place = places[i];i++){
                    latLng = [place.geometry.location.lat(),place.geometry.location.lng()];
                    console.log(latLng);
                    }
                });
            //EINDE GOOGLE API PLACES
            this._actionButton = document.querySelector("#activiteittoevoegen");
            document.querySelector('[name="hond"]').value = this._applicationDbContext._dbData.profiles[this._activeUser].hondnaam;
         
            var self = this;
            this._actionButton.addEventListener("click",function(ev){
                ev.preventDefault();
                var actionGebruikerId = self._applicationDbContext._dbData.activeuser.id;
                var actionId = Utils.guid();
                var actionActiviteit = document.querySelector('[name="activiteit"]').value;
                var actionHond = document.querySelector('[name="hond"]').value;
                var actionStraat = document.querySelector('[name="locatie"]').value;
                var actionNummer = document.querySelector('[name="nummer"]').value;
                var actionStartDatum = document.querySelector('[name="startdatum"]').value;
                var actionStartUur = document.querySelector('[name="startuur"]').value;
                var actionStopDatum = document.querySelector('[name="stopdatum"]').value;
                var actionStopUur = document.querySelector('[name="stopuur"]').value;
                var actionHerhaling = document.querySelector('[name="herhaling"]').value;
                
                var lat = latLng[0];
                var lng = latLng[1];
                if(actionHond != null && actionHond !=""){
                    var result = self._applicationDbContext.addActivity(actionGebruikerId,actionId,actionActiviteit,actionHond,actionStraat,actionNummer,actionStartDatum,actionStartUur,actionStopDatum,actionStopUur,actionHerhaling,lat,lng);
                    if(result != null){
                        console.log("toegevoegd");
                        window.location = "/_pages/browse.html";
                    }else{
                        document.querySelector(".placeholderErrorMessage").innerHTML = "Gelieve alle waardes correct in te vullen";
                        console.log("fout");
                    }    
                }else{
                    document.querySelector('[name="hond"]').style.border = "2px solid red";
                    document.querySelector('[name="hond"').placeholder ="U moet een hond toevoegen";
                }
                
            });   
        },

        "getActivities":function(){
            
            //alle activiteiten ophalen;

            GMap.init();
            var browseList = document.querySelector(".browseList");
            var activiteit = this._applicationDbContext._dbData.activiteiten;
            var latLng = [];
            var html="";
            console.log(activiteit);
            for(var i=0; i<activiteit.length;i++){
                    //check of er verlopen activiteiten zijn
                     var today = new Date();
                            var dag = today.getDate();
                            var maand = today.getMonth()+1;
                            var jaar = today.getFullYear();
                            var uur = today.getHours();
                            var minuten = today.getMinutes();
                            var activiteitVerlopen =false;

                            var activiteitStopDag = activiteit[i].stopDatum.split("-")[2];
                            var activiteitStopMaand = activiteit[i].stopDatum.split("-")[1];
                            var activiteitStopJaar = activiteit[i].stopDatum.split("-")[0];

                            var activiteitStopUur = activiteit[i].stopUur.split(":")[0];
                            var activiteitStopMinuten = activiteit[i].stopUur.split(":")[1];
                            //if(activiteit.gebruikerId == this._applicationDbContext._dbData.activeuser.id){
                                //checken of het expired is
                                var activiteitVerlopen = false;
                                if(activiteitStopJaar < jaar){
                                    activiteitVerlopen = true;
                                }
                                
                                else if(activiteitStopJaar==jaar){
                                    console.log('!jaar');

                                    if(activiteitStopMaand < maand){
                                        activiteitVerlopen = true;  
                                    }
                                    
                                    else if(activiteitStopMaand == maand){
                                        console.log('!maand');
                                        if(activiteitStopDag < dag){
                                            activiteitVerlopen = true;
                                        }
                                        
                                        else if(activiteitStopDag == dag){
                                            console.log('!dag');
                                            if(activiteitStopUur < uur){
                                                activiteitVerlopen = true;
                                            }
                                            
                                            else if(activiteitStopUur == uur){
                                                console.log('!uur')
                                                if(activiteitStopMinuten <= minuten){
                                                    activiteitVerlopen = true;
                                                }
                                                
                                                else{
                                                    console.log("!minuut");
                                                    activiteitVerlopen = false;
                                                }
                                            }
                                        }
                                    }
                                    
                                }
                                if(activiteitVerlopen == true){
                                    //verwijder uit browse
                                    this._applicationDbContext._dbData.activiteiten.splice(i,1);
                                    this._applicationDbContext.save();
                                }
                        //marker GeoLocation maken
                        latLng[i] = [activiteit[i].lat,activiteit[i].lng];
                        console.log(latLng[i])  ;
                        var browseLocaties = GMap.addMarkerGeoLocation(latLng[i]);
                        

                            //als activegebruikerId = gebruikerID van de actie (degine die het gepost heeft)
                            //veranderd de style
                            //er wordt een id waarde toegekent aan de button en activiteit -> bij het klikken kan 
                            //dan makkelijk gezien worden bij welke activiteit welke button hoord. 
                            //zie addOrDeleteActivity();
                            if(activiteit[i].gebruikerId == this._applicationDbContext._dbData.activeuser.id){
                                html += '<li class="activity"  id="'+activiteit[i].id+'" style="background-color: #345f89; color:white;">';
                                html += '<button class="btn_X" id="'+activiteit[i].gebruikerId+'"><i class="fa fa-trash fa-lg" aria-hidden="true" style="color: white"; ></i></button>';    
                            }
                            else{
                                html += '<li class="activity"  id="'+activiteit[i].id+'">';
                                html +='<button class="btn_X" id="'+activiteit[i].gebruikerId+'"><i class="fa fa-floppy-o fa-lg" aria-hidden="true" ></i></button>';    
                            }
                            
                            html += '<ul class="info_dtl">';
                            html += '<li><span>'+activiteit[i].status+'</span></li>';
                            html += '<li>Van: '+activiteit[i].startDatum+" "+activiteit[i].startUur+'</li>';
                            html += '<li>Tot: '+activiteit[i].stopDatum+" "+activiteit[i].stopUur+'</li>';
                           // html += '</ul>';
                           // html += '<ul class="info_user">';
                            html += '<li>Door: '+activiteit[i].gebruikerNaam+'</li>';
                            html += '<li>Hond: '+activiteit[i].gebruikerHond+' '+activiteit[i].gebruikerRas+'</li>'
                            html += '<li>Locatie: '+activiteit[i].locatie+'</li>';
                            html += '</ul>';
                            html += '</li>';
                            browseList.innerHTML = html;
                }
            GMap.markerClick(browseLocaties);
            console.log(GMap._geoLocationMarker);
            $(".browseList").css("display","none");
            return activiteit;
        },

        "filterActivities":function(activiteiten){
            GMap.init();
            var latLng = [];
            var self = this;
            //wanneer er op de knop 'zoeken' is gedrukt, haal alle values op van de input fileds
            var browseList = document.querySelector(".browseList");       
            var activiteitFilter = document.querySelector('[name="activiteit"]').value;
            var locatieFilter = document.querySelector('[name="locatie"').value;
            var startUurFilter = document.querySelector('[name="startUur"]').value;
            var stopUurFilter = document.querySelector('[name="stopUur"]').value;
            var startDatumFilter = document.querySelectorAll('[name="startDatum"]').value;
            var stopDatumFilter = document.querySelectorAll('[name="stopDatum"]').value;
            var html = "";
            browseList.innerHTML="";

            var arrFilter = ["","","","","",""];
            //check op wat gefilterd moet worden
            if(activiteitFilter!=null&&activiteitFilter!=undefined){
                arrFilter[0]=activiteitFilter;
            }
            for(var i=0; i<$('input').length;i++){
                if($("input")[i]!=null&&$("input")[i]!=undefined&&$("input")[i]!=""){
                    arrFilter[i+1]=$("input")[i].value;
                }
            }
            //de filter array is gemaakt;
            //doorloop alle waardes waar ze niet leeg zijn
            for(var i=0; i<activiteiten.length;i++){
                //**filter op activiteit**
                if(arrFilter[0]!=""){
                    if(arrFilter[0]==activiteiten[i].status){
                        latLng[i]=[activiteiten[i].lat,activiteiten[i].lng];
                        var browseLocaties = GMap.addMarkerGeoLocation(latLng[i]);
                        GMap.markerClick(browseLocaties);
                        filterList(activiteiten[i]);
                    }
                }
                //***filter op locatie**
                if(arrFilter[1]!=""){
                    if(arrFilter[1]==activiteiten[i].locatie){
                        latLng[i]=[activiteiten[i].lat,activiteiten[i].lng];
                        var browseLocaties = GMap.addMarkerGeoLocation(latLng[i]);
                        GMap.markerClick(browseLocaties);
                        filterList(activiteiten[i]);
                    }
                }
                //**filter op startDatum**
                if(arrFilter[2]!=""){
                    if(arrFilter[2]==activiteiten[i].startDatum){
                        latLng[i]=[activiteiten[i].lat,activiteiten[i].lng];
                        var browseLocaties = GMap.addMarkerGeoLocation(latLng[i]);
                        GMap.markerClick(browseLocaties);
                        filterList(activiteiten[i]);
                    }
                }
                //filter op startUur
                if(arrFilter[3]!=""){
                    if(arrFilter[3]==activiteiten[i].startUur){
                        latLng[i]=[activiteiten[i].lat,activiteiten[i].lng];
                        var browseLocaties = GMap.addMarkerGeoLocation(latLng[i]);
                        GMap.markerClick(browseLocaties);
                        filterList(activiteiten[i]);
                    }
                }
                //filter op stopDatum
                if(arrFilter[4]!=""){
                    if(arrFilter[4]==activiteiten[i].stopDatum){
                        latLng[i]=[activiteiten[i].lat,activiteiten[i].lng];
                        var browseLocaties = GMap.addMarkerGeoLocation(latLng[i]);
                        GMap.markerClick(browseLocaties);
                        filterList(activiteiten[i]);
                    }
                }
                //filter op stopUur
                if(arrFilter[5]!=""){
                    if(arrFilter[5]==activiteiten[i].stopUur){
                        latLng[i]=[activiteiten[i].lat,activiteiten[i].lng];
                        var browseLocaties = GMap.addMarkerGeoLocation(latLng[i]);
                        GMap.markerClick(browseLocaties);
                        filterList(activiteiten[i]);
                        
                    }
                }
            }
            
            function filterList(activiteit){
                var html = "";
                if(activiteit.gebruikerId == self._applicationDbContext._dbData.activeuser.id){
                    html += '<li class="activity"  id="'+activiteit.id+'" style="background-color: #345f89; color:white;">';
                    html += '<button class="btn_X" id="'+activiteit.gebruikerId+'"><i class="fa fa-trash fa-lg" aria-hidden="true" style="color: white"; ></i></button>';    
                }
                else{
                    html += '<li class="activity"  id="'+activiteit.id+'">';
                    html +='<button class="btn_X" id="'+activiteit.gebruikerId+'"><i class="fa fa-floppy-o fa-lg" aria-hidden="true" ></i></button>';    
                }
                html += '<ul class="info_dtl">';
                html += '<li><span>'+activiteit.status+'</span></li>';
                html += '<li>Van: '+activiteit.startDatum+" "+activiteit.startUur+'</li>';
                html += '<li>Tot: '+activiteit.stopDatum+" "+activiteit.stopUur+'</li>';
                html += '<li>Door: '+activiteit.gebruikerNaam+'</li>';
                html += '<li>Hond: '+activiteit.gebruikerHond+' '+activiteit.gebruikerRas+'</li>'
                html += '<li>Locatie: '+activiteit.locatie+'</li>';
                html += '</ul>';
                html += '</li>';
                browseList.innerHTML += html;
            }
            /*var html="";
                GMap.init();
                console.log("change");
                //doorloop alle activiteiten
                //toon enkel digene waar de activiteit.status == filter.value
                for(var i=0; i<activiteit.length;i++){
                    if(activiteit[i].status == filterValue.value || filterValue.value == ""){
                        //marker GeoLocation maken
                        latLng[i] = [activiteit[i].lat,activiteit[i].lng];
                        console.log(latLng[i])  ;
                        GMap.addMarkerGeoLocation(latLng[i]);
                        
                            if(activiteit[i].gebruikerId == self._applicationDbContext._dbData.activeuser.id){
                                html += '<li class="activity"  id="'+activiteit[i].id+'" style="background-color: #345f89; color:white;">';
                                html += '<button class="btn_X" id="'+activiteit[i].gebruikerId+'"><i class="fa fa-trash fa-lg" aria-hidden="true" style="color: white"; ></i></button>';    
                            }else{
                                html += '<li class="activity"  id="'+activiteit[i].id+'">';
                                html +='<button class="btn_X" id="'+activiteit[i].gebruikerId+'"><i class="fa fa-floppy-o fa-lg" aria-hidden="true" ></i></button>';    
                            }
                            html += '<ul class="info_dtl">';
                            html += '<li><span>'+activiteit[i].status+'</span></li>';
                            html += '<li>Van: '+activiteit[i].startDatum+" "+activiteit[i].startUur+'</li>';
                            html += '<li>Tot: '+activiteit[i].stopDatum+" "+activiteit[i].stopUur+'</li>';
                           // html += '</ul>';
                           // html += '<ul class="info_user">';
                            html += '<li>Door: '+activiteit[i].gebruikerNaam+'</li>';
                            html += '<li>Hond: '+activiteit[i].gebruikerHond+' '+activiteit[i].gebruikerRas+'</li>'
                            html += '<li>Locatie: '+activiteit[i].locatie+'</li>';
                            html += '</ul>';
                            html += '</li>';
                            browseList.innerHTML = html;
                    }
                }*/

        },


        "addOrDeleteActivities":function(){
            var saved = false;
            var saved2 = false;
            var self= this;
            //doorloop alle aanwezige buttons, en voeg er een eventlistener aan toe
            var activiteitBtn = document.querySelectorAll(".btn_X");
            for(var i=0; i<this._applicationDbContext._dbData.activiteiten.length;i++){
                activiteitBtn[i].addEventListener("click",function(ev){
                    //this["id"] geeft de id  weer van de gebruikers post waar op geklikt is
                    var gebruikerId = this["id"];
                    //als activiteitId == activeuserId => verwijderen
                    if(gebruikerId == self._applicationDbContext._dbData.activeuser.id){
                        //ga door alle activiteiten;
                        for(var j=0; j<self._applicationDbContext._dbData.activiteiten.length;j++){
                            //als activiteitId == id -> delete activiteit
                            var activiteitId = this.parentElement["id"];
                            console.log(self._applicationDbContext._dbData.activiteiten[j]);
                            if(activiteitId==self._applicationDbContext._dbData.activiteiten[j].id){
                                //delete op plaats j
                                self._applicationDbContext._dbData.activiteiten.splice(j,1);
                                //delete in opgeslagen activiteiten
                                for(var x=0;x<self._applicationDbContext._dbData.profiles.length;x++){
                                    if(self._applicationDbContext._dbData.profiles[x].id == self._applicationDbContext._dbData.activeuser.id){
                                        for(var y=0;y<self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten.length;y++)
                                        {
                                            if(self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten[y].id == activiteitId){
                                                self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten.splice(y,1);        
                                            }
                                        }
                                        
                                    }
                                    
                                }
                                
                                self._applicationDbContext.save();
                                this.parentElement.remove();
                            }
                        }
                    }
                    //als activiteitId != activeuserId => opslaan
                    else if(gebruikerId != self._applicationDbContext._dbData.activeuser.id){
                        
                        this.innerHTML = '<i class="fa fa-check-circle fa-lg" aria-hidden="true"></i>';
                        
                        //ga door alle activiteiten;
                        for(var j=0; j<self._applicationDbContext._dbData.activiteiten.length;j++){
                            //als activiteitId meegegeven in de html == id van de activiteit in de database -> save activiteit in myactivities
                            //de activiteitId wordt via het li element meegegeven dat de parent van de button is
                            var activiteitId = this.parentElement["id"];
                            if(activiteitId==self._applicationDbContext._dbData.activiteiten[j].id){
                                
                                //doorloop alle profielen
                                for(var k=0; k<self._applicationDbContext._dbData.profiles.length;k++){
                                //selecteer mijn profiel
                                if(self._applicationDbContext._dbData.profiles[k].id == self._applicationDbContext._dbData.activeuser.id){
                                    //voeg aan de activiteit de Id van de gebruiker die de activiteit GEACCEPTEERD heeft
                                    self._applicationDbContext._dbData.activiteiten[j].acceptorId = self._applicationDbContext._dbData.activeuser.id;
                                    
                                    
                
                


                                    //sla de activiteit op in profile[x].opgeslagenActiviteiten
                                    //dit is een array -> de length wordt opgevragen, deze geeft bv 5 weer
                                    //aangezien array 0based telt, heeft het 5de element , index 4 ([4])
                                    //DUS: savedActivities[nieuweIndex] zal altijd op de laatste index +1 de waarde stoppen;
                                    var savedActivities = self._applicationDbContext._dbData.profiles[k].opgeslagenActiviteiten;
                                    //var nieuweIndex = savedActivities.length;
                                    savedActivities.push(self._applicationDbContext._dbData.activiteiten[j]);
                                    self._applicationDbContext.save();
                                    saved = true;
                                    }
                                }  
                            }
                        }
                    
                        //voeg dit ook toe aan de activiteit van de CREATOR in zijn opgeslagen activiteiten
                        //doorloop alle activiteiten
                        //als de profielId == creatorId =>
                        //doorloop al zijn opgeslagen activiteiten
                        //als opgeslagenId == activiteitenId =>
                        //verander acceptorId
                        if(saved == true){
                        //zoek een profiel waar de  profiles[k].id== activiteiten.gebruikerId;
                            var clickedActiviteitId = this.parentElement["id"];
                            var profielen = self._applicationDbContext._dbData.profiles;
                            for(var k=0; k<profielen.length;k++){
                                var savedActivities = profielen[k].opgeslagenActiviteiten;
                                for(var x=0; x<savedActivities.length;x++){
                                    console.log(savedActivities[x].id);
                                    console.log(clickedActiviteitId);
                                    console.log("------------------");
                                    if(savedActivities[x].id == clickedActiviteitId){
                                        console.log("***WINNER***");
                                        console.log(savedActivities[x]);
                                        console.log(clickedActiviteitId);
                                        console.log("*************");
                                        savedActivities[x].acceptorId = self._applicationDbContext._dbData.activeuser.id;
                                        saved2 =true;
                                    }
                                }
                            }
                        }
                    }
                for(var j=0; j<self._applicationDbContext._dbData.activiteiten.length;j++){
                    //als activiteitId == id -> delete activiteit
                    var activiteitId = this.parentElement["id"];
                    console.log(self._applicationDbContext._dbData.activiteiten[j]);
                    if(activiteitId==self._applicationDbContext._dbData.activiteiten[j].id){
                        //delete op plaats j
                        self._applicationDbContext._dbData.activiteiten.splice(j,1);
                        self._applicationDbContext.save();
                        }
                }

                //na verwijderen of opslaan -> weer alle activiteiten laden en 
                //checken of er wordt geklikt op save/delete

                self.addOrDeleteActivities();
                });
            }
        },

        "getSavedActivities":function(){
            console.log(this._applicationDbContext._dbData.profiles);
            var arraySavedActivities = [];

            var browseList = document.querySelector(".savedActivitiesList");
            //alle opgeslagen activiteiten van de user ophalen;
            var profielen = this._applicationDbContext._dbData.profiles;

            //checken data uit mijn profiel halen
            for(var i=0; i<profielen.length;i++){
                if(profielen[i].id == this._applicationDbContext._dbData.activeuser.id){
                    //profiel gevonden -> alle opgeslagen activiteiten doorlopen
                    var html = "";
                    for(var j=0; j<profielen[i].opgeslagenActiviteiten.length;j++){
                       var activiteit = profielen[i].opgeslagenActiviteiten[j];
                       
                       var today = new Date();
                       var dag = today.getDate();
                       var maand = today.getMonth()+1;
                       var jaar = today.getFullYear();
                       var uur = today.getHours();
                       var minuten = today.getMinutes();

                       var activiteitStopDag = activiteit.stopDatum.split("-")[2];
                       var activiteitStopMaand = activiteit.stopDatum.split("-")[1];
                       var activiteitStopJaar = activiteit.stopDatum.split("-")[0];
                       var activiteitStopUur = activiteit.stopUur.split(":")[0];
                       var activiteitStopMinuten = activiteit.stopUur.split(":")[1];
                       //checken of het expired is
                                console.log("test");
                                var activiteitVerlopen = false;
                                if(activiteitStopJaar < jaar){
                                    activiteitVerlopen = true;
                                }
                                
                                else if(activiteitStopJaar==jaar){
                                    console.log('!jaar');

                                    if(activiteitStopMaand < maand){
                                        activiteitVerlopen = true;  
                                    }
                                    
                                    else if(activiteitStopMaand == maand){
                                        console.log('!maand');
                                        if(activiteitStopDag < dag){
                                            activiteitVerlopen = true;
                                        }
                                        
                                        else if(activiteitStopDag == dag){
                                            console.log('!dag');
                                            if(activiteitStopUur < uur){
                                                activiteitVerlopen = true;
                                            }
                                            
                                            else if(activiteitStopUur == uur){
                                                console.log('!uur')
                                                console.log(activiteitStopMinuten);
                                                if(activiteitStopMinuten <= minuten){
                                                    activiteitVerlopen = true;
                                                }
                                                else{
                                                    console.log("!minuut");
                                                    activiteitVerlopen = false;
                                                }
                                            }
                                        }
                                    }
                                    
                                }
                                console.log(activiteitVerlopen);
                                if(activiteitVerlopen == true){
                                    html += '<li class="activity"  id="'+activiteit.id+'" style="background-color: rgba(219, 200, 170,0.05); color: rgb(219, 200, 170)">';
                                    html += '<button class="btn_X" id="'+activiteit.gebruikerId+'"><i class="fa fa-check fa-lg" aria-hidden="true" style="color: rgb(219, 200, 170)"></i></button>';
                                }

                        //als activegebruikerId = gebruikerID van de actie (degine die het gepost heeft)
                            //veranderd de style
                            //er wordt een id waarde toegekent aan de button en activiteit -> bij het klikken kan 
                            //dan makkelijk gezien worden bij welke activiteit welke button hoord. 
                            //zie addOrDeleteActivity();
                            if(activiteit.gebruikerId == this._applicationDbContext._dbData.activeuser.id){

                                if(activiteit.acceptorId != "CANCELED" && activiteit.acceptorId != null && activiteit.acceptorId!="" && activiteitVerlopen ==false){
                                    html += '<li class="activity"  id="'+activiteit.id+'" style="background-color: rgba(255,255,0,0.05); color: green;">';
                                    html += '<button class="btn_X" id="'+activiteit.gebruikerId+'" syle="background-color: rgba(255,255,0,0.5);"><i class="fa fa-trash fa-lg" aria-hidden="true" style="color: green;"></i></button>';    
                                }


                                //als het acceptorId = "CANCELLED" -> li gele actergrond kleur
                                else if(activiteit.acceptorId == "CANCELED" && activiteitVerlopen==false){
                                    html += '<li class="activity"  id="'+activiteit.id+'" style="background-color: rgba(255,157,0,0.05); color: rgba(255,157,0,1);">';
                                    html += '<button class="btn_X" id="'+activiteit.gebruikerId+'" syle="background-color: #f7e13d;"><i class="fa fa-trash fa-lg" aria-hidden="true" style="color: rgba(255,157,0,1);"></i></button>';    
                                    
                                }

                                else if(activiteitVerlopen == false){
                                    html += '<li class="activity"  id="'+activiteit.id+'" style="background-color: #345F89; color: white;">';
                                    html += '<button class="btn_X" id="'+activiteit.gebruikerId+'" syle="background-color: #345F89;"><i class="fa fa-trash fa-lg" aria-hidden="true" style="color: white;"></i></button>';    

                                }
                                
                            }
                            
                                    
                            else{
                                
                                    
                                if(activiteit.DeletedAt == "DELETED" && activiteitVerlopen == false){
                                    html += '<li class="activity"  id="'+activiteit.id+'" style="background-color: rgba(255,0,0,0.05); color: red">';
                                    html += '<button class="btn_X" id="'+activiteit.gebruikerId+'"><i class="fa fa-trash fa-lg" aria-hidden="true" style="color: red"></i></button>';    

                                }
                                else if(activiteitVerlopen != true){
                                    html += '<li class="activity"  id="'+activiteit.id+'">';
                                    html += '<button class="btn_X" id="'+activiteit.gebruikerId+'"><i class="fa fa-times fa-lg" aria-hidden="true" ></i></button>';
                                }
                            }
                            
                            html += '<ul class="info_dtl">';
                            html += '<li><span>'+activiteit.status+'</span></li>';
                            html += '<li>Van: '+activiteit.startDatum+" "+activiteit.startUur+'</li>';
                            html += '<li>Tot: '+activiteit.stopDatum+" "+activiteit.stopUur+'</li>';
                           // html += '</ul>';
                           // html += '<ul class="info_user">';
                            html += '<li>Door: '+activiteit.gebruikerNaam+'</li>';
                            html += '<li>Hond: '+activiteit.gebruikerHond+' '+activiteit.gebruikerRas+'</li>'
                            html += '<li>Locatie: '+activiteit.locatie+'</li>';
                            //de gebruikersnaam van de persoon die de activiteit geaccepteerdheeft
                            //de acceptorId werd meegestuurd -> daarmee gebruikersnaam opvragen
                          
                            
                            
                            
                                for(var k=0; k<this._applicationDbContext._dbData.profiles.length;k++){
                                    if(this._applicationDbContext._dbData.profiles[k].id==activiteit.acceptorId){
                                        html+= '<li>Geaccepteerd door: '+this._applicationDbContext._dbData.profiles[k].gebruikersnaam+'</li>';
                                    }

                                }
                            
                            html += '</ul>';
                            if(activiteit.acceptorId == "CANCELED"){
                                html+= "<p id='warning'><strong>Info:De gebruiker heeft de activiteit geanulleerd, wij hebben uw activiteit weer zichtbaar gemaakt voor andere gebruikers.</strong></p>"
                            }
                            if(activiteit.DeletedAt == "DELETED"){
                                html+= "<p id='warning'><strong>Info:De gebruiker heeft de activiteit verwijderd, deze activiteit is niet meer beschikbaar.</strong></p>"
                            }
                            if(activiteitVerlopen == true){
                                html+="<p id='warning' style='color: rgb(219, 200, 170);'><strong>Info: De activiteit is verlopen</strong></p>"
                            }
                            html += '</li>';
                            browseList.innerHTML = html;
                            arraySavedActivities[j] = activiteit;
                    }
                }
            }
        return arraySavedActivities;
        },

        "deleteSavedActivities":function(arraySavedActivities){
            var self = this;
            var btn_X = document.querySelectorAll(".btn_X");
            //doorloop alle delete buttons, voeg eventlistener click aan toe
            for(var i=0; i<btn_X.length;i++){
                btn_X[i].addEventListener("click",function(ev){
                    //this.["id"] = de id van de gebruiker die de post maakte;
                    var activiteitCreatorId = this["id"];
                    //this.parentElement["id"] = de id van de post;
                    var activiteitId = this.parentElement["id"];
                    //doorloop alle opgeslagen activiteiten in de local storage
                    //als opgeslagenactiviteit.id == activiteitId
                    //als er geen acceptor id aanwezig is mag deze post gedelete worden uit mijnopgeslagen activiteiten en browse
                    //als er een acceptor id aanwezig is -> check of het de active user is of iemand anders
                    //acceptor id == iemand anders => "CANCELED"
                    //creatorId == active user => "DELETED"
                    //als acceptor id == "CANCELED" -> verander achtergrondkleur naar geel bij de creator's opgeslagen activiteiten + voet activiteit terug toe aan browse
                    //als creatorId == "DELETED" -> varander achtergrondkleur naar rood bij de acceptor's opgeslagen activiteiten
                    for(var j=0; j<arraySavedActivities.length;j++){
                        if(arraySavedActivities[j].id == activiteitId){
                            //vanaf hier weten we op welke activiteit er geklikt is.
                            //check of de post verlopen is
                            var today = new Date();
                            var dag = today.getDate();
                            var maand = today.getMonth()+1;
                            var jaar = today.getFullYear();
                            var uur = today.getHours();
                            var minuten = today.getMinutes();
                            var activiteitVerlopen =false;

                            var activiteitStopDag = arraySavedActivities[j].stopDatum.split("-")[2];
                            var activiteitStopMaand = arraySavedActivities[j].stopDatum.split("-")[1];
                            var activiteitStopJaar = arraySavedActivities[j].stopDatum.split("-")[0];

                            var activiteitStopUur = arraySavedActivities[j].stopUur.split(":")[0];
                            var activiteitStopMinuten = arraySavedActivities[j].stopUur.split(":")[1];
                            //if(activiteit.gebruikerId == this._applicationDbContext._dbData.activeuser.id){
                                //checken of het expired is
                                var activiteitVerlopen = false;
                                if(activiteitStopJaar < jaar){
                                    activiteitVerlopen = true;
                                }
                                
                                else if(activiteitStopJaar==jaar){
                                    console.log('!jaar');

                                    if(activiteitStopMaand < maand){
                                        activiteitVerlopen = true;  
                                    }
                                    
                                    else if(activiteitStopMaand == maand){
                                        console.log('!maand');
                                        if(activiteitStopDag < dag){
                                            activiteitVerlopen = true;
                                        }
                                        
                                        else if(activiteitStopDag == dag){
                                            console.log('!dag');
                                            if(activiteitStopUur < uur){
                                                activiteitVerlopen = true;
                                            }
                                            
                                            else if(activiteitStopUur == uur){
                                                console.log('!uur')
                                                if(activiteitStopMinuten <= minuten){
                                                    activiteitVerlopen = true;
                                                }
                                                
                                                else{
                                                    console.log("!minuut");
                                                    activiteitVerlopen = false;
                                                }
                                            }
                                        }
                                    }
                                    
                                }
                                console.log(activiteitVerlopen);


                            //check of er een acceptor id is of het is verlopen.
                            if(arraySavedActivities[j].acceptorId == "" || arraySavedActivities[j].acceptorId == null || arraySavedActivities[j].acceptorId == "CANCELED" || activiteitVerlopen ==true){
                                //als er geen acceptorID is => delete uit mijnopgeslagen activiteit
                                for(var x=0; x<self._applicationDbContext._dbData.profiles.length; x++){
                                    if(self._applicationDbContext._dbData.profiles[x].id == self._applicationDbContext._dbData.activeuser.id){
                                        for(var y=0;y<self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten.length;y++){
                                            if(self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten[y].id == activiteitId){
                                                self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten.splice(y,1);
                                                console.log("deleted uit opgeslagenActiviteiten");
                                                self._applicationDbContext.save();
                                                this.parentElement.remove();
                                                console.log(activiteitStopDag);
                                            }
                                        }
                                    }
                                }
                                //doorloop alle activiteiten en delete deze activiteit uit browse;
                                for(var x=0; x<self._applicationDbContext._dbData.activiteiten.length;x++){
                                    if(self._applicationDbContext._dbData.activiteiten[x].id == activiteitId){
                                        self._applicationDbContext._dbData.activiteiten.splice(x,1);
                                        console.log("deleted uit browse");
                                        self._applicationDbContext.save();
                                    }
                                }
                            }
                            //als er een acceptorId aanwezig is
                            else if((arraySavedActivities[j].acceptorId != "" || arraySavedActivities[j].acceptorId != null)&&activiteitVerlopen==false){
                                //check of de acceptorId == activeuserId
                                //M.A.W. check of ik de activiteit heb geaccepteerd
                                //-> ik annuleer de activiteit
                                if(arraySavedActivities[j].acceptorId == self._applicationDbContext._dbData.activeuser.id){
                                    console.log("geaccepteerdDoorMij");
                                    for(var x=0; x<self._applicationDbContext._dbData.profiles.length;x++){
                                        if(self._applicationDbContext._dbData.profiles[x].id == self._applicationDbContext._dbData.activeuser.id){
                                            console.log("profiel gevonden");
                                            for(var y=0; y<self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten.length;y++){
                                                if(self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten[y].id == activiteitId){
                                                                                                        
                                                    //ga door de profielen en zoek naar de crator van de activiteit
                                                    for(var a=0; a<self._applicationDbContext._dbData.profiles.length;a++){
                                                        if(self._applicationDbContext._dbData.profiles[a].id == self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten[y].gebruikerId){
                                                            console.log(a);
                                                            //profiel Creator gevonden -> ga door zijn opgeslagenActiviteiten
                                                            console.log("creator gevonden");
                                                            //zoeken tussen opgeslagenActiviteiten
                                                            for(var b=0; b<self._applicationDbContext._dbData.profiles[a].opgeslagenActiviteiten.length;b++){
                                                                //zoek waar opgeslagenActiviteiten.id = activiteitId
                                                                if(self._applicationDbContext._dbData.profiles[a].opgeslagenActiviteiten[b].id == activiteitId){
                                                                    //gevondend -> zet de acceptorId van de activiteit van de creator op CANCELED
                                                                    self._applicationDbContext._dbData.profiles[a].opgeslagenActiviteiten[b].acceptorId = "CANCELED";
                                                                    //zet de activiteit terug in de browse pagina
                                                                    self._applicationDbContext._dbData.activiteiten.push(self._applicationDbContext._dbData.profiles[a].opgeslagenActiviteiten[b]);
                                                                    console.log(self._applicationDbContext._dbData.profiles[a].opgeslagenActiviteiten[b]);
                                                                    self._applicationDbContext.save();
                                                                    saved = true;

                                                                }
                                                            }
                                                        }
                                                    }

                                                    
                                                    //verwijder ze uit zijn opgeslagen activiteiten en delete het element
                                                    
                                                        self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten.splice(y,1);
                                                        self._applicationDbContext.save();
                                                        this.parentElement.remove();
                                                    
                                                    
                                                    //


                                                    console.log(self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten[y]);
                                                }
                                            }
                                        }
                                    }
                                    //zet de activiteit terug op de browse pagina

                                }
                                //zo niet-> iemand anders heeft mijn activiteit geaccepteerd;
                                //-> ik delete mijn activiteit
                                //-> verander kleur naar rode achtergrond bij de persoon die de activiteit geaccepteerd heeft

                                else{
                                    console.log("geaccepteerdDoorIemandAnders");
                                    //doorloop alle profielen
                                     for(var x=0; x<self._applicationDbContext._dbData.profiles.length;x++){
                                        //mijn profiel gevonden
                                        if(self._applicationDbContext._dbData.profiles[x].id == self._applicationDbContext._dbData.activeuser.id){
                                            console.log("profiel gevonden");
                                            //doorloop mijn opgeslagen activiteiten
                                            for(var y=0; y<self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten.length;y++){
                                                //mijn activiteit gevonden
                                                if(self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten[y].id == activiteitId){
                                                    //delete mijn activiteit


                                                    //vind acceptorId
                                                    //ga door de profielen en zoek naar de acceptor van de activiteit
                                                    for(var a=0; a<self._applicationDbContext._dbData.profiles.length;a++){
                                                        if(self._applicationDbContext._dbData.profiles[a].id == self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten[y].acceptorId){
                                                            console.log(a);
                                                            //profiel Creator gevonden -> ga door zijn opgeslagenActiviteiten
                                                            console.log("acceptor gevonden");
                                                            //zoeken tussen opgeslagenActiviteiten
                                                            for(var b=0; b<self._applicationDbContext._dbData.profiles[a].opgeslagenActiviteiten.length;b++){
                                                                //zoek waar opgeslagenActiviteiten.id = activiteitId
                                                                if(self._applicationDbContext._dbData.profiles[a].opgeslagenActiviteiten[b].id == activiteitId){
                                                                    //activiteit in de opgeslagenactiviteiten van de acceptor gevonden
                                                                    //-> zet creatorId (gebruikerId) op DELETED
                                                                    self._applicationDbContext._dbData.profiles[a].opgeslagenActiviteiten[b].DeletedAt = "DELETED";
                                                                    self._applicationDbContext.save();
                                                                    deleted = true;
                                                                    
                                                                }
                                                            }
                                                        }
                                                    }

                                                    //de localstorage van de acceptor is aangepast ->
                                                    //deleten van de activiteit in de localstorage van de creator
                                                    
                                                        self._applicationDbContext._dbData.profiles[x].opgeslagenActiviteiten.splice(y,1);
                                                        self._applicationDbContext.save();
                                                        this.parentElement.remove();

                                                }
                                            }
                                        }
                                    }                                                    
                                }
                            }
                        }
                    }
                    
                
                self.deleteSavedActivities(self._savedActivities);
            });

        }
    },
    };

    App.init();
});

