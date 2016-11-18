// mantis 55038 - added initial basic tracking pixel, 8/6/2014
// mantis 55256 - added reveune and type parameters, 8/20/2014
// mantis 55219 - added tracking pixel to 4 more pages 9/3/2014
function Kenshoo(tagUtil) {
    var _me = this;
    var _tagUtil = tagUtil;

    this.insertPixelsByCurrentUrl = function () {
        if (_tagUtil.isPage_BookingConfirm()) {
            _insertPixelsForBooking();
        }

        if (_tagUtil.isPage_EasybizSignupConfirm()) {
            _tagUtil.insertImg(_toUrl("&type=EasyBiz_Acct_KS"));
        }

        // mileage plan registration
        if (_tagUtil.isPage_MileagePlanSignupConfirm()) {
            _tagUtil.insertImg(_toUrl("&type=Mileage_Program_KS"));
        }
    }

    // this is made public method because it is called from a sitecore page through onclick event
    // http://www.alaskaair.com/content/credit-card/visa-signature.aspx?
    this.insertPixelsForBankcard = function () {
        _tagUtil.insertImg(_toUrl("&type=BankCard_Referrals_KS"));
    }

    // this is made public method because the confirm page is not unique - shared by other My Account pages
    // https://www.alaskaair.com/www2/ssl/myalaskaair/myalaskaair.aspx
    this.insertEmailSignupConversionPixels = function () {
        _tagUtil.insertImg(_toUrl("&type=Email_Sign_Ups_KS"));
    }

    // this is made public method because submit page is not unique - shared by both success or failure result
    // https://www.alaskaair.com/RegistrationPromo/Club49Registration/submit
    this.insertClub49ConfirmPixels = function () {
        _tagUtil.insertImg(_toUrl("&type=Club_49_Reg_KS"));
    }

    function _insertPixelsForBooking() {
        if (window.as && window.as.Page && window.as.Page.Cart && window.as.Page.Cart.Itinerary)
        {
            var valParam = "&valueCurrency=USD&val=" + window.as.Page.Cart.Itinerary.Revenue.toFixed(2) + "&orderId=" + window.as.Page.Cart.Itinerary.Recloc;
            _tagUtil.insertImg(_toUrl("&type=Bookings_KS", valParam));
        }
    }

    function _toUrl(typeParam, valParam) {
        //other params: &orderId=&promoCode=&GCID=&kw=&product=&type=&val=
        var url = "//143.xg4ken.com/media/redir.php?track=1&token=bde70147-ad76-4556-964a-62e9a3363458";
        if (typeParam)
            url = url + typeParam;
        if (valParam)
            url = url + valParam;
        return url;
    }
}

if (typeof (as) != "undefined" && !as.IsKenshooDown) {
    as.kenshoo = new Kenshoo(as.tagUtil);
}
