function BoxDropDown(containerId, labelId, dropDownId, arrowId) {
    var _me = this;
    var _containerId = containerId;
    var _dropDownId = dropDownId;
    var _labelId = labelId;
    var _arrowId = arrowId;
    var _boxClass = "myAccountLabelWhiteBoxVisible";

    this.initForClick = function () {
        if ($('#' + _labelId).length) {
            $('#' + _labelId).click(function (e) {
                _me.toggle();
            });
        }
        if ($('#' + _containerId).length) {
            $('#' + _containerId).click(function (e) {
                e.stopPropagation();
            });
        }

        $(document).click(function (e) {
            _me.close();
        });

        // set up for sign in interstitial
        if ($('#myAccoutnSignInButton').length) {
            $('#myAccoutnSignInButton').click(function (e) {
                if ($('#greyInterstitialCover').length) {
                    $("#greyInterstitialCover").css("display", "block")
                }
            });
        }
    }

    this.initForHover = function () {
        if ($('#' + _containerId).length) {
            $('#' + _containerId).hover(function (e) {
                _me.toggle();
            });
        }
    }

    this.toggle = function () {
        var display = $('#' + _dropDownId).css('display');

        if (display == 'block') {
            display = 'none';
            if ($('#' + _arrowId).length) {
                $('#' + _arrowId).html('&#x25ba;&nbsp;');
            }
        }
        else {
            display = 'block';
            if ($('#' + _arrowId).length) {
                $('#' + _arrowId).html('&#x25bc;&nbsp;');
            }
            if ($('#greyInterstitialCover').length) {
                $("#greyInterstitialCover").css("display", "none");
            }
        }

        $('#' + _dropDownId).css('display', display);

        if ($('#' + _labelId).hasClass(_boxClass)) {
            $('#' + _labelId).removeClass(_boxClass);
        }
        else {
            $('#' + _labelId).addClass(_boxClass);
            $('#UserId').focus();
        }
    }

    this.close = function () {        
        $('#' + _dropDownId).css('display', 'none');
        if ($('#' + _arrowId).length) {
            $('#' + _arrowId).html('&#x25ba;&nbsp;');
        }
        $('#' + _labelId).removeClass(_boxClass);
    }
}

function Authentication() {
    this.init = function () {
        if ($('#myAccount').length) {
            new BoxDropDown("myAccount", "myAccountLabel", "myAccountDropDownDiv", "myAccountArrow").initForClick();
        }
        else if ($('#myAccountMenu').length) {
            new BoxDropDown("myAccountMenu", "myAccountLabel", "myAccountDropDownDiv", null).initForHover();
        }

        // need to set this so that the sign in webform won't throw up for dynamic browser check
        _setCookie("ASDBD", "J1C1", 1);        
    }

    this.forgotUserId = function (url) {
        _openWindowCenter(url, 'forgotuserid', '475', '425');
    }

    this.forgotPassword = function (url) {
        _openWindowCenter(url, 'forgotpassword', '475', '425');
    }

    function _setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : "; path=/; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }

    function _openWindowCenter(url, title, w, h) {
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        var features = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, '
        + 'copyhistory=no, ' + 'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left;

        var targetWin = open(url, title, features);
    }
}

as.authentication = new Authentication();

$(document).ready(function () {
    as.authentication.init();
});


$(function () {
    $('#myAccount input').keydown(function (e) {
        if (e.keyCode == 13) {           
            if ($('#greyInterstitialCover').length) {
                $("#greyInterstitialCover").css("display", "block")
            }
            $(this).parents('form').submit();
            return false;
        }
    });
});
