
function AdaraPagePixelClass() {

    var tagUtil = new TagUtil(window.location);

    var pixelAndConditions = [
                {
                    condition: tagUtil.isPage_Home,
                    pixelUrl: [
                        '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=hm&u=' + as.ResponsysCustContactId,
                        '//tag.yieldoptimizer.com/ps/sync?t=i&p=1194&w=false&r=1',
                        '//tag.yieldoptimizer.com/ps/sync?t=i&p=1194&w=false&r=2',
                        '//tag.yieldoptimizer.com/ps/sync?t=i&p=1194&w=false&r=3'
                    ]
                }, {
                    condition: function () {
                        return tagUtil.isPage_Loyalty()
                            && this.isVisitorObjectAvailable();
                    },
                    pixelUrl: function () {
                        var pixelUrls =
                        [
                            '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=lyl&mlplv='
                            + (visitor.tier != null ? visitor.tier : '')
                            + '&sub='
                            + (visitor.hasInsiderSubscription != null ? visitor.hasInsiderSubscription : '')
                            + '&u='
                            + (as.ResponsysCustContactId != null ? as.ResponsysCustContactId : '')
                        ];
                        this.generateSyncPixels(3).then(function (url) { pixelUrls.push(url); });
                        return pixelUrls;
                    }
                },
                {
                    condition: function () {
                        return tagUtil.isPage_Loyalty_Booking()
                            && this.isVisitorObjectAvailable();
                    },
                    pixelUrl: function () {
                        var pixelUrls =
                        [
                            '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=lyl_bk&mlplv='
                            + (visitor.tier != null ? visitor.tier : '')
                            + '&sub='
                            + (visitor.hasInsiderSubscription != null ? visitor.hasInsiderSubscription : '')
                            + '&u='
                            + (as.ResponsysCustContactId != null ? as.ResponsysCustContactId : '')
                        ];
                        this.generateSyncPixels(3).then(function (url) { pixelUrls.push(url); });
                        return pixelUrls;
                    }
                }, {
                    condition: function () {
                        return tagUtil.isPage_ShoppingPath_Flight()
                            && this.isVisitorObjectAvailable()
                            && this.isFlightInfoAvailable();
                    }, //TO
                    pixelUrl: function () {
                        var flightInfo = this.getFlightInfo();
                        var pixelUrls =
                        [
                            '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=spth'
                            + '&soac='
                            + flightInfo.DepartureAirportCode //Origin Airport
                            + '&sdac='
                            + flightInfo.ArrivalAirportCode //Destination Airport
                            + '&sdpdt='
                            + flightInfo.DepartureDate //Searched departure date
                            + '&srdt='
                            + flightInfo.ReturnDate //Searched return date (If it exists)
                            + '&snopas='
                            + flightInfo.TravelersCount //Searched number of passengers
                            + '&mlplv='
                            + (visitor.tier != null ? visitor.tier : '') //Searched mileage plan tier
                            + '&u='
                            + (as.ResponsysCustContactId != null ? as.ResponsysCustContactId : '') //Hashed user id.
                            + '&mlpbal='
                            + visitor.mileagePlanBalance
                            //TODO: Do we need mileage plan balance?
                        ];
                        this.generateSyncPixels(3).then(function (url) { pixelUrls.push(url); });
                        return pixelUrls;
                    }
                }, {
                    condition: function () {
                        return tagUtil.isPage_ShoppingPath_Cart_Flight()
                            && this.isVisitorObjectAvailable()
                            && this.isFlightInfoAvailable();
                    }, //TO
                    pixelUrl: function () {
                        var flightInfo = this.getFlightInfo();
                        var pixelUrls =
                        [
                            '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=spth_crt'
                            + '&soac='
                            + flightInfo.DepartureAirportCode //Origin Airport
                            + '&sdac='
                            + flightInfo.ArrivalAirportCode //Destination Airport
                            + '&sdpdt='
                            + flightInfo.DepartureDate //Searched departure date
                            + '&srdt='
                            + flightInfo.ReturnDate //Searched return date (If it exists)
                            + '&snopas='
                            + flightInfo.TravelersCount //Searched number of passengers
                            + '&mlplv='
                            + (visitor.tier != null ? visitor.tier : '') //Searched mileage plan tier
                            + '&u='
                            + (as.ResponsysCustContactId != null ? as.ResponsysCustContactId : '') //Hashed user id.
                            + '&mlpbal='
                            + visitor.mileagePlanBalance
                            //TODO: Do we need mileage plan balance?
                        ];
                        this.generateSyncPixels(3).then(function (url) { pixelUrls.push(url); });
                        return pixelUrls;
                    }
                }, {
                    condition: function () {
                        return tagUtil.isPage_ShoppingPath_Confirmation()
                            && this.isVisitorObjectAvailable()
                            && this.isFlightInfoAvailable();
                    }, //TO
                    pixelUrl: function () {

                        var flightInfo = this.getFlightInfo();
                        var pixelUrls =
                        [
                            '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=cfm'
                            + '&boac='
                            + flightInfo.DepartureAirportCode //Origin Airport
                            + '&bdac='
                            + flightInfo.ArrivalAirportCode //Destination Airport
                            + '&bdpdt='
                            + flightInfo.DepartureDate //Searched departure date
                            + '&brdt='
                            + flightInfo.ReturnDate //Searched return date (If it exists)
                            + '&bnopas='
                            + flightInfo.TravelersCount //Searched number of passengers
                            + '&bsv='
                            + as.Page.CP.inCart //TODO: Add the booked services here.
                            + '&fopmt='
                            + as.Page.PP.fop //TODO: Add the form of payment here.
                            + '&bamt='
                            + as.Page.Cart.Itinerary.Revenue //TODO: Add the Revenue HERE
                            + '&mlplv='
                            + (visitor.tier != null ? visitor.tier : '') //Searched mileage plan tier
                            + '&u='
                            + (as.ResponsysCustContactId != null ? as.ResponsysCustContactId : '')
                            + '&mlpbal='
                            + visitor.mileagePlanBalance //Hashed user id.
                        ];
                        this.generateSyncPixels(3).then(function (url) { pixelUrls.push(url); });
                        return pixelUrls;
                    }
                }
    ];

    var defaultPreconditions = function () {
        var x = new VisitorRepository();
        x.PopulateVisitor();
        return as && as.tagUtil;
    }

    var self = this;

    self.generateSyncPixels = function (n) {
        var asUtils = asFrameworkUtils;
        var tempArray = new Array();
        for (var i = 1; i <= n; i++) {
            tempArray.push('//tag.yieldoptimizer.com/ps/sync?t=i&p=1194&w=false&r=' + i);
        }
        return new asUtils.SyncPromise(tempArray).each();
    };

    self.isVisitorObjectAvailable = function () {
        return typeof (visitor) !== "undefined"
            && visitor != null;
    };

    self.reformatStringDate4Adara = function (sDate) {
        var date = new Date(sDate);
        return sDate ? date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() : '';
    };

    self.isFlightInfoAvailable = function () {
        return as.Page
            && (
                as.Page.Cart
                    && as.Page.Cart.Itinerary
                    && as.Page.Cart.Itinerary.HasFlight
                    && as.Page.Cart.Itinerary.ItinerarySlices
                    && as.Page.Cart.Itinerary.ItinerarySlices.length > 0
                    && as.Page.Cart.Itinerary.ItinerarySlices[0].SliceSegments
                    && as.Page.Cart.Itinerary.ItinerarySlices[0].SliceSegments.length > 0
                    || as.Page.ShoppingSearch
                    && as.Page.ShoppingSearch.CityPairSlices
                    && as.Page.ShoppingSearch.CityPairSlices.length > 0);
    };

    self.isBookedServicesAvailable = function () {
        return as.Page
            && as.Page.CP
            && as.Page.CP.inCart;
    };

    self.isFormOfPaymentAvailable = function () {
        return as.Page
            && as.Page.PP
            && as.Page.PP.fop;
    };

    self.isRevenueAvailable = function () {
        return as.Page
            && as.Page.Cart
            && as.Page.Cart.Itinerary
            && as.Page.Cart.Itinerary.Revenue;
    };

    self.getFlightInfo = function () {
        var departureDate = null;
        var returnDate = null;
        var flightInfo = null;
        if (self.isFlightInfoAvailable() && as.Page.Cart) {
            var departureStartingSegment = as.Page.Cart.Itinerary.ItinerarySlices[0].SliceSegments[0];
            var departureEndingSegment = as.Page.Cart.Itinerary.ItinerarySlices[0].SliceSegments[as.Page.Cart.Itinerary.ItinerarySlices[0].SliceSegments.length - 1];
            var returningFlightSegment = as.Page.Cart.Itinerary.ItinerarySlices.length > 1 ?
                as.Page.Cart.Itinerary.ItinerarySlices[as.Page.Cart.Itinerary.ItinerarySlices.length - 1]
                .SliceSegments[as.Page.Cart.Itinerary.ItinerarySlices[as.Page.Cart.Itinerary.ItinerarySlices.length - 1].SliceSegments.length - 1] : null;
            departureDate = departureStartingSegment ? self.reformatStringDate4Adara(departureStartingSegment.DepartureStationDate) : '';
            returnDate = returningFlightSegment ? self.reformatStringDate4Adara(returningFlightSegment.DepartureStationDate) : '';
            flightInfo = {
                DepartureAirportCode: departureStartingSegment.DepartureStationCode,
                ArrivalAirportCode: departureEndingSegment.ArrivalStationCode,
                DepartureDate: departureDate,
                ReturnDate: returnDate,
                TravelersCount: as.Page.Cart.Itinerary.PassengersCount
            };
        } else if (self.isFlightInfoAvailable() && as.Page.ShoppingSearch) {
            var outgoingFlightInfo = as.Page.ShoppingSearch.CityPairSlices[0];
            var lastSliceIdx = as.Page.ShoppingSearch.CityPairSlices.length - 1;
            var returningFlightInfo = as.Page.ShoppingSearch.CityPairSlices.length > 1 ? as.Page.ShoppingSearch.CityPairSlices[lastSliceIdx] : {};

            departureDate = outgoingFlightInfo ? self.reformatStringDate4Adara(outgoingFlightInfo.Date) : '';
            returnDate = returningFlightInfo ? self.reformatStringDate4Adara(returningFlightInfo.Date) : '';
            flightInfo = {
                DepartureAirportCode: outgoingFlightInfo.DepartureShort,
                ArrivalAirportCode: outgoingFlightInfo.ArrivalShort,
                DepartureDate: departureDate,
                ReturnDate: returnDate,
                TravelersCount: as.Page.ShoppingSearch.TravelersCount
            };
        }
        if (flightInfo) {
            flightInfo.bookedService = self.isBookedServicesAvailable() ? escape(as.Page.CP.inCart) : '';
            flightInfo.formOfPayment = self.isFormOfPaymentAvailable() ? escape(as.Page.PP.fop) : '';
            flightInfo.revenue = self.isRevenueAvailable() ? as.Page.Cart.Itinerary.Revenue : '';
        }
        return flightInfo;
    };

    self.BasePagePixel = function (pixelAndConditions, vendorName, defaultPreconditions) {
        var that = this;
        that.pixelAndConditions = pixelAndConditions;
        that.vendorName = vendorName;
        that.defaultPreconditions = defaultPreconditions;

        var insertPixel = function (url) {
            var img = document.createElement('img');
            img.setAttribute('alt', '');
            img.setAttribute('height', '1');
            img.setAttribute('width', '1');
            img.setAttribute('style', 'display: none;');
            img.setAttribute('src', url);
            document.body.appendChild(img);
        };

        that.isPath =
            // url -> no querystring
            function (url, isStrict) {
                if (!isStrict) {
                    return that.isTesting || (("//" + location.hostname + location.pathname).toLowerCase() == url.toLowerCase());
                }
                return that.isTesting || (("//" + location.hostname + location.pathname + location.search).toLowerCase() == url.toLowerCase());
            };


        that.conditionalInsertPixel = function () {
            var pixelLogic = pixelAndConditions;

            //Check to make sure that the vendor site is up.
            if (as != "undefined" && !as['Is' + vendorName + 'Down'] && (!defaultPreconditions || defaultPreconditions())) {
                for (var i in pixelLogic) {
                    if (pixelLogic[i].condition instanceof Function) {
                        if (pixelLogic[i].condition.call(that, that)) {
                            that.unpackUrl(pixelLogic[i].pixelUrl).then(insertPixel);
                        }
                    } else if (typeof pixelLogic[i].condition === 'string') {
                        if (that.isPath(pixelLogic[i].condition)) {
                            that.unpackUrl(pixelLogic[i].pixelUrl).then(insertPixel);
                        }
                    }
                }
            }
        };

        that.unpackUrl = function (pixelUrl) {
            var asUtils = asFrameworkUtils;
            if (pixelUrl instanceof Function) {
                var result = pixelUrl.call(that);
                if (result instanceof Array)
                    return new asUtils.SyncPromise(result).each();
                return new asUtils.SyncPromise();
            } else if (pixelUrl instanceof Array) {
                return new asUtils.SyncPromise(pixelUrl).each();
            } else {
                return new asUtils.SyncPromise(pixelUrl);
            }
        };
    };

    self.BasePagePixel(pixelAndConditions, 'Adara', defaultPreconditions);
};
