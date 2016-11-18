var Tier = { UNKNOWN: 0, STANDARD: 1, MVP: 2, GOLD: 3, GOLD75: 4 };
var Country = { UNKNOWN: "unknown", US: "united states", CA: "canada" };
var CreditCardType = { UNKNOWN: "unknown", VISA: "BAAS" };

var visitor = {
    country: Country.UNKNOWN,
    tier: Tier.UNKNOWN,
    creditCard: CreditCardType.UNKNOWN, // unknown, BAAS 
    destination: "unknown", // unknown, SEA, LAS,  PDX

    referrerUrl: "",  // http://www.google.com/search?q=alaska+airline+cheap&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-a&safe=active    
    isMileagePlanMember: false,
    hasInsiderSubscription: false,
    isBoardroomMember: false,
    familySize: 0
};

function VisitorRepository() {
    var _v = visitor;

    this.PopulateVisitor = function() {
        _v.referrerUrl = (typeof document.referrer != "undefined") ? document.referrer : "";

        // parse cookies
        var cookie = unescape(document.cookie);
        _v.destination = _parseDestination(cookie);
        _v.tier = _parseTier(cookie);
        _v.isMileagePlanMember = _v.tier > 0;
        _v.familySize = _parseFamilySize(cookie);
        _v.creditCard = _parseCreditCard(cookie);
        _v.hasInsiderSubscription = _parseHasInsiderSubscription(cookie);
        _v.isBoardroomMember = _parseIsBoardroomMember(cookie);
        _v.mileagePlanBalance = _parseForMileagePlanBalance(cookie);

        if (typeof testAndTargetUser == "object") {
            _overwriteObject(_v, testAndTargetUser); // set country using test and target geo location service
        }

        return _v;
    };

    function _parseForMileagePlanBalance(cookieString) {
        return _extract(cookieString, 'MemberMpBalance=', ';','');
    }

    function _overwriteObject(oldJson, newJson) {
        for (prop in newJson) {
            if (newJson.hasOwnProperty(prop) && oldJson.hasOwnProperty(prop)) {
                oldJson[prop] = newJson[prop];
            }
        }
    };

    function _parseDestination(cookie) {
        return _parseCookie(cookie, "AS_dest=");
    }

    function _parseTier(cookie) {
        var tier = _parseCookie(cookie, "AS_mbr=");
        if (tier.indexOf("GOLD75K") >= 0)
            return Tier.GOLD75;
        if (tier.indexOf("GOLD") >= 0)
            return Tier.GOLD;
        if (tier.indexOf("MVP") >= 0)
            return Tier.MVP;
        if (tier.indexOf("STANDARD") >= 0)
            return Tier.STANDARD;
        return Tier.UNKNOWN;
    }

    function _parseFamilySize(cookie) {
        var size = _parseCookie(cookie, "AS_fam=");

        if (size == "ZERO" || size == "unknown")
            size = "0";
        return parseInt(size);
    }

    function _parseCreditCard(cookie) {
        return _parseCookie(cookie, "AS_card=");
    }

    function _parseHasInsiderSubscription(cookie) {
        var subscriptions = _parseCookie(cookie, "AS_Subscrx=");
        return subscriptions.indexOf("InsiderNewsletter") >= 0;
    }

    function _parseIsBoardroomMember(cookie) {
        var subscriptions = _parseCookie(cookie, "AS_BR=");
        return subscriptions.indexOf("ACTIVE") == 0;
    }

    function _parseCookie(cookie, indexString) {
        return _extract(cookie, indexString, "|", "unknown");
    }

    function _extract(cookie, indexString, endString, defaultValue) {
        var x = cookie.indexOf(indexString);
        if (x < 0)
            return defaultValue;

        var result = cookie.substring(x + indexString.length);

        var y = result.indexOf(endString);
        if (y <= 0)
            return defaultValue;

        result = result.substring(0, y);
        if (!result || result == "")
            return defaultValue;

        return result;
    }
}
