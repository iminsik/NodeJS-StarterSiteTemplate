var navigationMenu = new NavigationMenu();
function NavigationMenu() {
    var me = this;
    var currentFlexMenuId = "";
    this.SetupMenuDone = false;
    this.SelectTab = function (navTab) {
        $(navTab).removeClass('navTab');
        $(navTab).addClass('navWhiteBox');
        me.ShowMenu(navTab, $("a.nav", navTab).attr("data-flexmenu"));
    }
    this.SelectTabNoSubNav = function (navTab) {
        $(navTab).removeClass('navTab');
        $(navTab).addClass('navWhiteBox');
        me.ShowMenuNoSubNav(navTab, $("a.nav", navTab).attr("data-flexmenu"));

        $(".tabContainer").css("position", "relative");
        $(".tabContainer").css("z-index", "10000");
    }
    this.DeSelectTab = function (navTab) {
        if (!$(navTab).hasClass("selectedTab")) {
            if ($(navTab).hasClass("navWhiteBox")) $(navTab).removeClass('navWhiteBox');
            $(navTab).addClass('navTab');
        }

        me.ToggleTab($(".navBarTab.toggled"));

        $(".flexdropdownmenu").css({ display: "none" });

        $(".tabContainer").css("position", "");
       }

    this.DeSelectAllTabs = function () {
       	$(".navBarTab").each(function () {
       		me.DeSelectTab(this);
       	});
    }

    this.ToggleTab = function (navTab) {
        
        if ($(navTab).hasClass("selectedTab")) {
            $(navTab).removeClass('selectedTab');
            if ($(navTab).hasClass("navWhiteBox")) $(navTab).removeClass('navWhiteBox');
            $(navTab).addClass('navTab');
            $(navTab).addClass('toggled');
        }
        else {
            $(navTab).removeClass('navTab');
            $(navTab).addClass('navWhiteBox');
            $(navTab).addClass('selectedTab');
            $(navTab).removeClass('toggled');
        }

    }

    this.ShowMenu = function (navTab, flexMenuId) {
        var flexMenu = $("#" + flexMenuId);
        if ($(navTab).length > 0) {
            $(flexMenu).css({ position: "absolute" });
            $(flexMenu).css({ "z-index": 10000 });
            var addToTop = 1;
            $(flexMenu).css({ top: $(navTab).offset().top + $(navTab).height() + addToTop });
            $(flexMenu).css({ left: $(navTab).offset().left - $(navTab).offsetParent().offset().left - 1 });
        }
        var duration = 0;

        if (currentFlexMenuId == flexMenuId) {
            duration = 0;
        }
        if ($(flexMenu).css("display") == "none") {
            //$("#divLog").append("<div>" + flexMenuId + "</div>");
            $(flexMenu).slideDown(duration);
        }
        currentFlexMenuId = flexMenuId;
    }


    this.ShowMenuNoSubNav = function (navTab, flexMenuId) {
    	var flexMenu = $("#" + flexMenuId);
    	var navBar = $(".navBar");
    	var advBanner = $("#Advisories");
    	if ($(navTab).length > 0) {
    		$(flexMenu).css({ position: "absolute" });
    		$(flexMenu).css({ "z-index": 9999999 });
    		$(flexMenu).css({ top: $(navBar).outerHeight() - 5, left: $(navBar).offset().left - $(navTab).offset().left + 8 });
    		$(flexMenu).css("width", $(".contentMain").width() - 60);
    	}
    	var duration = 0;

    	if (currentFlexMenuId == flexMenuId) {
    		duration = 0;
    	}

    	var flexMenuLinks = $("[id^=" + flexMenuId + "]");

    	if ($(flexMenu).css("display") == "none") {
    		//$("#divLog").append("<div>" + flexMenuId + "</div>");
    		$(flexMenuLinks).show();
    		$(flexMenu).slideDown(duration);
    	}
    	currentFlexMenuId = flexMenuId;

    	if ($(".navBarTab.selectedTab").attr("id") != $(navTab).attr("id")) {
    		me.ToggleTab($(".navBarTab.selectedTab"));
    	}

    }


    this.CancelBubble = function (e) {
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    }

    $(document).ready(function () {

    	// Fix for hoverstate causing users to double tap on nav links using IOS devices. 
    	// See http://stackoverflow.com/questions/3038898/ipad-iphone-hover-problem-causes-the-user-to-double-click-a-link
    	$(".navBar .listitem a").bind("touchend", function (e) {
    		window.location = $(this).attr("href");
    	});

    	// Show menus with touch events.
    	$(".navBar .tabContainer").bind("touchstart", function (e) {
    		var menuId = $("a.nav", this).attr("data-flexmenu");
    		if (menuId != currentFlexMenuId && $("#" + menuId).length > 0) {
    			e.preventDefault();
    			me.DeSelectAllTabs();
    			me.SelectTabNoSubNav($(".navBarTab", this));
    		}
    	});
    });

}
