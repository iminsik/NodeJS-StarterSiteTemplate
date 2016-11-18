// this is for WDCW Campaign, starting Apr, 2013
function Wdcw() {
    var _me = this;
        
    // included in the following pages: visit home page, then book a flight
    //https://www.alaskaair.com/booking/payment
    //https://www.alaskaair.com/booking/reservation/saved
    this.insertPurchaseConfirmationPixels = function () {
        _insertPixel("//bs.serving-sys.com/BurstingPipe/ActivityServer.bs?cn=as&amp;ActivityID=232070&amp;ns=1");
    }

    // included page: the landing / confirmation page after mileage plan account Sign Up
    this.insertMileagePlanConversionPixels = function () {
        _insertPixel("//bs.serving-sys.com/BurstingPipe/ActivityServer.bs?cn=as&amp;ActivityID=232071&amp;ns=1");
    }

    // included page: the landing / confirmation page after News Letter Subscription Sign Up
    this.insertEmailSignupConversionPixels = function () {
        _insertPixel("//bs.serving-sys.com/BurstingPipe/ActivityServer.bs?cn=as&amp;ActivityID=234857&amp;ns=1");
    }

    //<script type='text/javascript'>function callDeferredWdcwPixels() { as.wdcw.insertWdcwEmslPixels();}</script>
    // pixels for: http://www.alaskaair.com/content/deals/special-offers/explore-more-spend-less-ca.aspx
    this.insertWdcwEmslPixels = function () {
        _insertPixel("//bs.serving-sys.com/BurstingPipe/ActivityServer.bs?cn=as&amp;ActivityID=288135&amp;ns=1");
    }

    //<script type='text/javascript'>function callDeferredWdcwPixels() { as.wdcw.insertWdcwEmslSandiegoPixels();}</script>
    // pixels for: http://www.alaskaair.com/content/flights-from-san-diego?q=SAN&o=SAN
    this.insertWdcwEmslSandiegoPixels = function () {
        _insertPixel("//bs.serving-sys.com/BurstingPipe/ActivityServer.bs?cn=as&amp;ActivityID=301872&amp;ns=1");
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
}

if (typeof (as) != "undefined" && as.IsWdcwDown == false) {
    as.wdcw = new Wdcw();
}
