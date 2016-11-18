'use strict'

function SuperPixelController(opts) {
    var repo = (typeof (opts) != "undefined" && opts.hasOwnProperty("repo")) ? opts.repo : undefined,
        log = (typeof (window.as) != "undefined" && window.as.hasOwnProperty("Environment") && window.as.Environment != "prod") ? true : false,
        superPixelPageMapping = {
            pageNameOriginal: ["Home:Home",
                                "Shopping:MatrixAvailability",
                                "Shopping:CalendarAvailability",
                                "Shopping:BundledAvailability",
                                "Shopping:cart",
                                "booking:reservation",
                                "206:about-easybiz-test",
                                "EasyBiz:/Enrollment/WelcomeConfirm^EasyBiz",
                                "MainMileagePlan:UCMyAccountCreate",
                                "MyASSignedIn:Profile:Overview & Tier Status"],
            pageNameToBeSubstituted: ["Home",
                                        "Search",
                                        "Search",
                                        "Search",
                                        "Cart",
                                        "Purchase",
                                        "EBInfo",
                                        "EBEnroll",
                                        "MPInfo",
                                        "MPEnroll"],
            conditionMet: function (key) {
                var result = false;

                if ($.inArray(key, superPixelPageMapping.pageNameOriginal) != -1) {
                    result = true;

                    if (key == "Shopping:BundledAvailability") {
                        result = (repo.hasOwnProperty("formstate") && repo.formstate != "/Shopping/ReissueFlights") ? true : false;
                    }
                    if (key == "MyASSignedIn:Profile:Overview & Tier Status") {
                        result = (repo.hasOwnProperty("MAAP") && repo.MAAP.isNewMember == "True") ? true : false;
                    }
                    if (key == "booking:reservation") {
                        result = (repo.hasOwnProperty("formstate") && repo.formstate == "reservation^NewPurchase") ? true : false;
                    }
                }

                return result;
            }
        };

    var console = window.console || { log: function () { }, dir: function () { } };

    this.createSuperPixel = function () {
        var url = "//googleads.g.doubleclick.net/pagead/viewthroughconversion/1054000976/?value=0&label=Pf7ICLiz5wMQ0I7L9gM&guid=ON&script=0&data=";

        if (typeof (repo) == "undefined") {
            repo = {};
            if (typeof (window.as) != "undefined" && window.as.hasOwnProperty("Page")) {
                repo = window.as.Page;
            }
        }

        if (typeof (repo) != "undefined" && repo.hasOwnProperty("pagename") && superPixelPageMapping.conditionMet(repo.pagename)) {
            _insertPixel(url);
        }
    };

    function _insertPixel(url) {
        var superPixelParams = _populateSuperPixelParams(),
            img = document.createElement('img');

        img.setAttribute('alt', '');
        img.setAttribute('height', '1');
        img.setAttribute('width', '1');
        img.setAttribute('style', 'display: none;');
        img.setAttribute('src', url + superPixelParams);
        document.body.appendChild(img);

        if (log) { _log("Generated pixel url was : " + url + superPixelParams); }

        function _populateSuperPixelParams() {
            var params = '',
                v = new VisitorRepository().PopulateVisitor();

            params += "flight_pagetype=" + superPixelPageMapping.pageNameToBeSubstituted[$.inArray(repo.pagename, superPixelPageMapping.pageNameOriginal)];

            if (repo.hasOwnProperty("SP")) {
                var adtCount = ((repo.SP.paxADTCount == "ZERO") ? "0" : repo.SP.paxADTCount).toString(),
                    chdCount = ((repo.SP.paxCHDCount == "ZERO") ? "0" : repo.SP.paxCHDCount).toString();

                params += ";flight_originid=" + repo.SP.origin;
                params += ";flight_destid=" + repo.SP.destination;
                params += ";flight_startdate=" + _getFormattedData(repo.SP.outDate);
                if (repo.SP.inDate != '' && repo.SP.journeyType != "OW")
                    params += ";flight_enddate=" + _getFormattedData(repo.SP.inDate);
                params += ";flight_faretype=ADT-" + adtCount + ",CHD-" + chdCount;
                params += ";flight_itinerarytype=" + repo.SP.journeyType;
            }
            if (repo.hasOwnProperty("BP")) {
                params += ";flight_originid=" + repo.BP.origin;
                params += ";flight_destid=" + repo.BP.destination;
                params += ";flight_startdate=" + _getFormattedData(repo.BP.outDate);
                if (repo.BP.inDate != '' && repo.BP.journeyType != "OW")
                    params += ";flight_enddate=" + _getFormattedData(repo.BP.inDate);
                params += ";flight_itinerarytype=" + repo.BP.journeyType;
            }
            if (repo.hasOwnProperty("CP") && repo.CP.inCart != '')
                params += ";cart_contents=" + repo.CP.inCart.split('').join(',');

            if (v.hasOwnProperty("tier") && v.hasOwnProperty("hasInsiderSubscription")) {
                params += ";tier=" + v.tier;
                params += ";subscription=" + v.hasInsiderSubscription;
            }
            if (repo.hasOwnProperty("PP") && repo.PP.fop != '') {
                params += ";fop=" + repo.PP.fop;
            }

            function _getFormattedData(mdyDateString) {
                var result = '', mdy = mdyDateString.split('/');
                if (mdy.length == 3) {
                    var year = mdy[2], month = (mdy[0] > 9) ? mdy[0] : "0" + mdy[0].toString(), day = (mdy[1] > 9) ? mdy[1] : "0" + mdy[1].toString(),
                result = year + "-" + month + "-" + day;
                }
                return result;
            }

            return escape(params);
        }

        function _log(message) {
            var replaceSemiColon = new RegExp(";", "gi"),
                replaceEqualTo = new RegExp("=", "gi"),
                params = unescape(superPixelParams),
                paramStr = (params != "") ? '{\"' + params.replace(replaceSemiColon, '\",\"').replace(replaceEqualTo, '\":\"') + '\"}' : '',
                paramJSON = (paramStr != "") ? JSON.parse(paramStr) : {};

            console.log(message);
            console.log(paramJSON);
        }
    }
}

if (typeof (as) != "undefined" && as.IsSuperPixelDown == false) {
    as.superPixel = {};
    as.superPixel.ctrl = new SuperPixelController();
}
