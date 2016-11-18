$(document).delegate('.increment-count', 'click', function () {
    var $button = $(this);
    var wrapper = $button.parent();
    var control = wrapper.parent();
    var inputVal = control.find("input").val();
    inputVal++;
    control.find("input").val(inputVal);
    updateChildrenCount();
});

$(document).delegate('.decrement-count', 'click', function () {
    var $button = $(this);
    var wrapper = $button.parent();
    var control = wrapper.parent();
    var inputVal = control.find("input").val();
    if (inputVal > 0) {
        inputVal--;
        control.find("input").val(inputVal);
        updateChildrenCount();
    }
});

var updateChildrenCount = function () {
    var count = 0;

    //for each input validate it's a valid entry and if it's not default to 0
    $('input[class~="children-input"]').each(function () {
        var val = $(this).val();
        if (isNaN(val) || val === "") {
            val = 0;
            $(this).val(0);
        }
        count = count + parseInt(val);
    });

    var childrenTxt = " children";
    if (count === 1) { childrenTxt = " child"; }

    $("#numChildren").text(count + childrenTxt);
};

$(document).ready(function () {
    updateChildrenCount();
});

$(document).delegate('.children-input', 'focusout', function () {
    var num = parseInt($(this).val());
    updateChildrenCount();
})

$(document).delegate('#infantCount', 'focusout', function () {
    $('.dropdown').removeClass('open');
});

$(document).delegate('.dropdown-toggle', 'focus', function (e) {
    $(this).parent().toggleClass("open");
});

$(window).click(function (e) {
    //if the target isn't a child of the dropdown
    if ($('.dropdown').has(e.target).length === 0 && $('.open').has(e.target).length === 0) {
        $('.dropdown').removeClass('open');
    }
});

function ShowAboutInfantCT() {
	var drawer = new SideDrawer('', '');
	drawer.Show();
	var drawerContent = document.createElement('div');
	var infantData = '';
	$.get('//' + asglobal.domainUrl + '/content/travel-info/policies/traveling-with-lap-infants/_lap-infants', function (data) {
		infantData = data;
		$.get('//' + asglobal.domainUrl + '/content/travel-info/policies/children-infants-and-children/_common/_free-baggage', function (data) {
			drawerContent.innerHTML = infantData + data;
			drawer.TransferContent(drawerContent);
		});
	});
	
};
