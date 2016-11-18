function Adready() {
    var _me = this;

    this.includeGlobalPixels = true;

    //included in every page, including homepage: http://www.alaskaair.com/
    //pixels copied from: http://www.adreadytractions.com/rt/63?p=801&async=true
    this.insertGlobalPixels = function () {
        if (_me.includeGlobalPixels == false) return;

        _insertPixel("//googleads.g.doubleclick.net/pagead/viewthroughconversion/1054000976/?value=0&label=Pf7ICLiz5wMQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Universal");
        _insertPixel("//a.adready.com/beacon.php?r=801");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=99497", "//ib.adnxs.com/seg?add=99497");
        _insertPixelBasedOnHttps("//secure.media6degrees.com/orbserv/hbpix?pixId=13449&pcv=46", "//action.media6degrees.com/orbserv/hbpix?pixId=13449&pcv=46");
        _insertPixel("//cc.chango.com/c/o?pid=1824");
    }

    // included in the following pages: visit home page, then search a flight
    //https://www.alaskaair.com/shopping/Flights/Shop
    //https://www.alaskaair.com/shopping/Flights/Schedule
    //https://www.alaskaair.com/shopping/Flights/Calendar
    //https://www.alaskaair.com/shopping/Flights/Price
    //pixels copied from: https://www.adreadytractions.com/rt/63?p=25441&async=true
    this.insertShoppingPixels = function () {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?label=sZ8PCNi5nwIQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Flight+Shopping+Page");
        //_insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=flight");
        _insertPixel("//a.adready.com/beacon.php?r=25441");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=161788", "//ib.adnxs.com/seg?add=161788");
    }

    // included in the following pages: visit home page, then book a flight
    //https://www.alaskaair.com/booking/payment
    //https://www.alaskaair.com/booking/reservation/saved
    this.insertConfirmationPixels = function () {
        _insertConfirmationPixels();
    }

    // included in the following pages: visit home page, then book a flight
    //https://www.alaskaair.com/booking/payment
    //https://www.alaskaair.com/booking/reservation/saved
    this.insertPurchaseConfirmationPixels = function () {
        _insertConvertionPixels();
        _insertConfirmationPixels();
    }

    // included in the following pages: visit home page, then sign in
    //https://www.alaskaair.com/www2/ssl/myalaskaair/myalaskaair.aspx
    //pixels copied from: https://www.adreadytractions.com/rt/63?p=16121&async=true
    this.insertMyAccountPixels = function () {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?label=2zloCPDghwIQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Mileage+Plan+Login");
        //_insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=mpl"); //<-- Obsolete, replaced by the new Adara super pixel pls see SMMP#53903 and AdaraPixel.js
        _insertPixel("//a.adready.com/beacon.php?r=16121");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=99527", "//ib.adnxs.com/seg?add=99527");
    }

    // included in the following pages:
    //https://www.alaskaair.com/shopping/hotel
    //pixels copied from: https://www.adreadytractions.com/rt/63?p=19561&async=true
    this.insertHotelPixels = function () {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?label=EBFPCMiOkAIQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Hotel+Page");
        _insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=hotel");
        _insertPixel("//a.adready.com/beacon.php?r=19561");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=124691", "//ib.adnxs.com/seg?add=124691");
    }

    // included in the following pages:
    //https://www.alaskaair.com/shopping/car
    //pixels copied from: https://www.adreadytractions.com/rt/63?p=19571&async=true
    this.insertCarPixels = function () {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?label=smO3CMCPkAIQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Car+Page");
        _insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=car");
        _insertPixel("//a.adready.com/beacon.php?r=19571");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=124692", "//ib.adnxs.com/seg?add=124692");
    }

    // included in the following pages:
    //http://www.alaskaair.com/content/mileage-plan/benefits/about-mileage-plan.aspx?lid=nav:mileagePlan-benefits
    //pixels copied from: https://www.adreadytractions.com/rt/63?p=16131&async=true
    this.insertMileagePlanPixels = function () {
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Mileage+Plan+Awards");
        _insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=mpa");
        _insertPixel("//a.adready.com/beacon.php?r=16131");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=99529", "//ib.adnxs.com/seg?add=99529");
    }

    // included in the following pages:
    //http://www.alaskaair.com/shopping/vacations?lid=nav:planbook-vacations
    //http://www.alaskaair.com/content/deals/vacations.aspx
    //pixels copied from: http://www.adreadytractions.com/rt/245541?p=25461&async=true
    this.insertVacationPixels = function () {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1016634413/?label=K_HBCJufiQMQrbji5AM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Vacation+Shopping+Page");
        _insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=vacation");
        _insertPixel("//a.adready.com/beacon.php?r=25461");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=161792", "//ib.adnxs.com/seg?add=161792");
    }

    //pixels copied from: http://www.adreadytractions.com/pt/398121/?h=4a05ac3aa30b6abbde2b&async=true   
    // included page: the landing / confirmation page after mileage plan account Sign Up
    this.insertMileagePlanConversionPixels = function () {
        _insertPixel("//a.adready.com/ce/60232/901651/?h=4a05ac3aa30b6abbde2b");
        _insertPixel("//fls.doubleclick.net/activityi;src=3770605;type=ar-ac016;cat=ar-ac042;ord=1?");
        _insertPixel("//www.googleadservices.com/pagead/conversion/996519509/?value=0&label=28iPCPOrrAMQ1dyW2wM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Mileage+Rewards+Signup+Confirmation+Page");
        _insertPixelBasedOnHttps("//secure.adnxs.com/px?id=43855&t=2", "//ib.adnxs.com/px?id=43855&t=2");
        _insertPixel("//cs.yieldoptimizer.com/cs/c?a=1269&cpid=410&");
    }

    //pixels copied from: http://www.adreadytractions.com/pt/398131/?h=9c830cc3d57068e9bed2&async=true
    // included page: the landing / confirmation page after News Letter Subscription Sign Up
    this.insertEmailSignupConversionPixels = function () {
        _insertPixel("//a.adready.com/ce/60233/901661/?h=9c830cc3d57068e9bed2");
        _insertPixel("//fls.doubleclick.net/activityi;src=3770603;type=ar-ac347;cat=ar-ac618;ord=1?");
        _insertPixel("//www.googleadservices.com/pagead/conversion/999986501/?value=0&label=JHCFCMP8_AIQxarq3AM&guid=ON&script=0");
        _insertPixelBasedOnHttps("//secure.adnxs.com/px?id=43854&t=2", "//ib.adnxs.com/px?id=43854&t=2");
    }

    // pixels copied from: http://www.adreadytractions.com/pt/410611/?h=9e04b5282d41e0bf2072&async=true
    this.insertEasyBizConfirmationPixels = function () {
        _insertPixel("//3966881.fls.doubleclick.net/activityi;src=3966881;type=ar-ac819;cat=ar-ac273;ord=1?");
        _insertPixel("//www.googleadservices.com/pagead/conversion/1000862384/?value=0&label=ik8zCNCd4wQQsOWf3QM&guid=ON&script=0");
        _insertPixel("//a.adready.com/ce/61482/933671/?h=9e04b5282d41e0bf2072");
        _insertPixelBasedOnHttps("//secure.adnxs.com/px?id=58581&t=2", "//ib.adnxs.com/px?id=58581&t=2");
    }

    //pixels copied from: https://adreadytractions.com/pt/63/?h=fb206b070c03eba62c02    
    // included page: the landing / confirmation page successfully booked a flight ticket
    function _insertConvertionPixels() {
        _insertPixel("//a.adready.com/ce/80/71/?h=fb206b070c03eba62c02");
        _insertPixel("//ad.doubleclick.net/activity;src=2772323;type=ar-ac939;cat=ar-ac508;ord=1?");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Flight+Booking+Conversion");
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?value=0.0&label=cMkhCPLKdxDQjsv2Aw&script=0");
        _insertPixel("//www.googleadservices.com/pagead/conversion/1023643442/?label=XB2pCMDVsAEQsp6O6AM&guid=ON&script=0");
        _insertPixelBasedOnHttps("//secure.adnxs.com/px?id=9478&t=2", "//ib.adnxs.com/px?id=9478&t=2");
        _insertPixel("//cs.yieldoptimizer.com/cs/c?a=1269&cpid=243&");
        _insertPixel("//as.chango.com/conv/i;%25n?conversion_id=10837");
        _insertPixelBasedOnHttps("//secure.media6degrees.com/orbserv/hbpix?pixId=13452&pcv=41", "//secure.media6degrees.com/orbserv/hbpix?pixId=13452&pcv=41");
        _insertPixelBasedOnHttps("//secure.adnxs.com/px?id=473273&t=2", "//id.travelspike.com/px?id=473273&t=2");
    }

    //pixels copied from: https://www.adreadytractions.com/rt/63?p=7091&async=true
    // included page: the landing / confirmation page successfully booked a flight ticket
    function _insertConfirmationPixels() {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?label=en4LCOjShwIQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//a.adready.com/beacon.php?r=7091");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=99516", "//ib.adnxs.com/seg?add=99516");
    }

    function _insertPixel(url) {
        var img = document.createElement('img');
        img.setAttribute('alt', '');
        img.setAttribute('height', '1');
        img.setAttribute('aria-hidden', 'true');
        img.setAttribute('width', '1');
        img.setAttribute('style', 'display: none;');
        img.setAttribute('src', url);
        document.body.appendChild(img);
    }

    function _insertPixelBasedOnHttps(sslUrl, url) {
        if (window.location.protocol == "https:")
            _insertPixel(sslUrl);
        else
            _insertPixel(url);
    }
}

if (typeof (as) != "undefined" && as.IsAdreadyDown == false) {
    as.adready = new Adready();
}
