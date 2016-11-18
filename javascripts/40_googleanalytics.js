//http://friendlybit.com/js/lazy-loading-asyncronous-javascript/
//http://support.google.com/googleanalytics/bin/answer.py?hl=en&answer=174090
if (typeof (as) != "undefined" && as.IsGoogleAnalyticsDown == false) {
    as.ga = {
        insertAsyncScript: function () {
            (function (i, s, o, g, r, a, m) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function () {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date();
                a = s.createElement(o), m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m)
            })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

            ga('create', as.GoogleAnalyticsAccount, 'alaskaair.com');
            ga('require', 'displayfeatures');
            ga('send', 'pageview');
            as.ga.log('GA code initialized for account id : ' + as.GoogleAnalyticsAccount);
        },
        insertECommerceConversionPixel: function () { return; },
        log: function (message, jObj) {
            if (typeof (window.as) !== "undefined" && window.as.hasOwnProperty("Environment") && window.as.Environment !== "prod") {
                var console = window.console || { log: function () { }, dir: function () { } };

                if (message) {
                    console.log(message);
                }

                if (jObj) {
                    console.log(jObj);
                }
            }
        }
    };
}
