var KeyCodeEnter = 13;
var KeyCodeSpace = 32;

(function ($) {

    var show = $.fn.show;
    $.fn.show = function () {
        var ret = show.apply(this, arguments);
        var id = $(this).attr('id');
        if (id !== 'divFormFiller' && id !== 'iFiller' && id !== 'interstitial')
        {
            $(this).attr("aria-hidden", "false");
        }
        return ret;
    };

    var hide = $.fn.hide;
    $.fn.hide = function () {
        var ret = hide.apply(this, arguments);
        var id = $(this).attr('id');
        if (id !== 'interstitial') {
            $(this).attr("aria-hidden", "true");
        }
        return ret;
    };


})(jQuery);

function IsEnterKey(e) {
    var isEnter = false;
    if (GetKeyCode(e) == KeyCodeEnter) {
        isEnter = true;
    }
    return isEnter;
}

function GetKeyCode(e) {
    var keyID = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
    return keyID;
}

var asglobal = window.asglobal || {};

asglobal.getUrl = function (relativeUrl) {
    if (this.homePageUrl.indexOf('/', this.homePageUrl.length - 1) !== -1)
        return "//" + this.homePageUrl + relativeUrl;
    else
        return "//" + this.homePageUrl + "/" + relativeUrl;
};

SetDomainVariables();

function SetDomainVariables() {
    SetDomainUrl();
    //asglobal.domainIsSet is assigned value in an inline javascript code in Header.xslt
    if(asglobal.domainIsSet != null && asglobal.domainIsSet == false){
        SetDomain();
    }

    function SetDomain() {
        var domain = window.location.hostname.replace('www.', '');
        try {
            document.domain = domain; // This is for cross domain communication for Jenn and iSeatz's iFrames
            asglobal.domain = domain; //remember valid domain
        }
        catch (e) {
        //some iframe communication with parent window might fail but should not prevent other javascript code from working
        }
    }

    function SetDomainUrl() {

        asglobal.domainUrl = GetDomainUrl(GetHomePageUrl());

        function GetDomainUrl(homePageUrl) {
            var domainUrl = 'www.alaskaair.com'; //default, could different if spanish or another language
            var http = 'http://';
            var https = 'https://';
            //get domain url, it is home page url without the protocol
            if (homePageUrl != null && homePageUrl != '') {
                if (homePageUrl.indexOf(http) == 0) {
                    domainUrl = homePageUrl.replace(http, '');
                }
                else if (homePageUrl.indexOf(https) == 0) {
                    domainUrl = homePageUrl.replace(https, '');
                }
                else {
                    if (document.domain != homePageUrl.replace('www.', '')) {
                        if (document.location.hostname == homePageUrl) {
                            domainUrl = homePageUrl;
                        }
                    }
                }
            }
            return domainUrl;
        }

        function GetHomePageUrl() {
            var ENGLISH_MAINSITE_URL = 'www.alaskaair.com';
            var EASYBIZ_URL = 'easybiz.alaskaair.com';
            var SPANISH_SITE_URL = 'alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com';
            var homePageUrl = '';

            //get from logo
            var $homeLink = $('#aslogo a');
            if ($homeLink.length > 0) {
                var logoUrl = $homeLink.eq(0).attr('href').toLowerCase();
                if (logoUrl.indexOf(ENGLISH_MAINSITE_URL) > -1) {
                    homePageUrl = ENGLISH_MAINSITE_URL;
                }
                else if (logoUrl.indexOf(EASYBIZ_URL) > -1) {
                    homePageUrl = EASYBIZ_URL;
                }
                else if (logoUrl.indexOf(SPANISH_SITE_URL) > -1) {
                    homePageUrl = SPANISH_SITE_URL;
                }
                else {
                    homePageUrl = logoUrl.split("?")[0];
                }
                asglobal.logoUrl = logoUrl;
            }
            else {
                if (window.location.toString().indexOf(SPANISH_SITE_URL) > -1) {
                    homePageUrl = SPANISH_SITE_URL + '/';
                }
            }
            if(homePageUrl == null || homePageUrl == ''){
                homePageUrl = ENGLISH_MAINSITE_URL;
            }
            asglobal.homePageUrl = homePageUrl; //remember home page url, could be handy in some other places
            return homePageUrl;
        }
    }
}


$(document).ready(function () {

    // Setting focus on error message - fix for global Accessibility issue.
    var validationSummary = $('.errorTextSummary:first').eq(0);
    if (validationSummary) {
        if(validationSummary.css('display') != 'none')
            validationSummary.focus();
                }

    // Change href for "skip to main content" link for pages having left navigation
    var infoContentMain = $('.infoContentMain:first').get(0);
    if (infoContentMain) {
        var skipLink = $('#skip a');
        skipLink.attr('href', '#infoContentMain');
    }

    var contentMain = $('.contentMain:first').get(0);
    if (contentMain) {
        $('.contentMain:first').attr('id', 'content');
    }

});

$(document).ready(function () {

    var COOKIENAME = "ASUpgradeBrowserNotification";
    var COOKIEMESSAGE = "EXPIRES IN ONE DAY";

    var cookieExists = readCookie(COOKIENAME);

    //if cookie exists (meaning user has seen the notification today at least once already and closed it), then don't display the message again
    if (!cookieExists) {

        var div = document.createElement("div");
        div.innerHTML = "<!--[if lte IE 9]><i></i><![endif]-->";
        var isIe9OrLower = (div.getElementsByTagName("i").length === 1);

        if (isIe9OrLower) {
            $.ajax({
                url: '//' + asglobal.domainUrl + '/content/partial/upgrade-browser',
                cache: false,
                success: function (data) {

                    if (data.toLowerCase().indexOf("this page has taken off") === -1) {
                        $('body').append(data);

                        // Bind events
                        $('#upgradeContinue').bind('click', function () {

                            $.closeEzPopoups(false);
                            createCookie(COOKIENAME, COOKIEMESSAGE, 1); //1 = 1 day = 1440 mins
                        });

                        $('#upgradeNow').bind('click', function () {

                            $.closeEzPopoups(true);
                            createCookie(COOKIENAME, COOKIEMESSAGE, 1); //1 = 1 day = 1440 mins
                            var url = 'https://' + asglobal.domainUrl + '/content/about-us/site-info/browser-info.aspx';
                            window.location.replace(url);
                        });
                    }

                    $('#upgradeBrowser').showLightBox({
                        width: 600,
                        height: 230,
                        onClose: function () {
                            createCookie(COOKIENAME, COOKIEMESSAGE, 1); //1 = 1 day = 1440 mins
                        }
                    }).show();

                    $('#upgradeBrowser').attr('tabindex', '0').focus();
                },
                error: function () {
                    createCookie(COOKIENAME, COOKIEMESSAGE, 1); //1 = 1 day = 1440 mins
                }
            });
        }
    }
});

function getVersion(browserName) {
    var ua = window.navigator.userAgent;
    var nameIndex = ua.search(browserName);

    if (browserName === "MSIE") {
        var slashAfterNameIndex = ua.indexOf(" ", nameIndex); //find the index of the space directly after the browser name for IE
    } else {
        var slashAfterNameIndex = ua.indexOf("/", nameIndex); //find the index of the slash directly after the browser name
    }

    return ua.substring(slashAfterNameIndex + 1, ua.indexOf(".", nameIndex)); //take the substring between that slash and the next dot
}

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

$("[data-persist-by-date]").each(function () {
	var self = $(this),
		persistByDate = $(this).data("persist-by-date");

	if (persistByDate === '') {
		return;
	}

	var dateNow = new Date();
		dateCheck = new Date(persistByDate);
});
