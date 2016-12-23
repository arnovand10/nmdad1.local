/*
ApplicationDbContext
--------------------
1) Database transactions: CRUD operations
2) Cache for loaded content / data
*/
var applicationDbContext = {
    "init": function(strConnection) {
        this._strConnection = strConnection; // Connection String to the key in the localstorage
        this._dbData = {
            "info": {
                "title":"WAF",
                "description":"Walk a friend",
                "version":"1.0.",
                "modified":"2016-11-25",
                "author":"ArnoVanDenBossche"
            },
            "activeuser": null,
            
            "profiles":[
                {
                    "id":3,
                    "gebruikersnaam" : "BartSmith",
                    "wachtwoord":"MijnWachtWoord",
                    "email":"BartSmith@hotmail.com",
                    "profielfoto":"http://loremflickr.com/320/240/dog",
                    "hondnaam" : "Blacky",
                    "hondras" : "Teckle",
                    "locatie": "geomap",
                    "status": "Zoekt oppas",
                    "opgeslagenActiviteiten":[],
                },
                {
                
                    "id":1,
                    "gebruikersnaam" : "Jandeman",
                    "wachtwoord":"MijnWachtWoord",
                    "email":"Jandeman@gmail.com",
                    "profielfoto":"http://loremflickr.com/320/240/dog?random="+1,
                    "hondnaam" : "Woefke",
                    "hondras" : "Husky",
                    "locatie": "geomap",
                    "status": "Zoekt uitlater",
                    "opgeslagenActiviteiten":[],
                },
                {
                    "id":2,
                    "gebruikersnaam" : "Jolien23",
                    "wachtwoord":"MijnWachtWoord",
                    "email":"Jolien23@gmail.com",
                    "profielfoto":"http://loremflickr.com/320/240/dog?random="+1,
                    "hondnaam" : "Sloef",
                    "hondras" : "Duitseherder",
                    "locatie": "geomap",
                    "status": "Zoekt ontmoeting",
                    "opgeslagenActiviteiten":[],
                },

            ],

            "activiteiten":[
                {
                    "id":3,
                    "status":"oppassen",
                    "locatie":"Korenmarkt",
                    "lat":"51.054300",
                    "lng":"3.721736",

                    "gebruikerId":3,
                    "gebruikerNaam":"BartSmith",
                    "gebruikerHond":"Blacky",
                    "gebruikerRas":"Teckle",

                    "startDatum":"2017-1-8",
                    "startUur":"15:20",
                    "stopDatum":"2017-1-12",
                    "stopUur":"16:20",
                    "herhaling":"geen",

                    "acceptorId":"",

                    "CreatedAt":"2016-12-15",
                    "DeletedAt":"",


                },
                {
                    "id":1,
                    "status":"uitlaten",
                    "locatie":"Gravesteen",
                    "lat": "51.057529",
                    "lng":"3.720737",

                    "gebruikerId":1,
                    "gebruikerNaam":"Jandeman",
                    "gebruikerHond":"Woefke",
                    "gebruikerRas":"Husky",

                    "startDatum":"2017-1-10",
                    "startUur":"16:00",
                    "stopDatum":"2017-1-10",
                    "stopUur":"18:00",
                    "herhaling":"geen",

                    "acceptorId":"",

                    "CreatedAt":"2016-12-15",
                    "DeletedAt":"",


                },
                {
                    "id":2,
                    "status":"ontmoeten",
                    "locatie":"Gravesteen",
                    "lat": "51.057529",
                    "lng":"3.720737",

                    "gebruikerId":2,
                    "gebruikerNaam":"Jolien23",
                    "gebruikerHond":"Sloef",
                    "gebruikerRas":"Duitseherder",

                    "startDatum":"2017-1-13",
                    "startUur":"16:00",
                    "stopDatum":"2017-1-13",
                    "stopUur":"17:00",
                    "herhaling":"geen",

                    "acceptorId":"",

                    "CreatedAt":"2016-12-15",
                    "DeletedAt":"",


                },
            ],

            "timetable":[],
            "settings":[],
        }; // The data as value of the previous key aka connection string
        // Get the sored data with the key. If the data is not present in the localstorage --> store the previous data from the variable _dbData into the localstorage via the connection string or namespace
        if(Utils.store(this._strConnection) != null) {
            this._dbData = Utils.store(this._strConnection);
        } else {
            Utils.store(this._strConnection, this._dbData);
        }
    },
    "getProfiles": function() {
        var profiles = this._dbData.profiles;
        if(profiles == null || (profiles != null && profiles.length == 0)) {
            console.log("profiles zijn leeg");
            return null;
        }
        return profiles;
    },
    "getProfilesById": function(id) {
        var index = this.findProfileIndexById(id);
        if(index == -1) {
            return null;
        }
        return this._dbData.profiles[index];
    },
    "addProfile": function(profile) {
        if(profile != null && (profile.Id == undefined || this.getProfileById(profile.Id) == null)) {
            profile.id = Utils.guid();
            this._dbData.profiles.push(profile);
            this.save();
            console.log("toegevoegd");
            return profile;
        }
        return null;
    },
    "updateMyProfile":function(profile){
        var index = profile[0];
        var profielFoto = profile[1];
        //als er geen profielfoto is ingevult hij placeholder value krijgen.
        if(profielFoto==null || profielFoto == ""){
            profielFoto = "../css/img/dog-placeholder.jpg";
        }
        var profielStatus = profile[2];
        var profielLocatie = profile[3];
        var profielHondNaam = profile[4];
        var profielHondRas = profile[5];
        var profielEmail = profile[6];
        console.log(profile);
        if(index == -1){
            return false;
        }
        profile.UpdatedAt = new Date().getTime();
        this._dbData.profiles[index].profielfoto = profielFoto;
        this._dbData.profiles[index].status = profielStatus;
        this._dbData.profiles[index].locatie = profielLocatie;
        this._dbData.profiles[index].hondnaam = profielHondNaam;
        this._dbData.profiles[index].hondras = profielHondRas;
        this._dbData.profiles[index].email = profielEmail;
        this.save();
        return true;
    },

    "updateProfile": function(profile) {
        var index = this.findProfileIndexById(profile.Id);
        if(index == -1) {
            return false;
        }

        profile.UpdatedAt = new Date().getTime();
        this._dbData.profiles[index] = profile;
        this.save();
        return true;
    },
    "deleteProfile": function(id) {
        var index = this.findProfiletIndexById(id);
        if(index == -1) {
            return false;
        }
        this._dbData.profiles.splice(index, 1);
        this.save();
        return true;
    },
    "softDeleteProfile": function(id) {
        var index = this.findProfileIndexById(id);
        if(index == -1) {
            return false;
        }
        var profile =  this._dbData.profiles[index];
        profile.UpdatedAt = new Date().getTime();
        profile.DeletedAt = new Date().getTime();
        this._dbData.profiles[index] = profile;
        this.save();
        return true;
    },
    "softUnDeleteProfile": function(id) {
         var index = this.findProfileIndexById(id);
        if(index == -1) {
            return false;
        }
        var profile =  this._dbData.profiles[index];
        profile.UpdatedAt = new Date().getTime();
        profile.DeletedAt = null;
        this._dbData.profiles[index] = profile;
        this.save();
        return true;
    }, 
    "save": function() {
        Utils.store(this._strConnection, this._dbData); // Write the _dbData into the localstorage via the key
        return true; // Always true in modern webbrowsers
    },
    "findProfileIndexById": function(id) {
        var profile = this.getProfiles();
        if(profile == null) {
            return -1;
        }

        var match = false, i = 0, profiles = null;
        while(!match && i < profiles.length) {
            profiles = profiles[i];
            if(profiles.Id == id) {
                match = true;
            } else {
                i++;
            }
        }

        if(!match) {
            return -1;
        }
        return i;
    },
    "getProfileByUserName":function(userName){
        //Find the index of the profile by id
        var profiles = this.getProfiles();
        if(profiles == null){
            return null;
        }
        return _.find(profiles, function(profile){
            return profile.gebruikersnaam == userName;
        });
    },
    "setActiveUser":function(user){
        this._dbData.activeuser = user;
        this.save();
    },

    "addActivity":function(userId,actieId,actie,hondnaam,locatie,nr,startD,startU,stopD,stopU,repeat,_lat,_lng){
        if(userId != null &&  userId!="" && actieId != null && actieId != ""){
            if(actie !=null  && actie != "" && hondnaam != null && hondnaam != ""){
                if(locatie!=null  && locatie!="" && startD!=null && startD!=""){
                    if(startU !=null  && startU !="" && stopD !=null && stopD !=""){
                        if(stopU!=null  && stopU!="" && _lat!=null && _lat!="" && _lng!=null && _lng!=""){
                            //alles is ok => toevoegen in localstorage activiteiten.
                            var activiteit = new Activiteit();
                            activiteit.id = actieId;
                            activiteit.status = actie;
                            if(nr!=null && nr!=""){
                                activiteit.locatie = locatie+" "+nr;    
                            }else{
                                activiteit.locatie = locatie;
                            }
                            
                            
                            activiteit.gebruikerId = userId;
                            activiteit.gebruikerNaam = this._dbData.activeuser.gebruikersnaam;
                            activiteit.gebruikerHond = hondnaam;
                            activiteit.gebruikerRas = this._dbData.activeuser.hondras;

                            activiteit.startDatum = startD;
                            activiteit.startUur = startU;
                            activiteit.stopDatum = stopD;
                            activiteit.stopUur = stopU;
                            activiteit.acceptorId = "";
                            activiteit.lat = _lat;
                            activiteit.lng = _lng;
                            if(repeat!=null && repeat !=""){
                                activiteit.herhaling = repeat;    
                            }else{
                                activiteit.herhaling = "Geen";
                            }

                            activiteit.CreatedAt = new Date();



                            //in localstorage.activiteiten -> push (mijn aangemaakte activiteit);
                            //maakt zichtbaar voor iedereen
                            this._dbData.activiteiten.push(activiteit);
                            
                            //activiteit aan opgeslagenActiviteiten toevoegen
                            //mijn profiel opvragen
                            for(var i =0; i<this._dbData.profiles.length;i++){
                                if(this._dbData.activeuser.id == this._dbData.profiles[i].id){
                                    //in mijn profiel.opgeslagenActiviteiten -> push( mijn aangemaakte activiteit);
                                    this._dbData.profiles[i].opgeslagenActiviteiten.push(activiteit);
                                }
                            }
                            
                            this.save();
                            console.log(this._dbData);

                            
                            return true;
                        }
                    }   
                }
            }
        }else{
            console.log(userId+" "+actieId);J
            console.log("slechte Id's")
            return null;    
        } 
    },
};

/*
UserManager
--------------------
1) Login, logout a User
2) Cache
3) Register
*/
var UserManager = {
    "init": function(applicationDbContext) {
        this._applicationDbContext = applicationDbContext;
    },
    "login": function(userName, passWord) {
        var profile = this._applicationDbContext.getProfileByUserName(userName);
        if(profile == null) {
            return null;
        }
        if(profile.wachtwoord != passWord) {
            return false;
        }
        this._applicationDbContext.setActiveUser(profile);
        return profile;
    },
    "logout": function() {
        this._applicationDbContext.setActiveUser(null);
        return true;
    }
}