function TestUtil() {
    var _me = this;
    this.debugging = false;

    // for testing: overwrite visitor properties based on URL query string
    this.overwriteVisitor = function (visitor) {
        if (window.location.search.indexOf("visitor=") > 0) {
            var params = this.getQuerystringParams(window.location.search);
            var newVisitor = jQuery.parseJSON(params["visitor"]);

            for (prop in newVisitor) {
                if (newVisitor.hasOwnProperty(prop) && visitor.hasOwnProperty(prop)) {
                    visitor[prop] = newVisitor[prop];
                }
            }
        }
    };

    this.debugJson = function (jsonObj) {
        if (_me.debugging || window.location.search.indexOf("debug=1") > 0) {
            this.debug(this.jsonToString(jsonObj) + "\r\n\r\n");
        }
    };

    this.debug = function (message) {
        if (_me.debugging || window.location.search.indexOf("debug=1") > 0) {
            if ($("#debugText").length == 0) {
                $("body").append("<textarea id='debugText' rows='20' cols='175' readonly='yes'></textarea>");
            }
                        
            $("#debugText").text($("#debugText").text() + message);
        }
    };

    this.jsonToString = function (jsonObj) {
        var s = "{"
        for (var p in jsonObj) {
            if (!jsonObj.hasOwnProperty(p)) {
                continue;
            }
            if (s.length > 1) {
                s += ',';
            }
            s += '' + p + ':' + jsonObj[p] + '';
        }

        return s + "}";
    }

    this.getQuerystringParams = function(querystring) {
        var qs = unescape(querystring);

        // document.location.search is empty if no query string
        if (!qs) {
            return {};
        }

        // Remove the '?' via substring(1)
        if (qs.substring(0, 1) == "?") {
            qs = qs.substring(1);
        }

        // Load the key/values of the return collection
        var qsDictionary = {};

        // '&' seperates key/value pairs
        var pairs = qs.split("&");
        for (var i = 0; i < pairs.length; i++) {
            var keyValuePair = pairs[i].split("=");
            qsDictionary[keyValuePair[0]] = keyValuePair[1];
        }

        // Return the key/value dictionary
        return qsDictionary;
    }
}
