$(document).delegate('a[data-omniture-tag]', 'click', function () {
    trackLink(this, 'omniture-tag');
});

$(document).delegate('form[data-omniture-tag-onsubmit]', 'submit', function () {
    trackLink(this, 'omniture-tag-onsubmit');
});

function trackLink(element, dataAttr) {
    if (window.s_gi) {
        var self = $(element),
            tag = self.data(dataAttr);

        if (tag) {
            var includePageName = self.data('omniture-include-pagename') === 'true';
            var s = window.s_gi('alaskacom');
            s.linkTrackVars = 'prop16';
            s.linkTrackEvents = 'None';
            s.prop16 = includePageName ? s.pageName + ' | ' + tag : tag;
            s.tl(element, 'o', tag);
            s.prop16 = '';
        }
    } else {
        if (console) {
            console.warn('s_gi is not defined!');
        }
    }
}
