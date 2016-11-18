function JennLoader() {
    var _me = this;

    var launchTime = '';

    this.loadAndLaunch = function () {
        _me.load();
        _launch();
        try {
            launchTime = new Date().getTime();
            sessionStorage.setItem('jennlaunchtime', launchTime);
            sessionStorage.setItem('jennlaunched', 'true');
        } catch (e) { }
    }

    this.loadIfWasLaunched = function () {
        try {
            if (sessionStorage.getItem('jennlaunched') === 'true') {
                launchTime = sessionStorage.getItem('jennlaunchtime')
                _me.load();
            }
        } catch (e) { }
    }


    this.load = function () {
        // Use prod defaults if no overrides set
        var nitScriptPath = (typeof window.nitScriptPath !== 'undefined') ? window.nitScriptPath :
            '/NIT.Alaska.Cdn.min.js';
        var nitStylePath = (typeof window.nitStylePath !== 'undefined') ? window.nitStylePath :
            '/NIT.WebJenn.min.css';
        var nitProdDomain = (typeof window.nitProdDomain !== 'undefined') ? window.nitProdDomain :
            '276a5257eb3da1dd4554-091acd6e9d984fde7523e1bfe3609124.ssl.cf1.rackcdn.com';

        var PROD_LAUNCH_SCRIPT = 'https://' + nitProdDomain + nitScriptPath
        var TEST_DOMAIN = '28329d082540cabbc469-daa0bf0bea975e9cac1df2ab504bdfde.ssl.cf1.rackcdn.com';
        var TEST_LAUNCH_SCRIPT_PATH = '/NIT.Alaska.Cdn.min.js';
        var TEST_STYLE_PATH = '/NIT.WebJenn.min.css';
        var TEST_LAUNCH_SCRIPT = 'https://' + TEST_DOMAIN + TEST_LAUNCH_SCRIPT_PATH;

        if (typeof ActiveAgent_LaunchJenn === 'function') {
            return;
        }

        var parent = document.getElementsByTagName('head')[0];

        var scriptUrl = '';
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'text/javascript');
        scriptTag.setAttribute('language', 'javascript');

        var linkUrl = '';
        var linkTag = document.createElement('link');
        linkTag.setAttribute('rel', 'stylesheet');
        linkTag.setAttribute('type', 'text/css');

        if (window.location.search.toLowerCase().indexOf("debug") > -1) {
            window.nitWebJennDomain = 'jenn-test.insideaag.com';
            launchTime = '';
            scriptUrl = TEST_LAUNCH_SCRIPT;
            linkUrl = 'https://' + TEST_DOMAIN + TEST_STYLE_PATH;
        } else {
            scriptUrl = PROD_LAUNCH_SCRIPT;
            linkUrl = 'https://' + nitProdDomain + nitStylePath;
        }

        scriptTag.setAttribute('src', scriptUrl + '?' + launchTime);
        linkTag.setAttribute('href', linkUrl);
        if (linkUrl != '') parent.appendChild(linkTag);
        if (parent) parent.appendChild(scriptTag);
    }

    function _launch() {
        if (typeof ActiveAgent_LaunchJenn === 'function') {
            ActiveAgent_LaunchJenn();
        } else {
            setTimeout(_launch, 100);
        }
    }
}

// Add to as.com scripts which will load Jenn
if (typeof (as) !== "undefined" && as.IsJennDown === false) {
    as.jennLoader = new JennLoader();
}
