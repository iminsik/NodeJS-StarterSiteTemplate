if (typeof (as) != "undefined" && as.IsResponsysTWRSDown == false && as.ResponsysTWRSAccount != "") {
    as.rTWRS = {
        trackingPageMapping: {
            shoppingPageIds: ["MatrixAvailability",
                                "CalendarAvailability",
                                "BundledAvailability"],
            cartPageIds: ["cart"],
            confirmPageIds: ["reservation"],
            signOutPageIds: ["UCSignOut"],
            isInShoppingPage: function (key) {
                return ($.inArray(key, as.rTWRS.trackingPageMapping.shoppingPageIds) != -1);
            },
            isInCartPage: function (key) {
                return ($.inArray(key, as.rTWRS.trackingPageMapping.cartPageIds) != -1);
            },
            isInConfirmPage: function (key) {
                var result = false;
                if ($.inArray(key, as.rTWRS.trackingPageMapping.confirmPageIds) != -1) {
                    result = true;
                    if (key == "booking:reservation") {
                        result = (repo.hasOwnProperty("formstate") && repo.formstate == "reservation^NewPurchase");
                    }
                }
                return result;
            },
            isInSignOutPage: function (key) {
                return ($.inArray(key, as.rTWRS.trackingPageMapping.signOutPageIds) != -1);
            }
        },
        analytics: {
            trackVisitor: function () {
                var customerId = _riTrack.getCookieValue(_custIDCookieName);

                if (as.rTWRS.analytics.hasLocalStorageSupport() && as.rTWRS.analytics.getDateStamp() != (new Date().toDateString())) {
                    as.rTWRS.analytics.trackEvent("TrackDailyUniqueVisitor", (as.rTWRS.getCustomerId() !== undefined) ? "Yes" : "No");
                    as.rTWRS.analytics.setDateStamp();
                }
                if (customerId === null && as.rTWRS.getCustomerId() !== "") {
                    as.rTWRS.analytics.trackEvent("TrackUniqueTrueCustomerVisit", "Yes");
                }
                else if (customerId !== null && as.rTWRS.getCustomerId() != undefined && customerId != as.rTWRS.getCustomerId())
                {
                    as.rTWRS.analytics.trackEvent("TrackUserSwitching", "Yes");
                }
            },
            trackEvent: function (eventName, hasCustomerContactId) {
                if (as.IsGoogleAnalyticsDown == false && typeof (ga) == "function") {
                    ga('send', 'event', 'ResponsysTWRS', 'ResponsysEvent_' + eventName, 'CustomerContactId', (hasCustomerContactId == 'Yes') ? 1 : 0);
                }
            },
            getDateStamp: function () {
                if (window.localStorage) { return window.localStorage.ResponsysDateStamp; }
                return '';
            },
            setDateStamp: function () {
                if (window.localStorage) { try { localStorage.setItem('ResponsysDateStamp', (new Date().toDateString())); } catch (e) { } }
            },
            hasLocalStorageSupport: function () {
                var testKey = 'test', storage = window.localStorage;
                try {
                    storage.setItem(testKey, '1');
                    storage.removeItem(testKey);
                    return true;
                }
                catch (error) {
                    return false;
                }
            }
        },
        getCustomerId: function () {
            return (as.ResponsysCustContactId !== "") ? as.ResponsysCustContactId : undefined;
        },
        insertAsyncScript: function (repo) {
            var repo = repo || window.as.Page,
                hasASPageRepo = (typeof (repo) != "undefined" && repo.hasOwnProperty("pageid"));

            if (hasASPageRepo &&
                    (as.rTWRS.trackingPageMapping.isInShoppingPage(repo.pageid) ||
                    as.rTWRS.trackingPageMapping.isInCartPage(repo.pageid) ||
                    as.rTWRS.trackingPageMapping.isInConfirmPage(repo.pageid) ||
                    as.rTWRS.trackingPageMapping.isInSignOutPage(repo.pageid))) {
                (function (i, s, o, g, r, a, m) {
                    i['ResponsysTWRSObject'] = r;
                    i[r] = i[r] || function () {
                        (i[r].q = i[r].q || []).push(arguments)
                    }, i[r].l = 1 * new Date();
                    a = s.createElement(o), m = s.getElementsByTagName(o)[0];
                    a.async = 1;
                    a.src = g;
                    m.parentNode.insertBefore(a, m)
                })(window, document, 'script', '//wrs.adrsp.net/ts-twrs/js/twrs.min.js', '_riTrack');
            }
        },
        trackEvents: function (repo) {
            var repo = repo || window.as.Page,
                hasASPageRepo = (typeof (repo) != "undefined" && repo.hasOwnProperty("pageid"));

            // For now we are only tracking standard shopping, not re-issues
            if (hasASPageRepo && as.rTWRS.trackingPageMapping.isInShoppingPage(repo.pageid) && (repo.hasOwnProperty("ShoppingSearch") || repo.hasOwnProperty("LowFareItinerary"))) {
                var ss = repo.ShoppingSearch,
                    srchEvent = _riTrack.createSearch(undefined, as.rTWRS.getCustomerId(), ss.ItineraryType);

                for (var i = 0; i < ss.CityPairSlices.length; i++) {
                    var cps = ss.CityPairSlices[i];
                    if (!cps.IsInbound) {
                        srchEvent.addSlice(cps.DepartureShort, cps.ArrivalShort, cps.Date, null, ss.TravelersCount, ss.AdultCount, ss.ChildrenCount, (ss.IsRevenue) ? "Revenue" : "Award", 0, 0, ss.CabinType);
                    }
                    else {
                        srchEvent.addSlice(cps.DepartureShort, cps.ArrivalShort, cps.Date, null, ss.TravelersCount, ss.AdultCount, ss.ChildrenCount, (ss.IsRevenue) ? "Revenue" : "Award", 0, 0, ss.CabinType);
                    }
                }
                srchEvent.addOptionalData("DiscountType", ss.DiscountType);
                srchEvent.addOptionalData("Fare", ss.FareType);
                if (!ss.IsRevenue) {
                    srchEvent.addOptionalData("AwardOption", ss.AwardOption);
                    srchEvent.addOptionalData("ShopAwardCalendar", ss.ShopAwardCalendar);
                }
                else {
                    srchEvent.addOptionalData("ShopLowFareCalendar", ss.ShopLowFareCalendar);
                }
                srchEvent.addOptionalData("IncludeNearbyArrivalAirports", ss.IncludeNearbyArrivalAirports);
                srchEvent.addOptionalData("IncludeNearbyDepartureAirports", ss.IncludeNearbyDepartureAirports);
                srchEvent.addOptionalData("RequiresUmnrService", ss.RequiresUmnrService);

                srchEvent.trackSearchEvent(as.rTWRS.analytics.trackEvent("Id201_TrackSearch", (as.rTWRS.getCustomerId() !== undefined)? "Yes" : "No"));
                as.rTWRS.log('Responsys TWRS search event data : ', srchEvent.getJSON()[0].search);

                if (repo.hasOwnProperty("LowFareItinerary")) {
                    var itin = repo.LowFareItinerary,
                        itinEvent;

                    itinEvent = _riTrack.createSearchResults(as.rTWRS.getCustomerId(), undefined)
                    itinEvent.addItinerary(as.rTWRS.getItinerary(itin));
                    itinEvent.addOptionalData("SeatsRemaining", itin.SeatsRemaining);
                    itinEvent.trackSearchResults(as.rTWRS.analytics.trackEvent("Id202_TrackLowFareItinerary", (as.rTWRS.getCustomerId() !== undefined) ? "Yes" : "No"));
                    as.rTWRS.log('Responsys TWRS lowfare itinerary search results found');
                    as.rTWRS.log('Responsys TWRS lowfare itinerary search results event data : ', itinEvent.getJSON());
                }
            }
            if (hasASPageRepo
                && (as.rTWRS.trackingPageMapping.isInCartPage(repo.pageid) || as.rTWRS.trackingPageMapping.isInConfirmPage(repo.pageid))
                && repo.hasOwnProperty("Cart")
                && repo.Cart.hasOwnProperty("Itinerary")
                && repo.Cart.Itinerary.HasFlight) {
                var itin = repo.Cart.Itinerary,
                    isCartPage = (as.rTWRS.trackingPageMapping.isInCartPage(repo.pageid)),
                    itinEvent = (isCartPage) ? _riTrack.createItinerarySelect(as.rTWRS.getCustomerId(), undefined) : _riTrack.createItineraryPurchase(as.rTWRS.getCustomerId(), undefined);

                itinEvent.setItinerary(as.rTWRS.getItinerary(itin));
                itinEvent.addOptionalData("SeatsRemaining", itin.SeatsRemaining);
                if (isCartPage) {
                    itinEvent.trackItinerarySelect(as.rTWRS.analytics.trackEvent("Id204_TrackItinerarySelect", (as.rTWRS.getCustomerId() !== undefined) ? "Yes" : "No"));
                }
                else {
                    itinEvent.trackItineraryPurchase(as.rTWRS.analytics.trackEvent("Id205_TrackItineraryPurchase", (as.rTWRS.getCustomerId() !== undefined) ? "Yes" : "No"));
                }
                as.rTWRS.log('Responsys TWRS itinerary ' + ((isCartPage) ? 'select' : 'purchase') + ' event data : ', itinEvent.getJSON());
            }
            if (hasASPageRepo
                && as.rTWRS.trackingPageMapping.isInSignOutPage(repo.pageid)) {
                _riTrack.invalidateSession();
                as.rTWRS.analytics.trackEvent("TrackSignOut", "Yes");
                as.rTWRS.log('Responsys TWRS user session invalidated due sign-out activity');
            }
        },
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
        },
        getItinerary: function (itinModel) {
            var itinerary = _riTrack.createItinerary(itinModel.Type, itinModel.Recloc, itinModel.FareType, itinModel.TotalFare, itinModel.Miles, itinModel.Distance, itinModel.Duration);
            for (var i = 0; i < itinModel.ItinerarySlices.length; i++) {
                var tSlice = _riTrack.createSlice(),
                        segments = itinModel.ItinerarySlices[i].SliceSegments;

                for (var j = 0; j < segments.length; j++) {
                    var tLeg = _riTrack.createLeg(),
                            seg = segments[j];

                    tLeg.setSegmentNumber(seg.SegmentNumber);
                    tLeg.setSegmentTimeLength(seg.Duration);
                    tLeg.setOriginAirport(seg.DepartureStationCode);
                    tLeg.setOriginAirportName(seg.DepartureStationName);
                    tLeg.setDestAirport(seg.ArrivalStationCode);
                    tLeg.setDestAirportName(seg.ArrivalStationName);
                    tLeg.setMktgCarrier(seg.MarketingCarrierCode);
                    tLeg.setIATAAirlineDesig(null);
                    tLeg.setMktgCarrierNumber(seg.FlightNumber);
                    tLeg.setOptCarrier(seg.OperatingCarrierCode);
                    tLeg.setIATAOptDesig(null);

                    tLeg.setOrigLocalDate(seg.DepartureStationDate);
                    tLeg.setOriginLocalTime(seg.DepartureStationTime);
                    tLeg.setOriginTimezone(seg.DepartureStationUTCTimeOffset);

                    tLeg.setDestLocalDate(seg.ArrivalStationDate);
                    tLeg.setDestLocalTime(seg.ArrivalStationTime);
                    tLeg.setDestTimezone(seg.ArrivalStationUTCTimeOffset);

                    tLeg.setOrigDate(seg.DepartureStationLocalDate);
                    tLeg.setOrigTime(seg.DepartureStationLocalTime);

                    tLeg.setDestDate(seg.ArrivalStationLocalDate);
                    tLeg.setDestTime(seg.ArrivalStationLocalTime);

                    tLeg.setEquipment(seg.Equipment);

                    tSlice.addLeg(tLeg);
                }
                itinerary.addSlice(tSlice);
            }
            return itinerary;
        }
    };
}

var _custIDCookieName = "riTrack_CustomerID",
    _riAccountCode = as.ResponsysTWRSAccount;

function _riInit() {
    _riTrack = riTrack.init(_riAccountCode);
    _riTrack.setCustIDCookieName(_custIDCookieName);

    as.rTWRS.analytics.trackVisitor();

    if (as.ResponsysCustContactId !== "") {
        _riTrack.setCustomer(as.ResponsysCustContactId);
    }

    as.rTWRS.log('Responsys TWRS code initialized for account id : ' + as.ResponsysTWRSAccount);
    as.rTWRS.log('Responsys TWRS - Customer ContactId  : ' + as.rTWRS.getCustomerId());

    as.rTWRS.trackEvents();
}
