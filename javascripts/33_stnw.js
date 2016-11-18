/*global as */
// --------------------
// stnw library / start
// --------------------

// (s)ession (t)imeout (n)otification (w)idget object
// this block of code is responsible for initilizing the object
// implementing the countdown and setting the internal status.
// *** the UI code that implements this library is responsible
// for managing the UI that needs to respond to this object ***

//  How to trigger the timer lightbox in a page
//  1. Expiration time in millisecond
//  2. Warning time in millisecond
//  3. RedirectURL: set RedirectURL an empty string, if you don't want to redirect.
//  4. Custom Message: set a custom function to as.stnw.Done_Message, if you want to set a specific message. Ex: as.stnw.Done_Message: function () { return 'your message'; }
//  Full example:
//  function stnw_init_page() {
//     as.stnw.timings.session_timeout_in_msec = 30 * 1000; // expires in 30 secs (Default: 20 mins)
//     as.stnw.timings.session_timeout_warning_happens_in_msec = 5 * 1000; // warning appears in 5 secs (Default: 19 mins 40 secs)
//     as.stnw.RedirectURL = 'https://www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?CurrentForm=UCSignInStart&advise=eSessionTimeout';
//  };

// as.IsSessionTimeoutDown = false; // Set it 'false' in your local testing

if (typeof (as) !== "undefined" && as.IsSessionTimeoutDown === false) {
    as.stnw = (function () {
        var stnw = {
            lastCoords: {},
            pageSourceType: {
                Standalone: 'Standalone',
                ConsideredAsPurchaseFunnel: 'ConsideredAsPurchaseFunnel',
                ConsideredAsViewReservation: 'ConsideredAsViewReservation',
                ConsideredAsAvailability: 'ConsideredAsAvailability',
                ConsideredAsReissueAvailability: 'ConsideredAsReissueAvailability'
            },
            pageSource: 'Standalone',
            nlastContinueClick: 0,
            nlastContinueClickCookie: 0,
            done_callback: function () { },
            timeoutStart: function () { },
            RedirectURL: '',
            UserType: 'Anonymous',
            ajaxTimeout: 3000,
            bForceStartTimer: false,
            UserTypeAndRedirectUrlEnum: {
                AnonymousUser: { UserType: 'Anonymous', RedirectURL: '' },
                MAAUser: { UserType: 'MAAUser', RedirectURL: 'https://www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?CurrentForm=UCSignInStart&advise=eSessionTimeout' },
                EZBUser: { UserType: 'EZBUser', RedirectURL: 'https://easybiz.alaskaair.com/signin?advise=eSessionTimeout' },
                EZBSuperUser: { UserType: 'EZBSuperUser', RedirectURL: '' },
                TravelAgent: { UserType: 'TravelAgent', RedirectURL: '' }
            },
            isLightboxOpen: false,
            configType: {
                Default: 'DEFAULT',
                Overridden: 'OVERRIDDEN'
            },
            isConfigSet: 'DEFAULT',
            isValidTimeout: true,

            Done_Message: function () {
                return 'Your session expired at <b>' + (new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")) + '</b>';
            },

            extendSession: function () {
                if (stnw.pageSource === stnw.pageSourceType.ConsideredAsPurchaseFunnel) {
                    var checkOutExtendedTimestamp = $('#CheckOutExtendedTimestamp');
                    if (checkOutExtendedTimestamp.length > 0 &&
                        (checkOutExtendedTimestamp.data('stale') === undefined || checkOutExtendedTimestamp.data('stale') === false)) {
                        $('#CheckOutExpirationTimestamp').val(checkOutExtendedTimestamp.val())
                        checkOutExtendedTimestamp.attr('data-stale', true);

                        $.ajax({
                            url: '//www.alaskaair.com/booking/signin/ExtendExpirationTimeout?t=' + (new Date()).getTime(),
                            success: function (data) {
                                if (data) {
                                    checkOutExtendedTimestamp.attr('data-stale', false).val(data);
                                }
                            }
                        });
                    }
                }
                if (stnw.pageSource === stnw.pageSourceType.ConsideredAsAvailability || stnw.pageSource === stnw.pageSourceType.ConsideredAsReissueAvailability) {
                   window.location.reload(true);
                }

				if (stnw.isValidTimeout === true) {
					$.ajax({
						url: '//www.alaskaair.com/services/v1/myaccount/getloginstatus?t=' + (new Date()).getTime(),
						success: function (data) {
							if (data.IsLoggedIn === false && stnw.bForceStartTimer === false) {
								stnw.done_callback();
							}
						},
						error: function (jqXHR, textStatus, errorThrown) {
							stnw.done_callback();
						},
						timeout: stnw.ajaxTimeout
					});
				}
            },

            showSessionTimeOutBox: function () {
                //show UI if warning time is reached.
                if (stnw.isValidTimeout === true && stnw.timings.warning_threshold_reached) {
                    // Prevent lightbox from blinking.
                    if ($('#sessionSection').css('display') === 'none') {
                        $('#sessionSection').showLightBox({
                            width: 460,
                            height: 215,
                            onClose: function () {
                                as.stnw.isLightboxOpen = false;
                                // Setting omniture tags
                                if (s_gi) {
                                    var s = s_gi('alaskacom');
                                    s.linkTrackVars = 'prop16';
                                    s.linkTrackEvents = 'None';
                                    s.prop16 = 'sessionExpiring::Close';
                                    s.tl(this, 'o', 'sessionExpiring::Close');
                                    s.prop16 = '';
                                }
                                as.stnw.setCookieByKey("nlastContinueClick", (parseInt(as.stnw.getCookieByKey("nlastContinueClick")) + 1).toString());
                                // We may refresh the page ... instead of stnw.continueSession();
                                if (typeof (stnw_reload_callback) === "function") {
                                    stnw_reload_callback();
                                }
                                else {
                                    as.stnw.extendSession(); // Extend Session
                                }
                            }
                        }).show();
                        $('#sessionSection').attr('tabindex', '0').focus();
                        as.stnw.isLightboxOpen = true;
                    }
                    // AS.COM/EASYBIZ Signout Signal
                    if (as.stnw.getCookieByKey('bSessionExpired') === true) {
                        stnw.isUserLoggedIn(null, as.stnw.done_callback);
                    }
                }
                else {
                    $('#sessionSection').hide();
                }
                $('#sessionTimeLeft').text(as.stnw.timeleft() + ' seconds');
            },

            init: function () {
                stnw.startTimer = function () {
                    var timer = {};

                    timer.is_settings_valid = function () {

                        if (typeof stnw.timings.session_timeout_in_msec !== 'number') {
                            console.log('Session timeout must be a positive number.');
                            return false;
                        }
                        if (stnw.timings.session_timeout_in_msec <= 0) {
                            console.log('Session timeout can\'t be zero or negative.');
                            return false;
                        }
                        if (typeof stnw.timings.session_timeout_warning_happens_in_msec !== 'number') {
                            console.log('Session timeout warning must be a positive number.');
                            return false;
                        }
                        if (stnw.timings.session_timeout_warning_happens_in_msec <= 0) {
                            console.log('Session timeout warning can\'t be zero or negative.');
                            return false;
                        }
                        if (stnw.timings.session_timeout_warning_happens_in_msec >= stnw.timings.session_timeout_in_msec) {
                            console.log('Session timeout warning must be smaller than Session timeout.');
                            return false;
                        }

                        return true;
                    };

                    timer.events = {
                        start: function () {
                            stnw.timings.countdown_started = new Date();   // start the countdown timer
                            // fire delayed event

                            var start = function () {
                                if (timer.is_settings_valid() == false) {
                                    return;
                                }
                                timer.events.check();
                                if (stnw.isValidTimeout === true && stnw.timings.session_has_timeedout == false) {
                                    setTimeout(start, stnw.timings.poll_time_in_msec);
                                }
                            };

                            start();
                        },
                        check: function () {
                            var elapsed_msec = stnw.timings.elapsed_in_msec();

                            // determine total percent complete, ie., ratio of 'elapsed time' to 'time session is active'
                            // UI will want to respond to this countdown
                            stnw.timings.total_countdown_percent_complete = Math.floor(100 * (elapsed_msec / stnw.timings.session_timeout_in_msec));

                            // determine warning percent complete, ie., ratio of 'elapsed time' to 'time to wait before warning'
                            // UI may want to respond to this countdown
                            stnw.timings.warning_countdown_percent_complete = Math.floor(100 * ((elapsed_msec - stnw.timings.session_timeout_warning_happens_in_msec) / (stnw.timings.session_timeout_in_msec - stnw.timings.session_timeout_warning_happens_in_msec)));

                            stnw.timings.count++;

                            var done = (elapsed_msec > stnw.timings.session_timeout_in_msec);
                            if (done) {
                                // finish and cleanup
                                stnw.timings.session_has_timeedout = true;

                                if (typeof stnw.done_callback !== 'undefined') {
									if (stnw.isValidTimeout === true) {
										stnw.done_callback();
									}
                                }
                            }

                            //raise callback so client can update its UI
                            if (typeof stnw.ui_update_callback !== 'undefined') {

                                stnw.timings.warning_threshold_reached = elapsed_msec >= stnw.timings.session_timeout_warning_happens_in_msec;
                                stnw.ui_update_callback(stnw.timings, done, stnw.timings.warning_threshold_reached);
                            }
                        }
                    };
                    timer.events.start();
                };

                stnw.setCookieByKey('bSessionExpired', true);

                var data = '<div id="sessionSection" style="display:none;" tabindex="-1"><h1 id="sessionExpiring">Session Expiring</h1><p id="sessionWillExpire" style="visibility:visible">Your session will expire in <span id="sessionTimeLeft"></span></p><p id="sessionKeepActive">To keep your session active, select Continue.</p><button id="sessionContinue" class="btn btn-green pull-right">CONTINUE</button></div>';
                $('body').append(data);

                // Bind events
                $('#sessionContinue').bind('click', function () {
                    $.hideLightBoxes();
                    $.hideFormFiller();

                    as.stnw.setCookieByKey('nlastContinueClick', (parseInt(as.stnw.getCookieByKey('nlastContinueClick')) + 1).toString());
                    // We may refresh the page ... instead of stnw.continueSession();
                    if (typeof (stnw_reload_callback) === "function") {
                        stnw_reload_callback();
                    }
                    else {
                        as.stnw.extendSession(); // Extend Session
                    }
                });

                //define callback to timer events
                stnw.ui_update_callback = function (timings, done, warning_time_met) {
                    // reset the Session, if 'Continue' button is hit in another tab.
                    if (as.stnw.nlastContinueClick < parseInt(as.stnw.getCookieByKey('nlastContinueClick'), 10)) {
                        if (as.stnw.isLightboxOpen) {
                            if ($.hideLightBoxes) {
                                $.hideLightBoxes();
                            }
                            if ($.hideFormFiller) {
                                $.hideFormFiller();
                            }
                        }
                        as.stnw.nlastContinueClick++;
                        as.stnw.continueSession();
                    }
                    else {
                        //show UI if warning time is reached.
                        if (stnw.timings.warning_threshold_reached) {
                            stnw.overrideSessionTimeAndRedirectURL(stnw.showSessionTimeOutBox);
                        } else {
                            $('#sessionSection').hide();
                        }
                    }
                };

                as.stnw.done_callback = function () {
                    $('#sessionExpiring').text('Session Expired').css({ color: 'red' });
                    $('#sessionKeepActive').css({ visibility: 'hidden' });
                    $('#sessionContinue').css({ visibility: 'hidden' });

                    $.ajax({
                        // This url will force the user to sign out.
                        url: '//www.alaskaair.com/services/v1/myaccount/logout',
                        type: 'POST',
                        data: { t: (new Date()).getDate() },
                        success: function () {
                            $('#sessionWillExpire').html(stnw.Done_Message());

                            if (stnw.pageSource === stnw.pageSourceType.ConsideredAsPurchaseFunnel &&
                                (stnw.UserType === stnw.UserTypeAndRedirectUrlEnum.MAAUser.UserType ||
                                stnw.UserType === stnw.UserTypeAndRedirectUrlEnum.AnonymousUser.UserType)) {
                                $('#CheckOutExpirationTimestamp').val($('#CheckOutExpiredTimestamp').val());
                                var refreshElement = document.getElementById('Refresh');
                                if (refreshElement) { refreshElement.click(); }
                            }
                            else if (stnw.pageSource === stnw.pageSourceType.ConsideredAsAvailability &&
                            (stnw.UserType === stnw.UserTypeAndRedirectUrlEnum.MAAUser.UserType ||
                            stnw.UserType === stnw.UserTypeAndRedirectUrlEnum.AnonymousUser.UserType)) {
                                $('#ShoppingExpirationTimestamp').val($('#ShoppingExpiredTimestamp').val());
                                var refreshElement = document.getElementById('Refresh');
                                if (refreshElement) { refreshElement.click(); }
                            }
                                // Move to SignIn Page.
                            else if (stnw.RedirectURL !== '') {
                                window.location.href = stnw.RedirectURL;
                            }
                                // We may refresh the page not to show outdated login status
                            else {
                                window.location.reload();
                            }
                        },
                        complete: function (jqXHR, textStatus, errorThrown) {
                            stnw.setCookieByKey('bSessionExpired', true);
                            $.closeEzPopoups(false);
                        }
                    });
                };

                stnw.overrideSessionTimeAndRedirectURL = function (showSessionTimeOutBoxCallback) {
                    if (stnw.isConfigSet === stnw.configType.Default) {
                        $.ajax({
                            url: '//www.alaskaair.com/services/v1/myaccount/getloginstatus?t=' + (new Date()).getTime(),
                            success: function (data) {
                                if (stnw.pageSource === stnw.pageSourceType.Standalone && data.IsSuperUser) {
                                    //as.stnw.timings.session_timeout_in_msec = 1300 * 1000; // expires in 30 secs (Default: 60 mins)
                                    //as.stnw.timings.session_timeout_warning_happens_in_msec = (1300 - 23) * 1000; // warning appears in 5 secs (Default: 59 mins 40 secs)
                                    as.stnw.timings.session_timeout_in_msec = (3600 - 3) * 1000; // expires in 90 mins (Default: 60 mins)
                                    as.stnw.timings.session_timeout_warning_happens_in_msec = (3600 - 23) * 1000; // warning appears in 59 mins 40 secs (Default: 19 mins 40 secs)
                                }
                                // Start timer callback, depending on user type
                                if (data.IsLoggedIn === true) {
                                    stnw.isValidTimeout = true;
                                    // Set User Type
                                    if (data.IsEasyBiz === true) {
                                        // Set Default Redirect URL for EasyBiz
                                        stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.EZBUser.UserType;
                                        stnw.RedirectURL = stnw.UserTypeAndRedirectUrlEnum.EZBUser.RedirectURL;
                                    }
                                    else {
                                        stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.MAAUser.UserType;
                                        // Overwrite RedirectURL in AS.COM, if each page doesn't specifiy Redirect URL
                                        if (stnw.RedirectURL === '') {
                                            // if not SiteCore page
                                            if (window.location &&
                                                (window.location.pathname.toLowerCase().indexOf('/content/') === -1
                                                    && window.location.pathname.toLowerCase() !== '/')) {
                                                stnw.RedirectURL = stnw.UserTypeAndRedirectUrlEnum.MAAUser.RedirectURL;
                                            }
                                        }
                                    }
                                }
                                else {
                                    stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.AnonymousUser.UserType;
                                    if (as.stnw.bForceStartTimer === true) {
                                        stnw.isValidTimeout = true;
                                    } else {
                                        stnw.isValidTimeout = false;
                                        stnw.resetCookie();
                                    }
                                }
                                stnw.isConfigSet = stnw.configType.Overridden;
                                showSessionTimeOutBoxCallback();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                            }
                        });
                    } else if (stnw.isConfigSet === stnw.configType.Overridden) {
                        showSessionTimeOutBoxCallback();
                    }
                };
				
                stnw.isUserLoggedIn = function (successCallback, failureCallback) {
                    $.ajax({
                        url: '//www.alaskaair.com/services/v1/myaccount/getloginstatus?t=' + (new Date()).getTime(),
                        success: function (data) {
                            if (stnw.pageSource === stnw.pageSourceType.Standalone && data.IsSuperUser) {
                                //as.stnw.timings.session_timeout_in_msec = 1300 * 1000; // expires in 30 secs (Default: 60 mins)
                                //as.stnw.timings.session_timeout_warning_happens_in_msec = (1300 - 23) * 1000; // warning appears in 5 secs (Default: 59 mins 40 secs)
                                as.stnw.timings.session_timeout_in_msec = (3600 - 3) * 1000; // expires in 90 mins (Default: 60 mins)
                                as.stnw.timings.session_timeout_warning_happens_in_msec = (3600 - 23) * 1000; // warning appears in 59 mins 40 secs (Default: 19 mins 40 secs)
                            }
                            // Start timer callback, depending on user type
                            if (data.IsLoggedIn === true) {
                                stnw.setCookieByKey('bSessionExpired', false);
                                // Set User Type
                                if (data.IsEasyBiz === true) {
                                    // Set Default Redirect URL for EasyBiz
                                    stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.EZBUser.UserType;
                                    stnw.RedirectURL = stnw.UserTypeAndRedirectUrlEnum.EZBUser.RedirectURL;
                                }
                                else {
                                    stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.MAAUser.UserType;

                                    // Overwrite RedirectURL in AS.COM, if each page doesn't specifiy Redirect URL
                                    if (stnw.RedirectURL === '') {
                                        // if not SiteCore page
                                        if (window.location &&
                                            (window.location.pathname.toLowerCase().indexOf('/content/') === -1
                                                && window.location.pathname.toLowerCase() !== '/')) {
                                            stnw.RedirectURL = stnw.UserTypeAndRedirectUrlEnum.MAAUser.RedirectURL;
                                        }
                                    }
                                }

                                (successCallback || Function)();
                            }
                            else {
                                stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.AnonymousUser.UserType;
                                if (as.stnw.bForceStartTimer === true) {
                                    stnw.setCookieByKey('bSessionExpired', false);
                                    (successCallback || Function)();
                                } else {
                                    (failureCallback || Function)();
                                }
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            stnw.setCookieByKey('bSessionExpired', true);
                        }
                    });
                };

                // Initialize multi-tab configuration
                stnw.nlastContinueClickCookie = stnw.getCookieByKey("nlastContinueClick");
                if (stnw.nlastContinueClickCookie === '' || stnw.nlastContinueClickCookie === '0') {
                    stnw.setCookieByKey('nlastContinueClick', '0');
                }
                // When any tab is refreshed, initialize.
                stnw.setCookieByKey('nlastContinueClick', (parseInt(stnw.getCookieByKey('nlastContinueClick')) + 1).toString());
                stnw.nlastContinueClick = parseInt(stnw.getCookieByKey('nlastContinueClick')) - 1;

                if (typeof (stnw_init_page) == "function") {
                    stnw_init_page();
                }

                as.stnw.startTimer();
            },

            timings: {
                count: 1,
                poll_time_in_msec: 1 * 1000,  // 1 sec
                session_timeout_in_msec: (1200 - 3) * 1000,  // 20 mins - 3 secs
                session_timeout_warning_happens_in_msec: (1200 - 23) * 1000,  // 20 mins - 23 secs
                countdown_started: null,
                total_countdown_percent_complete: 0,
                warning_countdown_percent_complete: 0,
                elapsed_in_msec: function () {
                    // Convert both dates to milliseconds
                    try {
                        var t_start = stnw.timings.countdown_started.getTime();
                        var t_now = (new Date()).getTime();

                        // Calculate the difference in milliseconds
                        var delta_msec = t_now - t_start;
                        return delta_msec;
                    }
                    catch (e) {
                        console.log(e);
                        return 0;
                    }
                },
                warning_threshold_reached: false,
                session_has_timeedout: false,
                is_resetting_session: false
            },

            timeleft : function () {
                return Math.floor(Math.max(0, (stnw.timings.session_timeout_in_msec - stnw.timings.elapsed_in_msec())) / 1000);
            },

            deleteCookie: function (strName, strDomain, strPath) {
                /*You are sking why god why? Why the heck you didn't use $cookieStore or $cookies to remove the cookie? Tried man, tied it all, but they won't do it, who knows why. So plain old JS to rescue.*/
                var dtmExpiry = new Date("January 1, 1970");
                document.cookie = strName + "=" + ((strPath) ? "; path=" + strPath : "") + ((strDomain) ? "; domain=" + strDomain : "") + "; expires=" + dtmExpiry.toGMTString();
            },

            resetCookie: function () {
                stnw.nlastContinueClick = 0;
                stnw.setCookieByKey('nlastContinueClick', '0');
                stnw.setCookieByKey('bSessionExpired', true);
            },

            getCookie: function (name) {
                var nameEQ = name + "=";
                var cookies = window.document.cookie.split(';');
                for (var i = 0, len = cookies.length; i < len; i++) {
                    var c = cookies[i];
                    while (c.charAt(0) === ' ') {
                        c = c.substring(1, c.length);
                    }
                    if (c.indexOf(nameEQ) === 0) {
                        return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
                    }
                }
                return {};
            },

            getCookieByKey: function (key) {
                var cookieCollection = stnw.getCookie('stnw');
                if (cookieCollection.hasOwnProperty(key)) {
                    return cookieCollection[key];
                }
                return '';
            },

            setCookieByKey: function (key, value) {
                var cookieCollection = stnw.getCookie('stnw'),
                    t = new Date();

                cookieCollection[key] = value;
                document.cookie = "stnw=" + JSON.stringify(cookieCollection) + "; expires=" + (new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours() + 2, t.getMinutes(), 0)).toGMTString() + "; path=/" + "; domain=www.alaskaair.com";
            },

            resetSession: function () {

                if (stnw.timings.is_resetting_session) return;

                stnw.timings.is_resetting_session = true;

                stnw.timings.countdown_started = new Date();   // start the countdown timer
                stnw.timings.session_has_timeedout = false;
                stnw.timings.warning_threshold_reached = false;

                stnw.timings.is_resetting_session = false;
            },

            continueSession: function () {
                stnw.resetSession();
                if (typeof stnw.continue_callback !== 'undefined') {
                    stnw.continue_callback();
                }
            }
        };

        return stnw;
    })();
}
