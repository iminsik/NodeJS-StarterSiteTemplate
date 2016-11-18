$(document).ready(function () {
    // Homepage doesn't pull in advisories this way
    if ($('#sitewide-advisory').length === 0) {
        $.ajax({
            url: '//' + asglobal.domainUrl + '/content/advisories/as-dot-com?type=all',
            cache: false,
            success: function (data) {
                if (data.toLowerCase().indexOf("this page has taken off") === -1) {
                    var $sitewideAdvisory = $('<div id="sitewide-advisory">' + data + '</div>');
                    $('body').prepend($sitewideAdvisory);
                    $sitewideAdvisory.click(function () {
                        $(this).slideUp();
                    });
                }
            }
        });
    }
});
