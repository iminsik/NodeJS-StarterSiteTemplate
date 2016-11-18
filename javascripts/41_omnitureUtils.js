var omniUtils = {
    console: window.console || { log: function () { return; }, dir: function () { return; } },
    debug: ((typeof (window.as) != "undefined" && as.hasOwnProperty("Environment")) ? as.Environment : '') != 'prod'
};

$(document).ready(function () {
    if (typeof (jQuery) != "undefined") {
        $("a[data-track-link], input[data-track-link], div[data-track-link]").each(function () {
            var $self = $(this),
                linkData = ($self.attr("data-track-link") != "") ? unescape($self.attr("data-track-link")) : "";

            if (linkData != "") {
                $self.click(function () {
                    var $self = $(this),
                        linkData = (window.JSON) ? JSON.parse(unescape($self.attr("data-track-link"))) : "",
                        pageId = (typeof (window.as) != "undefined" && as.hasOwnProperty("Page")) ? as.Page.pageid : '',
                        s = window.s,
                        href = $self.attr("href"),
                        isUnobtrusiveSameDomain = (linkData.hasOwnProperty("isUnobtrusiveSameDomain") && linkData.isUnobtrusiveSameDomain != "") ? linkData.isUnobtrusiveSameDomain : "";

                    if (linkData != "" && s != "undefined" && (pageId == "reservation" || pageId == "viewpnr")) {
                        var data = [];

                        data.push(pageId);

                        if (linkData.hasOwnProperty("section"))
                            data.push(linkData.section);

                        if (linkData.hasOwnProperty("linkName"))
                            data.push(linkData.linkName);

                        // currently unobtrusive-ness is identified by the dev by looking at the domain name
                        if (href != "" && isUnobtrusiveSameDomain == "true") {
                            var verifyDomain = document.createElement("a");
                            verifyDomain.href = $self.attr("href");

                            var isASDomain = (verifyDomain.hostname.indexOf('alaskaair.com') > 1) ? true : false;

                            if (isASDomain && href.indexOf('?') > -1) {
                                $self.attr("href", href + "&lid=" + escape(data.join(':')));
                                return true;
                            }
                            else if (isASDomain && href.indexOf('?') < 0) {
                                $self.attr("href", href + "?lid=" + escape(data.join(':')));
                                return true;
                            }
                        }
                        // just trigger tracking image code for js handled and external anchor links (if not tracked, then set target="_blank" and make it to open in new tab)
                        s.linkTrackVars = 'prop16'; s.linkTrackEvents = 'None'; s.prop16 = data.join(':'); s.tl(this, 'o', data.join(':')); s.prop16 = '';
                    }
                });
            }

            if (omniUtils.debug && window.JSON && typeof console !== 'undefined') {
                omniUtils.console.log(JSON.parse(linkData));
            } else if (omniUtils.debug) {
                omniUtils.console.log(linkData);
            }
        });
    }
});

function trackeVar59(referrerLink) {
    if (s_gi) { var s = s_gi('alaskacom'); s.linkTrackVars = 'eVar59'; s.linkTrackEvents = 'None'; s.eVar59 = referrerLink; s.tl(this, 'o', referrerLink); s.eVar59 = ''; }
    if (omniUtils.debug) { omniUtils.console.log("eVar59 tracked for : " + referrerLink); }
}

function trackeVar60(referrerLink) {
    if (s_gi) { var s = s_gi('alaskacom'); s.linkTrackVars = 'eVar60'; s.linkTrackEvents = 'None'; s.eVar60 = referrerLink; s.tl(this, 'o', referrerLink); s.eVar60 = ''; }
    if (omniUtils.debug) { omniUtils.console.log("eVar60 tracked for : " + referrerLink); }
}
