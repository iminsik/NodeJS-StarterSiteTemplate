// this is for Cake, starting Aug, 2013
function Cake() {
    this.init = function () {
        var params = _getQuerystringParams(window.location.search);
        // cake param found, then store it in cookie to create pixel and/or to perform postback
        if (params.hasOwnProperty('cake')) {
            _setCookie("cake", params.cake, 7);
        }
    }

    // only called when transaction is completed successfully
    // https://alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/booking/payment
    // https://www.alaskaair.com/booking/payment
    this.insertCakeConversionPixels = function () {
        var cake = JSON.parse(unescape(as.CakeTag.SourceCookie)),
            cakePixelUrl = "//astrks.com/p.ashx?f=img&r=" + cake.ri + "&o=" + cake.oi + "&t=" + as.CakeTag.RecordLocator + "&p=" + as.CakeTag.TotalBaseFare;

        _insertPixel(cakePixelUrl);
    }

    function _insertPixel(url) {
        var img = document.createElement('img');
        img.setAttribute('alt', '');
        img.setAttribute('height', '1');
        img.setAttribute('width', '1');
        img.setAttribute('style', 'display: none;');
        img.setAttribute('src', url);
        document.body.appendChild(img);
    }

    function _setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : ";domain=" + document.domain + ";path=/; expires=" + exdate.toGMTString());
        document.cookie = c_name + "=" + c_value;
    }

    function _getQuerystringParams(querystring) {
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

if (typeof (as) != "undefined") {
    as.cake = new Cake();
    as.cake.init();
}
