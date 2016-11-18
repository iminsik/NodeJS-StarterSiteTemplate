function TagUtil(location) {
    var _me = this;
    _me.location = location ? location : window.location;

    this.isPage_BookingConfirm = function() {
        return this.pathStartsWith("//www.alaskaair.com/booking/payment")
            || this.pathStartsWith("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/booking/payment");
    };

    // no spanish version
    this.isPage_EasybizSignupConfirm = function() {
        return this.pathStartsWith("//easybiz.alaskaair.com/Enrollment/WelcomeConfirm");
    };

    this.isPage_MileagePlanSignupConfirm = function() {
        return this.pathStartsWith("//www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?isNewMember=true")
            || this.pathStartsWith("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?isNewMember=true");
    };

    this.pathStartsWith = function(url) {
        return _me.isTesting || _me.startsWith(_me.location.href.replace(_me.location.protocol, "").toLowerCase(), url.toLowerCase());
    };

    _me.isPage_Home = function() {
        return _me.isPath('//www.alaskaair.com/') || _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com');
    };

    _me.isPage_Loyalty = function() {
        return ((_me.isPath('//www.alaskaair.com/www2/ssl/myalaskaair/myalaskaair.aspx?CurrentForm=UCSignInStart', true)
                || _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/www2/ssl/myalaskaair/myalaskaair.aspx?CurrentForm=UCSignInStart', true))
        //needed because the landing page has the same URL as the sign in page, this is the only way to differentiate.
                    && as.Page && as.Page.pageid != 'UCSignInStart'  
                    || _me.isPath('//www.alaskaair.com/www2/ssl/myalaskaair/myalaskaair.aspx', true)
                    || _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/www2/ssl/myalaskaair/myalaskaair.aspx', true)
                    );
    };

    _me.isPage_Loyalty_Booking = function () {
        return (_me.isPath('//www.alaskaair.com/Booking/SignIn') ||
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/Booking/SignIn'));
    };

    _me.isPage_ShoppingPath_Flight = function () {
        return (_me.isPath('//www.alaskaair.com/Shopping/Flights/Shop') ||
                _me.isPath('//www.alaskaair.com/Shopping/Flights/Price') ||
                _me.isPath('//www.alaskaair.com/Shopping/Flights/Calendar') ||                
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/Shopping/Flights/Shop') ||
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/Shopping/Flights/Price') ||
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/Shopping/Flights/Calendar'));
    };

    _me.isPage_ShoppingPath_Cart_Flight = function () {
        return (_me.isPath('//www.alaskaair.com/Shopping/Cart/AddFlight') ||
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/Shopping/Cart/AddFlight'));
    };

    _me.isPage_ShoppingPath_Confirmation = function() {
        return (_me.isPath('//www.alaskaair.com/booking/payment') ||
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/booking/payment'));
    };

    _me.isPath = function (url, isComparePath) {
        if (!isComparePath) {
            return _me.isTesting || (("//" + _me.location.hostname + _me.location.pathname).toLowerCase() == url.toLowerCase());
        }
        return _me.isTesting || (("//" + _me.location.hostname + _me.location.pathname + _me.location.search).toLowerCase() == url.toLowerCase());
    };


    this.startsWith = function(thisStr, str) {
        return str.length > 0 && thisStr.substring(0, str.length) === str;
    };

    this.insertImgBasedOnHttps = function(sslUrl, url) {
        if (_me.location.protocol == "https:")
            _me.insertImg(sslUrl);
        else
            _me.insertImg(url);
    };



    this.insertImg = function(url) {
        var img = document.createElement('img');
        img.setAttribute('alt', '');
        img.setAttribute('height', '1');
        img.setAttribute('width', '1');
        img.setAttribute('style', 'display: none;');
        img.setAttribute('src', url);
        document.body.appendChild(img);
    };
}

if (typeof (as) != "undefined") {
    as.tagUtil = new TagUtil();
}
