//start bubble code

var closeOnClickBound = false;

jQuery.fn.hideBubble = function () {
    $(this).parents('.bubble-new').hide();
    return this;
}

jQuery.fn.showBubble = function (param, e) {
    param = param || {};
    param.orientation = param.orientation || 1; //1 - pointup, 2 - pointdown, 3 - pointleft, 4 pointright

    if (param.orientation == 1 || param.orientation == 2) {
        param.pointDown = param.orientation == 2;
        $(this).showBubbleV(param, e);
    }
    else if (param.orientation == 3 || param.orientation == 4) {
        param.pointLeft = param.orientation == 3;
        $(this).showBubbleH(param, e);
    }
    else {
        param.pointDown = false;
        $(this).showBubbleV(param, e);
    }
    return this;
}

jQuery.fn.showBubbleV = function (param, e) {
    var me = this;

    param = param || {};
    param.width = param.width != null ? param.width : 200;
    param.offsetLeft = param.offsetLeft != null ? param.offsetLeft : 0;
    param.pointDown = param.pointDown != null ? param.pointDown : false;
    if (param.src == null) param.src = event;

    $('.bubble-new').hide(); //hide all bubbles first
    //calculate widths
    var padding = 10;
    var borderWidth = 3;
    var pointerWidth = 28;
    var leftWidth = Math.round((param.width - pointerWidth) / 2 + (padding + borderWidth));
    var rightWidth = leftWidth;
    var bubbleWidth = leftWidth + rightWidth + pointerWidth;
    var pointerHeight = 18;
    var bottomPointerHeight = 28;
    var contentWidth = bubbleWidth - (padding * 2) - borderWidth;

    //end calculate widths
    var borderStyle = borderWidth + 'px solid #82A3D1';
    var borderRadius = 8;
    var fillerMarginTop = -18;

    function protocol() {
        var protocol = "http:";
        protocol = (window.location.protocol ? window.location.protocol : protocol) + "//";
        return protocol;
    }
    var alaskaUrl = protocol() + 'www.alaskaair.com';

    if ($(this).parents('.bubble-new').length == 0) {
        var suffix = GetRandomId();
        var html = '<style type="text/css">.containerx .bubble-new, .containerx .bubble-new *{margin:0;padding:0;z-index:999999999}</style>';
        html = '<div class="bubble-new" id="bubble' + suffix + '" style="position:absolute;">';
        html += '   <div id="close' + suffix + '" class="bubble-close" style="cursor:pointer; display:none; margin-left:' + (bubbleWidth - 10) + 'px;position:absolute; width:30px; height:30px; background:url(/images/Popup_Close_X.png) no-repeat; overflow:hidden;" tabindex="0" role="button"><span class="hidden">Close</span></div>';
        html += '	<div style="clear:both;width:' + bubbleWidth + 'px;" class="bubble-top" id="bubbletop' + suffix + '">';
        html += '		<div style="float:left; width:' + leftWidth + 'px;" class="bubble-top-left">';
        html += '           <div style="clear:both;height:15px;"></div><div style="background-color:white;width:' + leftWidth + 'px; height:10px; border-left:' + borderStyle + ';border-top:' + borderStyle + ';border-top-left-radius: ' + borderRadius + 'px;-moz-border-radius-topleft:' + borderRadius + 'px;"></div>';
        html += '		</div>';
        html += '		<div style="float:left; width:' + pointerWidth + 'px;">';
        html += '		    <div class="bubble-pointer" style="float:left;background:no-repeat bottom; background-image:url(' + alaskaUrl + '/content/~/media/Images/onSite/backgrounds/clippy_pointer_up);width:' + pointerWidth + 'px; height:' + pointerHeight + 'px;"></div><div style="clear:both;height:10px;background-color:white;"></div>';
        html += '		</div>';
        html += '		<div style="float:left; width:' + leftWidth + 'px;" class="bubble-top-right">';
        html += '           <div style="clear:both;height:15px;"></div><div style="background-color:white;width:' + leftWidth + 'px; height:10px; border-right:' + borderStyle + ';border-top:' + borderStyle + ';border-top-right-radius: ' + borderRadius + 'px;-moz-border-radius-topright:' + borderRadius + 'px;"></div>';
        html += '		</div>';
        html += '	</div>';
        html += '	<div class="bubble-content" style="-webkit-box-shadow: #999 3px 3px 3px;-moz-box-shadow:3px 3px 3px #999999;background-color:white;width:' + contentWidth + 'px;border-left:' + borderStyle + '; border-right:' + borderStyle + '; border-bottom:' + borderStyle + '; clear:both;border-bottom-left-radius: ' + borderRadius + 'px;border-bottom-right-radius: ' + borderRadius + 'px; padding:' + padding + 'px;" id="bubblecontent' + suffix + '">';
        html += '	</div>';
        html += '	<div style="display:none;clear:both;width:' + bubbleWidth + 'px;" class="bubble-bottom" id="bubblebottom' + suffix + '">';
        html += '		<div style="float:left; width:' + leftWidth + 'px; height:15px;" class="bubble-bottom-left">';
        html += '           <div style="background-color:white;width:' + leftWidth + 'px; height:10px; border-left:' + borderStyle + ';border-bottom:' + borderStyle + ';border-bottom-left-radius: ' + borderRadius + 'px;-moz-border-radius-bottomleft:' + borderRadius + 'px;"></div>';
        html += '		</div>';
        html += '		<div class="bubble-pointer" style="float:left;background-color:white;background:no-repeat bottom; background-image:url(' + alaskaUrl + '/content/~/media/Images/onSite/backgrounds/clippy_pointer_down);width:' + pointerWidth + 'px; height:' + (bottomPointerHeight - 1) + 'px;">&nbsp;<div style="position:absolute; margin-top:' + fillerMarginTop + 'px; background:white;width:42px;height:10px;"></div></div>';
        html += '		<div style="float:left; width:' + leftWidth + 'px; height:15px;" class="bubble-bottom-right">';
        html += '           <div style="background-color:white;width:' + leftWidth + 'px; height:10px; border-right:' + borderStyle + ';border-bottom:' + borderStyle + ';border-bottom-right-radius: ' + borderRadius + 'px;-moz-border-radius-bottomright:' + borderRadius + 'px;"></div>';
        html += '		</div>';
        html += '	</div>';
        html += '</div>';
        $(this).before(html);
        $(this).css({ position: 'static' });
        $('#bubblecontent' + suffix).attr({ totalWidth: (leftWidth * 2) });
        $('#bubblecontent' + suffix).append('<div class="clear"></div>').append(this).append('<div class="clear"></div>');
        $(this).show().css({ 'z-index': 999 });
    }
    $(this).parents('.bubble-new').show();
    $('.bubble-new').css('z-index', '99999999');

    //calculate position
    var offsetTop = 5;
    var srcTop = $(param.src).offset().top;
    var top = srcTop + $(param.src).height() + offsetTop;
    if (top < 0) top = 0;
    //check to see if bubble is partially hidden, if yes adjust top

    var bubbleDiv = $(this).parents('.bubble-new');
    var bubbleClose = $(".bubble-close", bubbleDiv);
    var bubbleTop = $(".bubble-top", bubbleDiv);
    var bubbleBottom = $(".bubble-bottom", bubbleDiv);
    var bubbleContent = $(".bubble-content", bubbleDiv);
    var bubbleTopLeft = $(".bubble-top-left", bubbleDiv);
    var bubbleTopRight = $(".bubble-top-right", bubbleDiv);
    var bubbleBottomLeft = $(".bubble-bottom-left", bubbleDiv);
    var bubbleBottomRight = $(".bubble-bottom-right", bubbleDiv);
    var bubbleHeight = bubbleDiv.height();
    var bubbleBottomPos = top + bubbleHeight;
    var bubbleTopPos = srcTop - bubbleHeight;
    var bottomPagePos = $(document).scrollTop() + getVisibleHeight();
    var leftPagePos = $(document).scrollLeft() + getVisibleWidth();
    var pointDown = (param.pointDown && bubbleTopPos > $(document).scrollTop()) || bubbleBottomPos > bottomPagePos;
    if (pointDown) {
        top = srcTop - bubbleHeight - offsetTop;
        $(bubbleContent).css({ 'border-bottom': 'none', 'border-top': borderStyle });
        $(bubbleContent).css({ 'border-top-left-radius': borderRadius, 'border-top-right-radius': borderRadius });
        $(bubbleContent).css({ 'border-bottom-left-radius': 0, 'border-bottom-right-radius': 0 });
        $(bubbleContent).css({ '-moz-border-radius-topleft': borderRadius, '-moz-border-radius-topright': borderRadius });
        $(bubbleContent).css({ '-moz-border-radius-bottomleft': 0, '-moz-border-radius-bottomright': 0 });
        $(bubbleBottom).show();
        $(bubbleTop).hide();
        $(bubbleClose).css({ 'margin-top': -10 });
    }
    else {
        $(bubbleContent).css({ 'border-top': 'none', 'border-bottom': borderStyle });
        $(bubbleContent).css({ 'border-bottom-left-radius': borderRadius, 'border-bottom-right-radius': borderRadius });
        $(bubbleContent).css({ 'border-top-left-radius': 0, 'border-top-right-radius': 0 });
        $(bubbleContent).css({ '-moz-border-radius-bottomleft': borderRadius, '-moz-border-radius-bottomright': borderRadius });
        $(bubbleContent).css({ '-moz-border-radius-topleft': 0, '-moz-border-radius-topright': 0 });
        $(bubbleBottom).hide();
        $(bubbleTop).show();
        $(bubbleClose).css({ 'margin-top': 5 });
    }
    var left = Math.round($(param.src).offset().left + $(param.src).width() / 2 - (bubbleWidth) / 2 + borderWidth) + param.offsetLeft;
    if (left < 0) left = 0;
    if (left < $(document).scrollLeft()) {
        left = $(document).scrollLeft();
    }
    if (left + bubbleDiv.width() > leftPagePos) {
        left = Math.round(leftPagePos - bubbleDiv.width());
    }
    //end calculate position
    adjustPointerPosition();

    function adjustPointerPosition() {
        var totalWidth = parseInt($(bubbleContent).attr('totalWidth'));
        var newLeftWidth = Math.round($(param.src).offset().left - left + $(param.src).width() / 2 - pointerWidth / 2);
        var newRightWidth = totalWidth - newLeftWidth;

        $(bubbleTopLeft).css({ width: newLeftWidth });
        $(bubbleBottomLeft).css({ width: newLeftWidth });
        $('div', bubbleTopLeft).css({ width: newLeftWidth });
        $('div', bubbleBottomLeft).css({ width: newLeftWidth });

        $(bubbleTopRight).css({ width: newRightWidth });
        $(bubbleBottomRight).css({ width: newRightWidth });
        $('div', bubbleTopRight).css({ width: newRightWidth });
        $('div', bubbleBottomRight).css({ width: newRightWidth });
    }

    $(bubbleDiv).css({ top: top, left: left }).show();
    generateBubbleEvents(e, param, this, bubbleDiv, bubbleClose);


    function GetRandomId() {
        var d = new Date();
        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        var curr_sec = d.getSeconds();

        return curr_hour + "_" + curr_min + "_" + curr_sec + Math.floor(Math.random() * 1111);
    }
    function getVisibleHeight() {
        return $(document).height() > $(window).height() ? $(window).height() : $(document).height();
    }
    function getVisibleWidth() {
        return $(document).width() > $(window).width() ? $(window).width() : $(document).width();
    }

    return this;
}

jQuery.fn.showBubbleH = function (param, e) {
    param = param || {};
    param.width = param.width != null ? param.width : 200;
    param.height = param.height != null ? param.height : 200;
    param.offsetLeft = param.offsetLeft != null ? param.offsetLeft : 0;
    param.pointLeft = param.pointLeft != null ? param.pointLeft : false;
    if (param.src == null) param.src = event;

    var pointerWidth = 18;
    var width15 = 15;
    var width10 = 15;

    $('.bubble-new').hide(); //hide all bubbles first
    if ($(this).parents('.bubble-ltr').length === 0) {
        var suffix = GetRandomId();
        var html = '';
        html += '<style type="text/css">';
        html += '    .containerx .left{float:left;}';
        html += '    .containerx .bgwhite{background:white;}';
        html += '    .containerx .bubble-new{position:absolute; z-index: 9999999;}';
        html += '    .containerx .bubble-width15{width:15px;}';
        html += '    .containerx .bubble-width10{width:10px;}';
        html += '    .containerx .bubble-r_topleft{border-left:solid 3px #82A3D1;border-top:solid 3px #82A3D1;border-top-left-radius: 6px;-moz-border-radius-topleft:6px;}';
        html += '    .containerx .bubble-r_bottomleft{border-left:solid 3px #82A3D1;border-bottom:solid 3px #82A3D1;border-bottom-left-radius: 6px;-moz-border-radius-bottomleft:6px;}';
        html += '    .containerx .bubble-r_topright{border-right:solid 3px #82A3D1;border-top:solid 3px #82A3D1;border-top-right-radius: 6px;-moz-border-radius-topright:6px;}';
        html += '    .containerx .bubble-r_bottomright{border-right:solid 3px #82A3D1;border-bottom:solid 3px #82A3D1;border-bottom-right-radius: 6px;-moz-border-radius-bottomright:6px;}';
        html += '    .containerx .bubble-content{border-top:solid 3px #82A3D1;border-bottom:solid 3px #82A3D1; padding:0px;}';
        html += '    .containerx .bubble-shadow{-webkit-box-shadow: #999 3px 3px 3px;-moz-box-shadow:3px 3px 3px #999999}';
        html += '</style>';
        html += '<div class="bubble-new bubble-ltr">';
        html += '    <div id="close' + suffix + '" class="bubble-close" style="text-align:left; clear:both; cursor:pointer; display:none; margin-top:-10px; width:' + (parseInt(param.width) + 54) + 'px;position:absolute; left:0;height:30px; background:url(/images/Popup_Close_X.png) no-repeat center right; overflow:hidden;" tabindex="0" role="button"><span class="hidden">Close</span></div>';
        html += '    <div class="left buble-left">';
        html += '        <div style="clear:both;" class="bubble_lt" id="bubble_lt' + suffix + '">';
        html += '	        <div class="bubble-width15 left" style="height:50px;">&nbsp;</div>';
        html += '	        <div class="bubble-width10 bubble-r_topleft left bgwhite" style="height:50px;">&nbsp;</div>';
        html += '        </div>';
        html += '        <div style="clear:both;" class="bubble_lc" id="bubble_lc' + suffix + '">';
        html += '	        <div class="left" style="background:url(/content/~/media/Images/onSite/backgrounds/clippy_pointer_left) no-repeat center right; width:18px; height:30px;"></div>';
        html += '	        <div class="bubble-width10 left bgwhite"></div>';
        html += '        </div>';
        html += '        <div style="clear:both;" class="bubble_lb" id="bubble_lb' + suffix + '">';
        html += '	        <div class="bubble-width15 left" style="height:50px;">&nbsp;</div>';
        html += '	        <div class="bubble-width10 bubble-r_bottomleft left bgwhite" style="height:50px;">&nbsp;</div>';
        html += '        </div>';
        html += '    </div>';
        html += '    <div class="left bubble-content bgwhite bubble-shadow" style="height:130px; width:100px;" id="bubble_content' + suffix + '">';
        html += '    </div>';
        html += '    <div class="left buble-right">';
        html += '        <div style="clear:both;" class="bubble_rt" id="bubble_rt' + suffix + '">';
        html += '	        <div class="bubble-width10 bubble-r_topright left bgwhite bubble-shadow" style="height:50px;">&nbsp;</div>';
        html += '	        <div class="bubble-width15 left" style="height:50px;">&nbsp;</div>';
        html += '        </div>';
        html += '        <div style="clear:both;" class="bubble_rc" id="bubble_rc' + suffix + '">';
        html += '	        <div class="bubble-width10 left bgwhite">&nbsp;</div>';
        html += '	        <div class="left bgwhite" style="background:url(/content/~/media/Images/onSite/backgrounds/clippy_pointer_left) no-repeat center right; width:18px; height:30px;-moz-transform: scaleX(-1);-o-transform: scaleX(-1);-webkit-transform: scaleX(-1);transform: scaleX(-1);filter: FlipH;-ms-filter: \'FlipH\';"></div>';
        html += '        </div>';
        html += '        <div style="clear:both;" class="bubble_rb" id="bubble_rb' + suffix + '">';
        html += '	        <div class="bubble-width10 bubble-r_bottomright left bgwhite bubble-shadow" style="height:50px;">&nbsp;</div>';
        html += '	        <div class="bubble-width15 left" style="height:50px;">&nbsp;</div>';
        html += '        </div>';
        html += '    </div>';
        html += '</div>';
        $(this).before(html);
        $(this).css({ position: 'static' });
        $('#bubble_content' + suffix).append('<div class="clear">&nbsp;</div>').append(this).append('<div class="clear">&nbsp;</div>');
        $(this).show().css({ 'z-index': 999 });
        var $bubble_ltr = $(this).parents('.bubble-ltr');
        $bubble_ltr.css({ width: param.width + (width10 + width15) * 2 });
        $bubble_ltr.show().attr({ height: $bubble_ltr.height() });
    }

    var pointLeft = param.pointLeft;

    var $bubble_new = $(this).parents('.bubble-ltr');
    var $bubble_close = $('.bubble-close', $bubble_new);
    var $bubble_lt = $('.bubble_lt', $bubble_new);
    var $bubble_lc = $('.bubble_lc', $bubble_new);
    var $bubble_lb = $('.bubble_lb', $bubble_new);
    var $bubble_left = $('.bubble-left', $bubble_new);
    var $bubble_content = $('.bubble-content', $bubble_new);
    var $bubble_right = $('.bubble-left', $bubble_new);
    var $bubble_rt = $('.bubble_rt', $bubble_new);
    var $bubble_rc = $('.bubble_rc', $bubble_new);
    var $bubble_rb = $('.bubble_rb', $bubble_new);

    var lt_height = 0;
    var lc_height = 0;
    var lb_height = 0;
    var rt_height = 0;
    var rc_height = 0;
    var rb_height = 0;
    var offsetLeft = 10;
    var pointerHeight = 28;
    var borderWidth = 3;
    var bubbleComputedHeight = param.height + 2 * borderWidth;
    var srcTop = $(param.src).offset().top + Math.round($(param.src).height() / 2);
    var srcLeft = $(param.src).offset().left;
    var left = 0;
    //start calculate top
    var top = srcTop - Math.round(param.height / 2) - 2 * borderWidth;
    if (top < 0) top = 0;
    if (top < $(document).scrollTop()) top = $(document).scrollTop();
    if (top + bubbleComputedHeight > $(document).scrollTop() + getVisibleHeight()) {
        top = $(document).scrollTop() + getVisibleHeight() - bubbleComputedHeight;
    }
    if (top < 0) top = 0;
    if (top + Math.round(pointerHeight / 2) > srcTop) {
        top -= Math.round(pointerHeight / 2);
    }
    if (srcTop + Math.round(pointerHeight / 2) > $(document).scrollTop() + getVisibleHeight()) {
        top += pointerHeight;
    }
    //end calculate top

    if (pointLeft == true) {
        if (srcLeft + $(param.src).width() + $bubble_new.width() > $(document).scrollLeft() + getVisibleWidth()) {
            pointLeft = false;
        }
    }

    if ((srcLeft - param.width - $(param.src).width()) < $(document).scrollLeft()) {
        pointLeft = true;
    }

    if (pointLeft == true) {
        left = srcLeft + $(param.src).width();
        lc_height = pointerHeight;
        rc_height = 0;
    } else {
        lc_height = 0;
        rc_height = pointerHeight;
        left = srcLeft - $bubble_new.width();
    }

    var paramHeight = param.height;

    lt_height = srcTop - top - lc_height / 2;
    lb_height = paramHeight - lt_height - lc_height;

    rt_height = srcTop - top - rc_height / 2;
    rb_height = paramHeight - rt_height - rc_height;

    $bubble_content.css({ height: paramHeight, width: param.width });
    $('div', $bubble_lt).css({ height: lt_height });
    $('div', $bubble_lb).css({ height: lb_height });
    $('div', $bubble_lc).css({ height: lc_height });
    $('div', $bubble_rt).css({ height: rt_height });
    $('div', $bubble_rb).css({ height: rb_height });
    $('div', $bubble_rc).css({ height: rc_height });

    $bubble_new.css({ top: top, left: left });
    $(this).parents('.bubble-new').show();

    generateBubbleEvents(e, param, this, $bubble_new, $bubble_close, 2);
    function GetRandomId() {
        var d = new Date();
        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        var curr_sec = d.getSeconds();

        return curr_hour + "_" + curr_min + "_" + curr_sec + Math.floor(Math.random() * 1111);
    }
    function getVisibleHeight() {
        return $(document).height() > $(window).height() ? $(window).height() : $(document).height();
    }
    function getVisibleWidth() {
        return $(document).width() > $(window).width() ? $(window).width() : $(document).width();
    }
};

function generateBubbleEvents(e, param, content, bubbleDiv, bubbleClose, view) {
    if (e != null && e.type != null && e.type == 'click') {
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        param.mouseOutHide = false;
    }
    else {
    	//enable click for touch users
    	if ($(param.src).attr("bubble_click") == "true") {
    		$(param.src).unbind("click");
    	}
        $(param.src).bind("click", function (e) {
            $(param.src).unbind("mouseout");
            if (view == null || view == 1) {
                $(content).showBubble({ width: param.width, src: $(this), offsetLeft: param.offsetLeft, mouseOutHide: false }, e)
            }
            else {
                $(content).showBubbleH({ width: param.width, height: param.height, src: $(this), pointLeft: param.pointLeft, mouseOutHide: false }, e)
            }
        });
        $(param.src).attr({ "bubble_click": "true" });
    }

    if (param.mouseOutHide == null || param.mouseOutHide != false) {
        $(bubbleClose).hide();
        $(param.src).bind("mouseout", function () {
            $(bubbleDiv).hide();
        });
    } else {
        $(bubbleClose).show().bind('click', function () {
            $(bubbleDiv).hide();
        });
    }

    if (closeOnClickBound == false) {
        $(document).bind('click', function (e) {
            $('.bubble-new').hide();
        });
        $(window).bind('resize', function (e) {
            $('.bubble-new').hide();
        });
        closeOnClickBound = true;
    }
    $(bubbleDiv).bind('click', function (e) {
        if (!e) {
            e = window.event;
        }
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    });
    $(param.src).bind('click', function (e) {
        if (!e) {
            e = window.event;
        }
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    });
}

//end bubble code
