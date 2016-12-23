


/*
* Load Google Maps Asynchronous
* via appending script
* Don't forget the key: https://console.developers.google.com/flows/enableapi?apiid=maps_backend&keyType=CLIENT_SIDE&reusekey=true&pli=1
* Choose web API
*/
(function(){
  console.log("map");
    var key = 'AIzaSyDM44tX91QAae5d11iSGxe5JeM7Zp2CnUQ'; // User your own Key!

    //Load Google Maps Async
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp'
        + '&key=' + key
        + '&libraries=places'
        + '&callback=initGoogleMaps';
    document.body.appendChild(script);
    

    


    this.initGoogleMaps = function(){
        this._googleMapsInitialized = true;
    };

})();

var GMap = {
    "init": function() {
      console.log("init");
        var mapOptions = {
            zoom:13,
            center: new google.maps.LatLng(51.048017, 3.727666)
        }
        this._map = new google.maps.Map(document.querySelector('.map'), mapOptions);

        google.maps.visualRefresh = true;
        google.maps.event.trigger(this._map, 'resize');
        
        //hondenvoorzieningen.html

        this._geoLocationMarker = null;
        this._markersTreesInventory = [];
        this._markerClusterTreesInventory = null;
        if(document.querySelector('.hondenvoorzieningen')!=null){
          this._locations = this.getLocations();
          if(this._locations!=null){
            this.clickDataMarker(this._locations);
          }
        }
    },
    "addMarkerGeoLocation": function(geoLocation) {
        this._geoLocationMarker = new google.maps.Marker({
            position: new google.maps.LatLng(geoLocation[0], geoLocation[1]),
            title: geoLocation[0]+" "+geoLocation[1],
            clickable: true,
            icon: {
                url:"../css/img/WafMarkerV2.png",
                scaledSize : new google.maps.Size(35, 50),
            },
        });// Create a Google Maps Marker

        this._geoLocationMarker.setMap(this._map);// Add Marker to Map
        this._markersTreesInventory.push(this._geoLocationMarker);
        return this._markersTreesInventory;
    },
    "hideMarkers": function(arrMarkers, hide){
        var self = this;

        _.each(arrMarkers, function(marker){
            if(hide){
                marker.setMap(null);
            }else{
                marker.setMap(self.map);
            }
        });
    },
    "refresh": function() {
        google.maps.visualRefresh = true;
        google.maps.event.trigger(this.map,'resize');
    },

    "getLocations":function(){
        var geoData = $.ajax({type: "GET", url:"https://datatank.stad.gent/4/infrastructuur/hondenvoorzieningen.geojson", async: false}).responseText;
        var response = JSON.parse(geoData);
        for(var i=0; i<response.coordinates.length;i++){
          //lat en lng van plaats verwisselen omdat ze in de database omgekeerd staan
          // == FACEPALM
          var latLng = [response.coordinates[i][1],response.coordinates[i][0]]
          var arrMarkers = this.addMarkerGeoLocation(latLng);
          
        }
        return arrMarkers;
    },

    "markerClick":function(arrMarkers){
        var self = this;
        for(var i=0; i<arrMarkers.length; i++){
            google.maps.event.addListener(arrMarkers[i],"click",function(ev){
                if(document.querySelector(".browseList")){
                    //als we op browse pagina zitten
                    //haal de activiteit met dezelfde lat en lng op
                    var dbActiviteiten = applicationDbContext._dbData.activiteiten;
                    var html = "";
                    for(var j=0; j<dbActiviteiten.length;j++){
                        //haal de coordinaten uit de local storage
                        var dbLat = dbActiviteiten[j].lat;
                        var dbLng = dbActiviteiten[j].lng;
                        //haal de coordiaten van de map uit de title
                        var mapLat = this.title.split(" ")[0];
                        var mapLng = this.title.split(" ")[1];
                        //check do coordinaten van de activiteiten
                        if(dbLat == mapLat && dbLng == mapLng){
                            if(dbActiviteiten[j]!=undefined){
                            //gevonden -> schrijf de locatie in de placeholderMap
                            html += '<ul class="placeholderMapListActiviteit">';
                            html +='<li><strong>'+dbActiviteiten[j].status+'</strong></li>';
                            html +='<li>Van: '+dbActiviteiten[j].startDatum+' '+dbActiviteiten[j].startUur +'</li>';
                            html +='<li>Tot: '+dbActiviteiten[j].stopDatum+" "+dbActiviteiten[j].stopUur+'</li>';
                            html +='<li>Door: '+dbActiviteiten[j].gebruikerNaam+'</li>';
                            html +='<li>Hond: '+dbActiviteiten[j].gebruikerHond+" "+dbActiviteiten[j].gebruikerRas+'</li>';
                            html +='<li>Locatie: '+dbActiviteiten[j].locatie+'</li>';
                            html += "</ul>";
                            console.log(dbActiviteiten[j]);
                        }
                        }
                    }
                        $(".placeholderMap").css("display","inline");
                        $(".placeholderMap").fadeIn().css({
                            position: 'absolute',
                        }).animate({
                            top: '60%'
                        },200,function(){

                        });
                        $(".placeholderMapList").html(html);
                }
            });
        }
    },
    "clickDataMarker":function(arrMarkers){
        for(var i=0; i<arrMarkers.length;i++){
            google.maps.event.addListener(arrMarkers[i],"click",function(ev){
                console.log(this.title);
            });
        }
    }
};