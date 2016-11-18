// usage: defined a function downloadDeferredContent() in your page, it will be called during onload event
function DeferredLoader() {
    var _contentDownloaded = false;

    this.init = function () {
        _registerToDownloadDeferredContentOnLoad();
    };

    function _registerToDownloadDeferredContentOnLoad() {
        // Check for browser support of event handling capability
        if (window.addEventListener) {
            window.addEventListener("load", as.deferredLoader.startDownload, false);
        } else if (window.attachEvent) {
            window.attachEvent("onload", as.deferredLoader.startDownload);
        } else window.onload = as.deferredLoader.startDownload;
    }

    this.startDownload = function () {
        if (_contentDownloaded) { return; }

        _contentDownloaded = true;
        var re = new RegExp("IMAGEToken" + "=[^;]+", "i");
        var imageAgent = document.cookie.match(re);

        // defer omniture calls: s.t() and s2.t()
        if (typeof (callDeferredOmniture) == "function") {
            callDeferredOmniture();
        }

        // defer responsys TWRS async script tag
        if (as.rTWRS && !imageAgent) {
            as.rTWRS.insertAsyncScript();
        }

        // defer google analytics async script tag
        if (as.ga) {
            as.ga.insertAsyncScript();
            as.ga.insertECommerceConversionPixel();
        }

        // defer adReady global pixels
        if (as.adready) {
            // defer adReady specific pixels
            if (typeof (callDeferredAdreadyPixels) == "function") {
                callDeferredAdreadyPixels();
            }

            if (as.adready.includeGlobalPixels == true) {
                as.adready.insertGlobalPixels();
            }
        }

        //  defer Intent Media Pixel
        if (as.intentMediaPixel) {
            as.intentMediaPixel.insertIntentMediaGlobalPixel();
            as.intentMediaPixel.insertIntentMediaConversionPixel();
        }

        //  defer Sojern Pixel
        if (as.sojernPixel) {
            as.sojernPixel.insertSojernPixel();
        }

        // Defer loading of the foresee hosted code
        if (as && as.IsForeseeDown === false && !imageAgent && (localStorage && localStorage.getItem('isAutomatedTest')) !== true) {
            as.foresee.foreseeLauncher();
        }

        // defer interstitial images
        if (as.interstitial) {
            as.interstitial.insertInterstitialImages();
            }

        // defer wdcw pixels
        if (as.wdcw) {
            if (typeof (callDeferredWdcwPixels) == "function") {
                callDeferredWdcwPixels();
            }
            }

        // defer spanish pixels
        if (as.spanish) {
            as.spanish.insertPixelsByCurrentUrl();
            }

        // defer cake conversion pixels
        if (as.cake && as.CakeTag && as.CakeTag.SourceCookie &&
        (location.hostname.toString() == 'alaskaair.convertlanguage.com' || location.hostname.toString() == 'www.alaskaair.com') &&
        (location.pathname == "/alaskaair/enes/24/_www_alaskaair_com/booking/payment" || location.pathname == "/booking/payment")) {
            as.cake.insertCakeConversionPixels();
            }

        if (as.bing) {
            as.bing.insertPixelsByCurrentUrl();
            }

        if (as.jennLoader) {
            as.jennLoader.loadIfWasLaunched();
            }

        if (as.kenshoo) {
            as.kenshoo.insertPixelsByCurrentUrl();
            if (typeof (callDeferredKenshooPixels) == "function") {
                callDeferredKenshooPixels();
            }
            }

        if (typeof jQueryMigrateWarnings == 'function') {
            new jQueryMigrateWarnings().init(as.Environment);
            }

        // defer adready super pixel create call
        if (typeof (as.superPixel) != "undefined") {
            as.superPixel.ctrl.createSuperPixel();
            }

        // defer load session timeout template
        if (typeof (as.stnw) != "undefined" && !document.cookie.match(re)) {
            as.stnw.init();
            }

        new AdaraPagePixelClass().conditionalInsertPixel();

        // create the following function for deferring execution in your specific page
        if (typeof (downloadDeferredContent) == "function") {
            downloadDeferredContent();
            }
        }
        }

as.deferredLoader = new DeferredLoader();

$(document).ready(function() {
    as.deferredLoader.init();
    });
