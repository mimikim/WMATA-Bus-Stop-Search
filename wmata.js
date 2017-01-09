var wmata = (function() {

    var KEY = { "api_key": "6b700f7ea9db408e9745c207da7ca827" },
        PARAMS = {},
        listItems = '';

    /**
     * Converts Miles to Meters
     * @param {Number} miles
     * @return {Number} meters
     */
    var _convertMiles = function( miles ){
        return Math.ceil(miles * 1609.34);
    };

    /**
     * Assembles parameters for api request
     * @param {Object} obj
     */
    var assembleParameters = function( obj ){
        // converts miles to meters
        obj.Radius = _convertMiles(obj.Radius);

        // combines objects
        PARAMS = Object.assign(KEY, obj);

        // url
        URL = "https://api.wmata.com/Bus.svc/json/jStops?api_key=" + PARAMS.api_key + "&Lat=" + PARAMS.Lat + "&Lon=" + PARAMS.Lon + "&Radius=" + PARAMS.Radius;
    };

    /**
     * Assembles parameters for api request
     * @param {Object} callback
     */
    var getData = function( callback ){
        var wmata = new XMLHttpRequest();
        wmata.open("GET", URL , true );
        wmata.send();
        wmata.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback( this.responseText );
            }
        };
    };

    /**
     * Assembles parameters for api request
     * @param {Object} busStops
     * @param {Number} key
     * @param {String} stopIDs
     */
    var getStops = function( busStops, key, stopIDs ) {
        var busRequest = new XMLHttpRequest();
        busRequest.open("GET", "https://api.wmata.com/NextBusService.svc/json/jPredictions?api_key=" + PARAMS.api_key + "&StopID=" + stopIDs , true );
        busRequest.send();
        busRequest.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var busDiv = '<strong>Next Bus:</strong>';

                var busInfo = JSON.parse(this.responseText),
                    busPredictions = busInfo.Predictions;

                // if "Predictions" is not empty, bus is coming
                if( busPredictions.length > 0 ) {
                    for( var x = 0; x < busPredictions.length; x++ ) {
                        busDiv += '<div class="next-bus">Direction: ' + busPredictions[x]['DirectionText']
                        + '<br>Minutes til Arrival: ' + busPredictions[x]['Minutes'] + '</div>';
                    }
                } else {
                    busDiv += '<br>No buses currently en route for this stop!';
                }

                // create div element, add html, append to end of current busStop in the loop
                var node = document.createElement("div");
                node.innerHTML = busDiv;
                busStops[key].appendChild(node);
            }
        };
    };

    /**
     * Get Next Bus Information
     */
    var nextBus = function(){
        var busStops = document.getElementsByClassName('bus-stop');
        // for each bus stop entry, get upcoming bus info
        for( var key = 0; key < busStops.length; key++ ) {
            var stopIDs = busStops[key]['children'][1]['childNodes'][2].innerHTML;
            getStops( busStops, key, stopIDs );
        }
    };

    /**
     * Display Results
     * @param {Object} stops
     */
    var createListEntries = function( stops ){
        for( var key in stops ) {
            var stopID = stops[key]['StopID'];

            listItems += '<div class="bus-stop">\n'
            + '<h3>' + stops[key]['Name'] + '</h3>\n'
            + '<div><strong>Stop ID:</strong> <span class="stop-ids">' + stopID + '</span>'
            + '\n<br>\n<strong>Routes Serviced:</strong><ul>';

            // for each Route returned
            var routes = stops[key]['Routes'];
            for( var route_key = 0; route_key < routes.length; route_key++  ) {
                listItems += '<li>Route ' + routes[route_key] + '</li>';
            }

            listItems += '</ul>\n</div>'
            + '</div>\n';
        }

        document.getElementById("results").innerHTML = listItems;
    };

    /**
     * Display Results
     * @param {Object} Parameters
     */
    var displayResults = function( parameters ){
        assembleParameters(parameters);

        getData(function( response ){
            var obj = JSON.parse(response),
                stops = obj['Stops'];
            createListEntries( stops );
            nextBus();
        });
    };

    return {
        displayResults : displayResults
    }

})();