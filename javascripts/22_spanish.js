// Floodlight pixels for Spanish Campaign, starting Apr, 2013
function Spanish() {
    var _me = this;
    var _random = (Math.random() + "") * 10000000000000;

    this.insertPixelsByCurrentUrl = function () {
        // Home Page Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=total247;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=Traff0;ord=" + _random + "?");
        }

        // Mileage Plan Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/content/mileage-plan.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mptra697;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/content/mileage-plan.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=mptra046;cat=MPTra0;ord=" + _random + "?");
        }

        // Mileage Plan Enrollment Form
        if (_pathStartsWith("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?CurrentForm=UCMyAccountCreate")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mptra697;ord=" + _random + "?");
        }
        if (_pathStartsWith("//www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?CurrentForm=UCMyAccountCreate")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mptra697;ord=" + _random + "?");
        }

        if (_pathStartsWith("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/myaccount/join")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mptra697;ord=" + _random + "?");
        }
        if (_pathStartsWith("//www.alaskaair.com/myaccount/join")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mptra697;ord=" + _random + "?");
        }

        // Mileage Plan Confirmation
        if (_pathStartsWith("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?isNewMember=true")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=leads853;cat=mplea477;ord=" + _random + "?");
        }
        if (_pathStartsWith("//www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?isNewMember=true")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=leads853;cat=MPLea0;ord=" + _random + "?");
        }

        // Booking Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/planbook")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=booki301;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/planbook")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=Booki0;ord=" + _random + "?");
        }

        // Booking Confirmation
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/booking/payment")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=leads853;cat=booki057;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/booking/payment")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=leads853;cat=Booki0;ord=" + _random + "?");
        }

        // Flight Deals Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/content/deals/flights.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=deals381;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/content/deals/flights.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=Deals0;ord=" + _random + "?");
        }

        // LA Offers Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/content/cities/flights-from/los-angeles.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=laori482;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/content/cities/flights-from/los-angeles.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=LAOff0;ord=" + _random + "?");
        }

        // CA Offers Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/content/deals/special-offers/explore-more-spend-less-ca.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=MPAcq0;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/content/deals/special-offers/explore-more-spend-less-ca.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=MPAcq00;ord=" + _random + "?");
        }

        // Mexico Traffic 
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/planbook/vacations/mazatlan-mexico")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mazat155;ord=" + _random + "?");
        }
    }

    // url -> with querystring
    function _pathStartsWith(url) {
        return _me.isTesting || _startsWith(location.href.replace(location.protocol, "").toLowerCase(), url.toLowerCase());
    }

    // url -> no querystring
    function _isPath(url) {
        return _me.isTesting || (("//" + location.hostname + location.pathname).toLowerCase() == url.toLowerCase());
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

    function _startsWith(thisStr, str) {
        return str.length > 0 && thisStr.substring(0, str.length) === str;
    }
}

if (typeof (as) != "undefined" && as.IsSpanishTagDown == false) {
    as.spanish = new Spanish();
}
