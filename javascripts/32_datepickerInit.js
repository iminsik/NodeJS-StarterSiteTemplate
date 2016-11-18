function DatePickerInit() {
    var _me = this;
    var _asDatepicker = null;
    var _dateOffsetRegex = /((\-?[\d]+)m)?((\-?[\d]+)d)?/;

    function setValidity(name, isValid) {
        if (!isValid) {
            console.log('!!! something related to the datepicker is not valid !!!');
        }
    };

    function isTooEarly(date, $target) {
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var dateFilter = DateFilter();
        var minDateAttr = $target.attr('minDate');
        var minDate = dateFilter(minDateAttr) || today;
        var isTooEarly = minDate <= date;
        if (minDateAttr && !isTooEarly) {
            $target.val(minDate);
            isTooEarly = true;
        }
        setValidity('tooEarly', isTooEarly);
    };

    function isTooLate(date, $target) {
        var maxDateOffset = 330;
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + maxDateOffset);
        setValidity('tooLate', maxDate >= date);
    };

    function highlightInput(shouldHighlight, $target) {
        if (shouldHighlight && $target) {
            $target.select();
        }
    };

    var prevVal = '';
    function validateAndSetDate(callType, $target) {
        var dateFilter = DateFilter();
        var date = dateFilter($target.val());
        var newVal = '';
        if (date) {
            newVal = Date.parse(date);
        }
        if (newVal !== prevVal) {
            if (newVal && newVal.getMonth) {
                $target.val((newVal.getMonth() + 1) + '/' + newVal.getDate() + '/' + (newVal.getFullYear()));
            }
            $target.triggerHandler('input');
            prevVal = newVal;
        }

        if (date) {
            isTooEarly(date, $target);
            isTooLate(date, $target);
        }

        /*var nextElementId = $target.attr('next-id');

        if (nextElementId) {
            if (callType !== 'blur') {
                var element = document.getElementById(nextElementId);
                if (element) {
                    element = $(element);
                    if (!element.hasClass('ng-hide')) {
                        element.triggerHandler('click');
                    }
                }
            }
        }*/
    };

    function getDatePickerHtml() {
        return '<div id="as-datepicker" class="datepicker" aria-hidden="true">' +
                            '<div class="month-wrap">' +
                                '<div id="btn-prev" class="btn-prev" role="button" aria-labelledby="btn-prev-label" tabindex="0">&lsaquo;</div>' +
                                '<div id="month" class="month"></div>' +
                                '<div id="btn-next" class="btn-next" role="button" aria-labelledby="btn-next-label" tabindex="0">&rsaquo;</div>' +
                            '</div>' +
                            '<div>' +
                                '<table id="cal1" class="calendar" role="grid" aria-activedescendant="errMsg" aria-labelledby="month-label" tabindex="0">' +
                                    '<thead>' +
                                        '<tr>' +
                                            '<th scope="col">' +
                                                '<abbr id="Sunday" title="Sunday">Su</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Monday" title="Monday">Mo</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Tuesday" title="Tuesday">Tu</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Wednesday" title="Wednesday">We</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Thursday" title="Thursday">Th</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Friday" title="Friday">Fr</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Saturday" title="Saturday">Sa</abbr>' +
                                            '</th>' +
                                        '</tr>' +
                                    '</thead>' +
                                    '<tbody>' +
                                        '<tr>' +
                                            '<td id="errMsg" colspan="7">Javascript must be enabled</td>' +
                                        '</tr>' +
                                    '</tbody>' +
                                '</table>' +
                            '</div>' +
                            '<div id="btn-prev-label" class="sr-only">Go to previous month</div>' +
                            '<div id="btn-next-label" class="sr-only">Go to next month</div>' +
                            '<div id="month-label" class="sr-only" role="heading" aria-live="assertive" aria-atomic="true"></div>' +
                        '</div>';
    }

    function drawDatePickerIcons(scope) {
        $(scope + ' .as-datepicker').each(function () {
            var $self = $(this),
                datePickerHasNotWrapped = ($self.data('wrapped') === undefined) ? true : false;

            if (datePickerHasNotWrapped) {
                $self.attr('data-wrapped', true).wrap('<span class="as-datepicker-wrapper" />');
                $self.parent().append(
                    '<div class="icon-calendar" tabindex="0" aria-label="Open datepicker" role="button" alt="Open datepicker">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
                            '<path d="m 439 123 c -6 -5 -12 -8 -19 -8 l -26 0 l 0 -19 c 0 -9 -3 -17 -10 -24 c -6 -6 -14 -9 -23 -9 l -13 0 c -9 0 -16 3 -23 9 c -6 7 -9 15 -9 24 l 0 19 l -79 0 l 0 -19 c 0 -9 -3 -17 -9 -24 c -7 -6 -14 -9 -23 -9 l -13 0 c -9 0 -17 3 -23 9 c -7 7 -10 15 -10 24 l 0 19 l -26 0 c -7 0 -13 3 -18 8 c -6 5 -8 11 -8 18 l 0 261 c 0 8 2 14 8 19 c 5 5 11 8 18 8 l 287 0 c 7 0 13 -3 19 -8 c 5 -5 7 -11 7 -19 l 0 -261 c 0 -7 -2 -13 -7 -18 Z m -247 279 l -59 0 l 0 -58 l 59 0 Z m 0 -71 l -59 0 l 0 -66 l 59 0 Z m 0 -79 l -59 0 l 0 -58 l 59 0 Z m -5 -93 c -1 -1 -2 -3 -2 -5 l 0 -58 c 0 -2 1 -4 2 -5 c 1 -1 3 -2 5 -2 l 13 0 c 1 0 3 1 4 2 c 2 1 2 3 2 5 l 0 58 c 0 2 0 4 -2 5 c -1 1 -3 2 -4 2 l -13 0 c -2 0 -4 -1 -5 -2 Z m 83 243 l -65 0 l 0 -58 l 65 0 Z m 0 -71 l -65 0 l 0 -66 l 65 0 Z m 0 -79 l -65 0 l 0 -58 l 65 0 Z m 78 150 l -65 0 l 0 -58 l 65 0 Z m 0 -71 l -65 0 l 0 -66 l 65 0 Z m 0 -79 l -65 0 l 0 -58 l 65 0 Z m -4 -93 c -2 -1 -2 -3 -2 -5 l 0 -58 c 0 -2 0 -4 2 -5 c 1 -1 3 -2 4 -2 l 13 0 c 2 0 4 1 5 2 c 1 1 2 3 2 5 l 0 58 c 0 2 -1 4 -2 5 c -1 1 -3 2 -5 2 l -13 0 c -1 0 -3 -1 -4 -2 Z m 76 243 l -59 0 l 0 -58 l 59 0 Z m 0 -71 l -59 0 l 0 -66 l 59 0 Z m 0 -79 l -59 0 l 0 -58 l 59 0 Z" />' +
                        '</svg>' +
                    '</div>');
            }
        });
    }

    function bindEscapeKeyToHide(calendarid, asDatePicker) {
        $('#' + calendarid).bind('keydown', function (e) {
            if (e.keyCode === 27) { // escape
                asDatePicker.hideDlg(true, false);
            }
        });
    }

    function bindClickToShow(scope, asDatePicker) {
        $(scope + ' .as-datepicker, ' + scope + ' .as-datepicker + .icon-calendar').bind('click', function (e) {
            var $target = $(e.srcElement || e.target);
            while (($target.attr('tagName') || $target.prop('tagName')).toLowerCase() !== 'input') {
                $target = $target.parent();
                var $input = $target.find('input');
                if ($input.length > 0) {
                    $target = $($input[0]);
                }

                if (($target.attr('tagName') || $target.prop('tagName')).toLowerCase() === 'body') {
                    break;
                }
            }

            return showDatePicker(e, asDatePicker, $target, false);
        });
    }

    function bindEnterKeyToShow(scope, asDatePicker) {
        $(scope + ' .as-datepicker + .icon-calendar').bind('keydown', function (e) {
            if (e.keyCode !== 13) { // enter
                return;
            }

            var $srcElement = $(e.srcElement || e.target);
            var $input = $srcElement.parent().find('input');

            return showDatePicker(e, asDatePicker, $input, false);
        });
    }

    function getMinDate($target, dateFilter) {
        var minDate = new Date();
        if ($target.attr('minDate')) {
            minDate = dateFilter($target.attr('minDate'));
        } else if ($target.attr('minDateOffset')) {
            var matches = $target.attr('minDateOffset').match(_dateOffsetRegex);
            var monthOffset = 0;
            var dayOffset = 0;
            if (matches[2]) {
                monthOffset = parseInt(matches[2], 10);
            }
            if (matches[4]) {
                dayOffset = parseInt(matches[4], 10);
            }

            minDate = new Date(minDate.getFullYear(), minDate.getMonth() + monthOffset, minDate.getDate() + dayOffset);
        }
        return minDate;
    };

    function getMaxDate($target, dateFilter) {
        var maxDate = null;
        if ($target.attr('maxDateOffset')) {
            maxDate = new Date();
            var matches = $target.attr('maxDateOffset').match(_dateOffsetRegex);
            var monthOffset = 0;
            var dayOffset = 0;
            if (matches[2]) {
                monthOffset = parseInt(matches[2], 10);
            }
            if (matches[4]) {
                dayOffset = parseInt(matches[4], 10);
            }

            maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + monthOffset, maxDate.getDate() + dayOffset);
        }
        return maxDate;
    };

    function positionDatepicker($datepicker, $target) {
        $datepicker.$id.insertAfter($target);
        var $element = $target;
        var css = {
            top: ($element.parent().outerHeight()) + 'px',
            left: 'auto',
            right: 'auto'
        };
        var targetParentClass = $target.parent().parent().attr('class');
        if ((targetParentClass && targetParentClass.match('left-')) || $target.hasClass('left-calendar')) {
            css.left = '0';
        } else {
            css.right = '0';
        }
        $datepicker.$id.css(css);
    };

    function showDatePicker(e, asDatepicker, $target, shouldHighlight) {
        if (typeof makeDropdown === 'function') {
            makeDropdown.hide();
        }
        if (asDatepicker.isVisible
            && asDatepicker.$target[0].id === $target.attr('id')) {
            highlightInput(shouldHighlight);
            return false;
        }

        var dateFilter = DateFilter();
        var minDate = getMinDate($target, dateFilter);
        var maxDate = getMaxDate($target, dateFilter);
        var currentVal;
        var thisDate;
        var today = new Date();

        currentVal = $target.val();
        if (maxDate) {
            asDatepicker.setMaxDate(maxDate);
        }
        asDatepicker.setMinDate(minDate);
        
        if (currentVal) {
            thisDate = dateFilter(currentVal);
            if (thisDate) {
                asDatepicker.setActiveDate(thisDate);
            }
        } else if (minDate) {
            if (minDate < today) {
                asDatepicker.setActiveDate(today);
            } else {
                asDatepicker.setActiveDate(minDate);
            }
        }
        positionDatepicker(asDatepicker, $target);
        asDatepicker.$target = asDatepicker.getTarget($target.attr('id'));

        asDatepicker.setCloseCb(function () {
            validateAndSetDate('cb', $target);
        });
        asDatepicker.showDlg();
        highlightInput(shouldHighlight, $target);
        return false;
    };

    this.init = function (scope, targetid, dateChangeCallback, firstErrorId) {
        if (_asDatepicker == null) {
            $('body').append(getDatePickerHtml());
            _asDatepicker = new datepicker('as-datepicker', true);
        }
        drawDatePickerIcons(scope);
        bindEscapeKeyToHide('as-datepicker', _asDatepicker);
        bindClickToShow(scope, _asDatepicker);
        bindEnterKeyToShow(scope, _asDatepicker);

        if (firstErrorId != "") {
            $('#' +firstErrorId).focus().val($('#' +firstErrorId).val());
        }

        if (typeof dateChangeCallback === 'function') {
            $(scope + ' .as-datepicker').bind('change', dateChangeCallback);
        }
    }
}

    var flightDateChangeCallback = function (e) {

    var $target = $(e.srcElement || e.target);
    var datefilter = new DateFilter();
    var filteredDate = datefilter($target.val());
    if (filteredDate === null) {
        return;
    }

    var newVal = (filteredDate.getMonth() + 1) + '/' + filteredDate.getDate() + '/' + (filteredDate.getFullYear() - 2000);
    $target.val(newVal);

    var targetId = $target.attr('id');

    if (targetId === 'departureDate' || targetId === 'departureDate1') {
        var $returnDate = $('#returnDate');
        var returnDate = datefilter($returnDate.val());
        if (!returnDate || filteredDate >= returnDate) {
            $returnDate.val(newVal);
        }
    }

    var targetIndex = targetId === 'depatureDate' ? 1 : parseInt(targetId.substr(targetId.length - 1, 1), 10);
    for (targetIndex; targetIndex < 5; targetIndex += 1) {
        var $nextDepatureDate = $('#departureDate' + targetIndex);
        var nextDepartureDate = datefilter($nextDepatureDate.val());
        if (!nextDepartureDate || filteredDate >= nextDepartureDate) {
            $nextDepatureDate.val(newVal);
        }
    }
}

var datePickerInit = new DatePickerInit();

$(document).ready(function () {
    var _firstErrorId = $('.input-validation-error').first().attr('id');
    if (_firstErrorId != '' && $('#' + _firstErrorId).hasClass('as-datepicker')) {
        datePickerInit.init('body', 'DepartureDate1', flightDateChangeCallback, _firstErrorId);
    } else {
        datePickerInit.init('body', 'DepartureDate1', flightDateChangeCallback);
    }
});
