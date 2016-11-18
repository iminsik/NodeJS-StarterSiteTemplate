/**
 * Created by aHardtke on 3/23/2015.
 */
function DateFilter() {
    var refDate;
    var shortMonths = [
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec'
    ];
    var constantHolidays = {
        newYears:        [0, 1],
        newYearsDay:     [0, 1],
        groundhogDay:    [1, 2],
        valentinesDay:   [1, 14],
        patricksDay:     [2, 17], // "st." is stripped out
        flagDay:         [5, 14],
        independenceDay: [6, 4],
        alaskaDay:       [9, 18],
        halloween:       [9, 31],
        veteransDay:     [10, 11],
        christmasEve:    [11, 24],
        christmas:       [11, 25],
        newYearsEve:     [11, 31]
    };
    var holidaysOnNthDay = {
        mlk:           [3, 1, 0],
        mklJr:         [3, 1, 0],
        mlkDay:        [3, 1, 0],
        mlkJrDay:      [3, 1, 0],
        presidentsDay: [3, 1, 1],
        mothersDay:    [2, 0, 4],
        fathersDay:    [3, 0, 5],
        laborDay:      [1, 1, 8],
        columbusDay:   [2, 1, 9],
        thanksgiving:  [4, 4, 10]
    };
    var emptyWords = ['', 'st', 'nd', 'th', 'of'];
    var wordsToCamelCase = ['day', 'eve', 'gras', 'years', 'jr'];
    var splitParts = function (val) {
        var parts = val.split('-');
        var partsOut = [];
        for (var i = 0, len = parts.length; i < len; i++) {
            if ($.inArray(parts[i], emptyWords) === -1) {
                var camelIndex = $.inArray(parts[i], wordsToCamelCase);
                if (i > 0 && camelIndex > -1) {
                    var word = wordsToCamelCase[camelIndex];
                    partsOut[partsOut.length - 1] += word[0].toUpperCase() + word.slice(1);
                } else {
                    partsOut.push(parts[i]);
                }
            }
        }
        // console.log(val, partsOut);
        return partsOut;
    };
    var convertMonthText = function (parts) {
        var i, len, partsOut = [];
        for (i = 0, len = parts.length; i < len; i++) {
            var val = parts[i];
            for (var j = 0, len2 = shortMonths.length; j < len2; j++) {
                if (val.indexOf(shortMonths[j]) > -1) {
                    val = j + 1;
                    if (i > 0) {
                        var oldVal = partsOut[i - 1];
                        partsOut[i - 1] = val;
                        val = oldVal;
                    }
                    break;
                }
            }
            partsOut.push(val);
        }
        return partsOut;
    };
    var normalizeSpaces = function (val) {
        if (typeof val !== 'string') {
            return '';
        }
        val = val.toLowerCase();
        val = val.replace(/\./g, '-');
        val = val.replace(/ /g,  '-');
        val = val.replace(/\//g, '-');
        val = val.replace(/'/g, '');
        val = val.replace('black-friday', 'blackFriday');
        val = val.replace('cyber-monday', 'cyberMonday');
        val = val.replace('good-friday', 'goodFriday');
        var ddmm = val.match(/[0-9][a-z]/);
        if (ddmm) {
            ddmm = ddmm[0];
            val = val.replace(ddmm, ddmm[0] + '-' + ddmm[1]);
        }
        var mmdd = val.match(/[a-z][0-9]/);
        if (mmdd) {
            mmdd = mmdd[0];
            val = val.replace(mmdd, mmdd[0] + '-' + mmdd[1]);
        }
        return val;
    };
    var getNthDayOfMonth = function (nth, day, month, year) {
        var first = new Date(year, month, 1).getDay();
        var firstDay = (day + 8 - first) % 7;
        if (firstDay === 0) {
            firstDay += 7;
        }
        return new Date(year, month, firstDay + (7 * (nth - 1)));
    };
    var holidaysForYear = {
        mardiGras: function (year) {
            var easter = holidaysForYear.easter(year);
            return new Date(year, easter.getMonth(), easter.getDate() - 47);
        },
        goodFriday: function (year) {
            var easter = holidaysForYear.easter(year);
            return new Date(year, easter.getMonth(), easter.getDate() - 2);
        },
        easter: function (year) {
            var daysBeforeApr19 = (((year % 19) * 11) + 5) % 30;
            if (daysBeforeApr19 === 0) {
                daysBeforeApr19 = 1;
            } else if (daysBeforeApr19 === 1) {
                daysBeforeApr19 = 2;
            }
            var fullMoon = new Date(year, 3, 19 - daysBeforeApr19);
            var sundayOffset = (7 - fullMoon.getDay());
            return new Date(year, 3, 19 - daysBeforeApr19 + sundayOffset);
        },
        taxDay: function (year) {
            var taxDay = new Date(year, 3, 15);
            var day = taxDay.getDay();
            if (day === 5 || day === 6) {
                taxDay = new Date(year, 3, 18);
            } else if (day === 0) {
                taxDay = new Date(year, 3, 17);
            }
            return taxDay;
        },
        memorialDay: function (year) {
            var memorialDay = getNthDayOfMonth(5, 1, 4, year);
            if (memorialDay.getMonth() === 5) {
                memorialDay = getNthDayOfMonth(4, 1, 4, year);
            }
            return memorialDay;
        },
        electionDay: function (year) {
            var d = getNthDayOfMonth(1, 1, 10, year);
            return new Date(year, d.getMonth(), d.getDate() + 1);
        },
        blackFriday: function (year) {
            var t = holidaysOnNthDay.thanksgiving;
            var thanksgiving = getNthDayOfMonth(t[0], t[1], t[2], year);
            return new Date(year, thanksgiving.getMonth(), thanksgiving.getDate() + 1);
        },
        cyberMonday: function (year) {
            var t = holidaysOnNthDay.thanksgiving;
            var thanksgiving = getNthDayOfMonth(t[0], t[1], t[2], year);
            return new Date(year, thanksgiving.getMonth(), thanksgiving.getDate() + 4);
        }
    };
    var checkSpecialStrings = function (parts) {
        var year = refDate.getFullYear();
        for (var i = 0, len = parts.length; i < len; i++) {
            var val = parts[i];
            var d = null;
            var date;
            if (constantHolidays[val]) {
                date = new Date(year, constantHolidays[val][0], constantHolidays[val][1]);
                if (date < refDate) {
                    date = new Date(year + 1, constantHolidays[val][0], constantHolidays[val][1]);
                }
                return date;
            } else if (holidaysOnNthDay[val]) {
                var h = holidaysOnNthDay[val];
                date = getNthDayOfMonth(h[0], h[1], h[2], year);
                if (date < refDate) {
                    date = getNthDayOfMonth(h[0], h[1], h[2], year + 1);
                }
                return date;
            } else if (holidaysForYear[val]) {
                date = holidaysForYear[val](year);
                if (date < refDate) {
                    date = holidaysForYear[val](year + 1);
                }
                return date;
            }
            switch (val) {
                case'today':
                    d = 0;
                    break;
                case 'tomorrow':
                    d = 1;
                    break;
            }
            if (d !== null) {
                return new Date(year, refDate.getMonth(), refDate.getDate() + d);
            }
            var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            var ds   = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            var idx = $.inArray(val, days);
            if (idx === -1) {
                idx = $.inArray(val, ds);
            }
            if (idx > -1) {
                var currentDay = refDate.getDay();
                var diff = (7 + idx - currentDay) % 7;
                if (diff === 0 && i > 0 && parts[i - 1] === 'next') {
                    diff = 7;
                }
                return new Date(year, refDate.getMonth(), refDate.getDate() + diff);
            }
        }
        return parts;
    };
    var checkDayAndMonth = function (dateParts) {
        if (isNaN(dateParts.day) && !isNaN(dateParts.month)) {
            // when just entering one number
            dateParts.day = dateParts.month + 1;
            dateParts.month = refDate.getMonth();
            dateParts.inputMonth = NaN;
            if (dateParts.day < refDate.getDate()) {
                dateParts.month++;
            }
        }
        return dateParts;
    };
    var checkYear = function (dateParts) {
        if (dateParts.year < 100) {
            dateParts.year += 2000;
        }
        if (dateParts.month < refDate.getMonth() && !dateParts.inputYear) {
            dateParts.year++;
        }
    };
    var setRefDate = function (referenceDate) {
        if (typeof referenceDate === 'object') {
            refDate = referenceDate;
        } else {
            var d = new Date();
            refDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        }
    };
    return function (val, referenceDate) {
        var dateParts, parts, date;

        if (!val) {
            return null;
        }

        setRefDate(referenceDate);
        val     = normalizeSpaces(val);
        parts   = splitParts(val);
        date    = checkSpecialStrings(parts);
        if (date !== parts) {
            return date;
        }
        parts   = convertMonthText(parts);

        var month = parseInt(parts[0], 10) - 1;
        dateParts = {
            month: month,
            day:   parseInt(parts[1], 10),
            year:  parts.length < 3 ? refDate.getFullYear() : parseInt(parts[2], 10),
            inputMonth: month,
            inputYear:  parts.length < 3 ? null : parseInt(parts[2], 10)
        };
        checkDayAndMonth(dateParts);
        checkYear(dateParts);

        if (isNaN(dateParts.day)) {
            return null;
        }

        date = new Date(dateParts.year, dateParts.month, dateParts.day);
        if (!isNaN(dateParts.inputMonth) && date.getMonth() !== dateParts.inputMonth) {
            return null;
        }
        return date;
    };
}
