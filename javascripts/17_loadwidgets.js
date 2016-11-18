jQuery.fn.loadWidget = function (param) {
    var url = param.url;
    var containerSelector = param.containerSelector;
    var callback = param.callback;
    var localCallback = param.localCallback;
    var doPost = param.doPost != null ? param.doPost : false;
    var getOnce = param.getOnce != null ? param.getOnce : true;
    if (!getOnce || $(containerSelector).length === 0) {
        var me = $(this);
        if (doPost) {
            $.ajax({
                type: "POST",
                url: url,
                dataType: 'json',
                complete: function (response, textStatus) {
                    $(me).html(response.responseText);
                    if (callback != null) {
                        callback();
                    }
                    if (localCallback != null) {
                        localCallback();
                    }
                }
            });
        } else {
            $.get(url, function (data) {
                $(me).html(data);
                if (callback != null) {
                    callback();
                }
            });
        }
    } else {
        $(this).append($(containerSelector));
        callback();
    }
    return this;
};

jQuery.fn.loadVShoppingI = function (city) {
    var qs = BuildVShoppingQueryString(city, "?");
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    var url = protocol + asglobal.domainUrl + "/deals/flightformlet" + qs;
    this.html("<iframe scrolling='no' frameborder='0' src='" + url + "'" + " title='Shopping' id='flightsFormletIframe' style='width:212px;'></iframe>");
    return this;
};

jQuery.fn.loadAuctionPartialI = function (auctionParams) {
    var qs = BuildAuctionQueryString(auctionParams, "?");
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    var url = protocol + asglobal.domainUrl + "/auctions/auctionformlet" + qs;
    this.html("<iframe scrolling='no' frameborder='0' src='" + url + "'" + " title='Auctions' id='auctionFormletIframe' style='width:930px;height:450px'></iframe>");

    return this;
};


jQuery.fn.loadVAwardShoppingI = function (city) {
    var qs = BuildVShoppingQueryString(city, "&");
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    var url = protocol + asglobal.domainUrl + "/deals/flightformlet?shoppingmethod=onlineaward" + qs;
    this.html("<iframe scrolling='no' frameborder='0' src='" + url + "' title='Award Shopping' id='awardsFormletIframe' style='width:212px;'></iframe>");
    return this;
};

jQuery.fn.loadVShopping = function (onload, city) {
    var qs = BuildVShoppingQueryString(city, "&");
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    var url = protocol + asglobal.domainUrl + "/deals/flightformlet?njqry=yes" + qs;
    return $(this).loadWidget({ url: url, containerSelector: WidgetContainers.Selectors.V, callback: onload, doPost: true, localCallback: function () {
        try {
            vShopping.InitializeControls(); //vShopping is in VShopping.js
        }
        catch (e) {
            alert("reference to VShopping.js could be missing");
        }
    }
    });
};

function BuildVShoppingQueryString(city, prefix) {
    var qs = (city != null && city != "" ? "D=" + city : "");
    if (qs == "") {
        qs = window.location.search.substring(1);
        if (qs == null) { qs = ""; }
    }
    if (qs != "") { qs = prefix + qs; }
    return qs;
}


function BuildAuctionQueryString(params, prefix) {

    var qs = "";
    if (params != null && params != "") {

        qs = "ID=" + params.AuctionId;
        qs += "&SD=" + params.StartDate;
        qs += "&ED=" + params.EndDate;
        qs += "&MB=" + params.MinimumBid;
        qs += "&T=" + params.Title;
    }

    if (qs == "") {
        qs = window.location.search.substring(1);
        if (qs == null) { qs = ""; }
    }
    if (qs != "") { qs = prefix + qs; }
    return qs;
}

jQuery.fn.loadPBShopping = function (onload) {
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    return $(this).loadWidget({ url: protocol + asglobal.domainUrl + "/planbook/ShoppingWidget?njqry=yes", containerSelector: WidgetContainers.Selectors.P, callback: onload, doPost: true });
};

jQuery.fn.loadPBHotel = function (onload) {
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    return $(this).loadWidget({ url: protocol + asglobal.domainUrl + "/deals/hoteloffers/HotelFormlet?njqry=yes", doPost: false, getOnce: true, containerSelector: WidgetContainers.Selectors.H, callback: onload });
};

jQuery.fn.loadPBCar = function (onload) {
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    return $(this).loadWidget({ url: protocol + asglobal.domainUrl + "/planbook/CarWidget?njqry=yes", doPost: true, getOnce: false, containerSelector: WidgetContainers.Selectors.H, callback: onload });
};

function vacWidgetCallback(height) {
    $("#vacationFormletIframe").css({ height: height + 20 });
    $(document).scrollTop($(document).scrollTop());
}

function showTips(url, width) {
    var divId = "divLB";
    var divIdJQ = "#" + divId;
    if ($(divIdJQ).length == 0) {
        var html = "<div id='" + divId + "' style='display:none;overflow:auto;'></div>";
        $("body").append(html);
    }
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    $.get(protocol + url, function (data) {
        $(divIdJQ).html(data);
        $(divIdJQ + " img").hide();
        $(divIdJQ).showLightBox({ width: width }).show();
    });
}

var flightWidgetAF = new FlightWidgetAF();
function FlightWidgetAF() {
    this.ShowAboutCT = function () {
        var fareOptions = ',MILEAGEUPG,GOLDUPG,MVPUPG,GUESTUPG';
        if ($('#fareOptions').length > 0) {
            fareOptions = $('#fareOptions').val();
        }

        var drawer = new SideDrawer('Upgrade types', 'Upgrade types');
        drawer.Show();
        var drawerContent = document.createElement('div');
        $.get('//' + asglobal.domainUrl + '/shopping/flights/AboutFareOptions?options=' + fareOptions, function (data) {
            drawerContent.innerHTML = data;
            drawer.TransferContent(drawerContent);
        });
    };

    this.ShowAwardOptions = function () {
        var drawer = new SideDrawer('Award Options', 'Award Options');
        drawer.Show();
        var drawerContent = document.createElement('div');
        $.get('//' + asglobal.domainUrl + '/AwardAdvisory/AboutAwardOptions', function (data) {
            drawerContent.innerHTML = data;
            drawer.TransferContent(drawerContent);
        });

    };

    this.ShowAboutInfantCT = function () {
        var drawer = new SideDrawer('', '');
        drawer.Show();
        var drawerContent = document.createElement('div');
        var hiddenStyle = '<style type="text/css">.slideout-hidden {display:none}</style> ';  //workaround for adding css style to iframe so it takes effect.
        var infantData = '';
        $.get('//' + asglobal.domainUrl + '/content/travel-info/policies/traveling-with-lap-infants/_lap-infants', function (data) {
            infantData = data;
            $.get('//' + asglobal.domainUrl + '/content/travel-info/policies/children-infants-and-children/_common/_free-baggage', function (data) {
                drawerContent.innerHTML = hiddenStyle + infantData + data;
                drawer.TransferContent(drawerContent);
            });
        });

    };

    this.ShowAboutContractFares = function () {
        var contractFares_LB_Id = "contractFares_LB";
        var contractFares_LB_CSS = "#" + contractFares_LB_Id;
        if ($(contractFares_LB_CSS).length == 0) {
            $("body").append("<div id=" + contractFares_LB_Id + "></div>");
            var protocol = "http:";
            protocol = (top.location.protocol ? top.location.protocol : protocol) + "//";
            $.get(protocol + asglobal.domainUrl + "/shared/tips/aboutcompanyfares.aspx", function (data) {
                $(contractFares_LB_CSS).html(data);
                showLightBox();
            });
        }
        else {
            showLightBox();
        }
        function showLightBox() {
            $(contractFares_LB_CSS).showLightBox({ width: 300 }).show();
        }
    };

    this.ShowUMNROptions = function () {
        var umnrOptions_LB_Id = "umnrOptions_LB",
            umnrOptions_LB_CSS = "#" + umnrOptions_LB_Id;

        $(umnrOptions_LB_CSS).remove();

        $("body").append("<div id=" + umnrOptions_LB_Id + "></div>");
        $(umnrOptions_LB_CSS).html($("#flightsFormletIframe").contents().find("#divUMNR-container").clone().html());
        $("#divUMNR").show();
        $("#submitUMNRRequest").attr('onclick', '').undelegate();
        $("#divUMNR").delegate("#submitUMNRRequest", "click", wireUp);

        showLightBox();

        function showLightBox() {
            $(umnrOptions_LB_CSS).showLightBox({ width: 460 }).show();
        }

        function wireUp() {
            if (!$("#umnrYes").get(0).checked && !$("#umnrNo").get(0).checked) {
                $("#divNoRequiresUmnrService").show();
                return;
            }
            $("#flightsFormletIframe").contents().find("#umnrYes").get(0).checked = $("#umnrYes").get(0).checked;
            $("#flightsFormletIframe").contents().find("#umnrNo").get(0).checked = $("#umnrNo").get(0).checked;

            $("#flightsFormletIframe").contents().find("#submitUMNRRequest").click();
        }
    };
}

