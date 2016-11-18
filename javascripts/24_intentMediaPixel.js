// after 2/25/2014, pixels can be verified here:  http: //www.alaskaair.com/tests/intentmedia.htm?debug=1
function IntentMediaPixel() {
    //<a id="intentMediaUrl" href="http://a.intentmedia.net/adServer/advertiser_conversions?entity_id=66539&site_type=ALASKA_AIRLINES&product_category=FLIGHTS&travelers=1&conversion_currency=USD&conversion_value=300.00&order_id=ABCDEF&cache_buster=123456789">
    this.insertIntentMediaConversionPixel = function () {
        if ($('#intentMediaUrl').length) {
            $('body').append($("<img width='1' height='1' border='0' alt='intent media url'></img>").attr({ src: $('#intentMediaUrl').attr("href") }));
        }
    }

    //https://gist.github.com/IMAdsTeam/1c2bdff0a7aaca5fdf84
    // all pixels are deferred loaded.  This method will be called after web page finished loading: as.intentMediaPixel.insertIntentMediaGlobalPixel()
    this.insertIntentMediaGlobalPixel = function () {
        window.IntentMediaProperties = {
            page_id: "UNKNOWN",  // possible values - Home:Home; PlanBook_Flights:Home; FlightDeals:deals-flight; 104:travel-info; 105:gifts-products; 106:mileage-plan; ...
            product_category: 'FLIGHTS',  // value hard coded
            page_view_type: 'UNKNOWN', // value hard coded
            user_member_id: '',  // possible values - Y; N
            entity_id: '66539'  // value hard coded
        };

        if ('undefined' !== typeof s && 'undefined' !== typeof s.pageName) // omniture value
            window.IntentMediaProperties.page_id = s.pageName;

        if ('undefined' !== typeof VisitorRepository) {
            var _v = new VisitorRepository().PopulateVisitor();
            window.IntentMediaProperties.user_member_id = (_v.isMileagePlanMember) ? 'Y' : 'N';
        }

        var script = document.createElement("script");
        var prefix = document.location.protocol === 'https:' ? 'https://a' : 'http://a.cdn';
        script.src = prefix + '.intentmedia.net/javascripts/intent_media_data.js';
        document.getElementsByTagName("head")[0].appendChild(script);
    }
}

if (typeof (as) != "undefined" && as.IsIntentMediaDown == false) {
    as.intentMediaPixel = new IntentMediaPixel();
}

