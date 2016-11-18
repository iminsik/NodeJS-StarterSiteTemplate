function Bing(tagUtil) {
    var _me = this;
    var _tagUtil = tagUtil;

    this.insertPixelsByCurrentUrl = function () {
        // booking confirmation
        if (_tagUtil.isPage_BookingConfirm()) {
            _insertPixelsForBooking();
        }
    }

    function _insertPixelsForBooking() {
        if (window.as && window.as.Page && window.as.Page.Cart && window.as.Page.Cart.Itinerary) {
            var revenue = window.as.Page.Cart.Itinerary.Revenue.toFixed(2);
            window.uetq = window.uetq || []; window.uetq.push({ 'gv': revenue });
        }
    }
}

if (typeof (as) != "undefined" && !as.IsBingDown) {
    as.bing = new Bing(as.tagUtil);
}
