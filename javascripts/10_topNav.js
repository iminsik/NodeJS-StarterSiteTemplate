function TopNav() {
    var _me = this;

    this.init = function () {
        _showLanguageLink();  // show english or spanish link
    }

    this.jumpToSpanishUrl = function () {
        location.href = _me.toSpanishUrl(location.href);
    }

    this.jumpToEnglishUrl = function () {
        location.href = _me.toEnglishUrl(location.href);
    }

    this.toEnglishUrl = function (spanishUrl) {
        if (!spanishUrl)
            return "http://www.alaskaair.com";
        return spanishUrl.replace("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com", "//www.alaskaair.com");
    }

    this.toSpanishUrl = function (englishUrl) {
        if (!englishUrl)
            return "http://alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com";
        return englishUrl.replace("//www.alaskaair.com", "//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com");
    }

    function _showLanguageLink() {
        if (location.hostname.toString() == 'alaskaair.convertlanguage.com') {
            if ($('#enEspanol'))
                $('#enEspanol').css('display', 'none');
            if ($('#english'))
                $('#english').css('display', 'block');
        }
    }
}

var as = window.as || {};

as.topNav = new TopNav();

$(document).ready(function () {
    as.topNav.init();

    // Set tabindex on target of Skip To Content link so IE knows it are focusable, and so Webkit browsers will focus() them (see below)
    $('#content').attr('tabindex', -1);

    // If there is a '#' in the URL (someone linking directly to a page with an anchor), set focus to that section (needed by Webkit browsers)
    if (document.location.hash && document.location.hash !== '#' && document.location.hash[1] !== '?') {
        var myAnchor = document.location.hash;
        setTimeout(function () {
            $(myAnchor).focus();
        }, 100);
    }
    // Set focus to targets of in-page links when clicked (needed by Webkit browsers)
    $("a[href^='#']").click(function (event) {
        var clickAnchor = this.href.split('#')[1];
        if (clickAnchor !== undefined && clickAnchor !== '') {
            setTimeout(function () {
                $("#" + clickAnchor).focus();
            }, 100);
        }
    });
});
