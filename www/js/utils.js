var Utils = {
	getParamsFromUrl: function(url) {
        var regex = /[?&]([^=#]+)=([^&#]*)/g,
            params = {},
            match;
        while(match = regex.exec(url)) {
            params[match[1]] = match[2];
        }
        return params;
    },
    getJSONByPromise: function(url) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('get', this.API_URL, true);
            xhr.responseType = 'json';
            xhr.onload = function() {
                if(xhr.status == 200) {
                    var data = (!xhr.responseType)?JSON.parse(xhr.response):xhr.response;
                    resolve(data);
                } else {
                    reject(status);
                }
            }
            xhr.onerror = function() {
                reject(Error('Network Error!'));
            }
            xhr.send();
        });
    },
    getJSONPByPromise: function(url) {
        
        url = url + '_' + new Date().getTime() + '_' + Math.round(new Date().getTime()/(Math.random()*10));
        
        var script = document.createElement('script');
        script.src = url;
        
        script.onload = function () {
            this.remove();
        };// After scripts is loaded and executed, remoe it from the DOM 
        
        var head = document.getElementsByTagName('head')[0];
        head.insertBefore(script, head.firstChild);// Insert script into the DOM
        
        var params = this.getParamsFromUrl(url);
        var callbackStr = 'json_callback';

        if(params['prefix']) {
            callbackStr = params['prefix'];
        } else if(params['callback']) {
            callbackStr = params['callback'];
        }

        return new Promise(function(resolve, reject) {
            window[callbackStr] = function(data) {
                resolve(data);
            }
        });
    },
    pluralize: function (count, word) {
        return count === 1 ? word : word + 's';
    },
    trim: function(str){
        return str.replace(/^\s+|\s+$/gm,'');
    },
    guid: function(){
        var i, random;
        var uuid = '';

        for (i = 0; i < 32; i++){
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    },
	 store: function(namespace, data) {
        if(arguments.length > 1) {
            return localStorage.setItem(namespace, JSON.stringify(data));
        } else {
            var storedData = localStorage.getItem(namespace);
            return (storedData && JSON.parse(storedData)) || null;
        }
 	},
    getGEOLocationByPromise: function(){
        return new Promise(function(resolve, reject) {
            if(Modernizr.geolocation){
                navigator.geolocation.getCurrentPosition(
                    function(position){
                        resolve(position);
                    },
                    function(error){
                        switch(error.code)
                        {
                            case error.PERMISSION_DENIED: console.log("User did not share geolocation data");break;
                            case error.POSITION_UNAVAILABLE: console.log("Could not detect current position");break;
                            case error.TIMEOUT: console.log("Retrieving position timed out");break;
                            default: console.log("Unknown Error");break;
                        }
                        reject(error);
                    },
                    {timeout:10000,enableHighAccuracy:true}
                )
            }
            else{
                reject("HTML5 Geolocation not supported!");
            }
        });
    }
 };