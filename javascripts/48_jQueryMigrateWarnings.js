function jQueryMigrateWarnings(setting) {
    var _setting = {
        defaultEnv : 'dev',
        cookieKey : '!JQueryMigrate',
        turnOffUrl: '//www.alaskaair.com/home/jqmoff',
        wikiUrl: 'http://openwiki.insideaag.com/as.comdeveloperswiki/ow.asp?JqueryMigration',
    };

    _setting = $.extend(_setting, setting);

    this.init = function (environment) {
        //if (_getCookie(_setting.cookieKey) == '' && _setting.defaultEnv == environment) {
        //    _setCookie(_setting.cookieKey, 'true', 1);
        //}

        if (_getCookie(_setting.cookieKey).toLowerCase() !== 'true')
            return;

        if (jQuery && jQuery.migrateWarnings && jQuery.migrateWarnings.length > 0) {
            _announceResults(_skipIgnoredIssues(jQuery.migrateWarnings));
        }
    }

    this.insertScripts = function () {
        if (typeof jQuery.migrateWarnings == 'undefined') {
            var headTag = document.getElementsByTagName("head")[0];
            var jqTag = document.createElement('script');
            jqTag.type = 'text/javascript';
            jqTag.src = '//code.jquery.com/jquery-migrate-1.3.0.js';
            headTag.appendChild(jqTag);
        } 
    }

    function _skipIgnoredIssues(warnings) {
        var a = warnings.slice();
        a.splice($.inArray('jQuery.browser is deprecated', a), 1);
        return a;
    }

    function _announceResults(warnings) {
        if (warnings.length == 0)
            return;

        var ul = document.createElement('ul');
        var li;
        for (var i = 0; i < warnings.length; i = i + 1) {
            var a = document.createElement('a');
            a.setAttribute('href', 'https://github.com/jquery/jquery-migrate/blob/master/warnings.md');
            a.appendChild(document.createTextNode(warnings[i]));

            li = document.createElement('li');
            li.appendChild(a);

            ul.appendChild(li);
        }

        var a1 = document.createElement('a');
        a1.setAttribute('href', _setting.turnOffUrl);
        a1.appendChild(document.createTextNode('(click here to turn off)'));

        var a2 = document.createElement('a');
        a2.setAttribute('href', _setting.wikiUrl);
        a2.appendChild(document.createTextNode(' Example Wiki'));

        var advisoryHeader = document.createElement('div');
        advisoryHeader.setAttribute('style', 'font-weight:bold;margin-top:10px;font-size:16px;');
        advisoryHeader.appendChild(document.createTextNode('jQuery 1.11.3 migrate violations:'));
        advisoryHeader.appendChild(a1);
        advisoryHeader.appendChild(a2);

        var advisoryDiv = document.createElement('div');
        advisoryDiv.setAttribute('style', 'top:0;width:100%;z-index:1000;background-color: #ffffff;padding-left: 20px;');
        advisoryDiv.appendChild(advisoryHeader);
        advisoryDiv.appendChild(ul);
        document.querySelector('body').insertBefore(advisoryDiv, document.querySelector('div'));
    }

    function _getCookie(cookieName) {
        var i, c, len,
          nameEQ = cookieName + '=',
          cookies = document.cookie.split(';');
        for (i = 0, len = cookies.length; i < len; i = i + 1) {
            c = cookies[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }

        return '';
    };

    function _setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? '' : ';domain=' + document.domain + ';path=/; expires=' + exdate.toGMTString());
        document.cookie = c_name + '=' + c_value;
    }
}
