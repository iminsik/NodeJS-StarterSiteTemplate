$(function() {
	$( '.toggle').each(function() {
		$(this).attr("tabindex","0");
		if($(this).parent().hasClass("toggle-collapsed")) {
			$(this).attr("aria-expanded","false");
		} else {
			$(this).attr("aria-expanded","true");
		}
	});
});


$('body').delegate('.toggle', 'keydown', function(e) {
	if (e.keyCode == 13) {
		$(this).click();
	}
});

$('body').delegate('.toggle', 'click', function(e) {
    
    var $parent = $(this).parent();
    var toggleid = $(this).attr("toggle-id");
    var collclass = 'toggle-collapsed';
    
    if(!$parent.hasClass(collclass)) {
        $parent.find(toggleid).css("display","block");
		$(this).attr("aria-expanded","false");
    } else {
		$(this).attr("aria-expanded","true");
	}
    $parent.find(toggleid).slideToggle(350);
    $parent.toggleClass(collclass);
	e.preventDefault();
	return false;
});


/* Jump and toggle for set 1 pages */
$('body').delegate('.jumpscroll', 'click', function(e) {
    var scrollto = $(this).data('jumpto');
    
	if (typeof $(this).data('scroll-offset') === "undefined") {
		var offset = 0;
	} else {
		var offset = $(this).data('scroll-offset');
	}

	
    $('html, body').animate({
        'scrollTop': $(scrollto).offset().top - offset
    }, 1000, function(){
    	if($(scrollto).hasClass('toggle-collapsed')) {
    		$(scrollto).find('.toggle').trigger('click');
    	};
    });

	e.preventDefault();
});
