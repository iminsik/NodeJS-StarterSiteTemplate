function datepicker(id, modal) {
    this.$id = $('#' +id); // calendar container div id (<div id="as-datepicker")
	this.$monthObj = this.$id.find('#month');
	this.$monthLabel = this.$id.find('#month-label');
	this.$prev = this.$id.find('#btn-prev');
	this.$next = this.$id.find('#btn-next');
	this.$grid = this.$id.find('#cal1');
	this.$target = null; // div or text box that will receive the selected date string and focus (if modal)
                         // $target should be set when click or enter key hit, should not be set in constructor
	this.bModal = modal; // true if datepicker should appear in a modal dialog box.
	this.isVisible = false;

	this.monthNames = ['January', 'February', 'March', 'April','May','June',
			'July', 'August', 'September', 'October', 'November', 'December'];

	this.shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	this.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	this.keys = {
		tab:       9,
		enter:    13,
		esc:      27,
		space:    32,
		pageup:   33,
		pagedown: 34,
		end:      35,
		home:     36,
		left:     37,
		up:       38,
		right:    39,
		down:     40
	};

	var today = new Date();
	this.minDate = today;
	this.maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 330);

	this.curYear = today.getFullYear();
	this.curMonth = today.getMonth();
	this.setActiveDate(today);

	this.bindHandlers();

	// hide dialog if in modal mode
	if (this.bModal === true) {
		this.$id.attr('aria-hidden', 'true');
	}
}

datepicker.prototype.setActiveDate = function (dateObj) {
	if (dateObj > this.maxDate) {
		dateObj = this.maxDate;
	} else if (dateObj < this.minDate) {
		dateObj = this.minDate;
	}
	this.dateObj = dateObj;
	this.year    = this.dateObj.getFullYear();
	this.month   = this.dateObj.getMonth();
	this.date    = this.dateObj.getDate();
	this.currentDate = this.year === this.curYear && this.month === this.curMonth;

	this.setMonthDropdown();

	// update the table's activedescdendant to point to the current day
	this.$grid.attr('aria-activedescendant', 'day' + this.date);

	// populate the calendar grid
	this.popGrid();
};

datepicker.prototype.setMonthDropdown = function () {
	// display the current month
	var date = this.minDate;
	var select = '<select id="month-dropdown" tabindex="0" aria-label="Jump to month">';
	while (date <= this.maxDate) {
		var month = date.getMonth();
		var year = date.getFullYear();
		var selected = '';
		if (month === this.month && year === this.year) {
			selected = ' selected="selected"';
		}
		select += '<option value="' + date.toString() + '"' + selected + '>' + this.shortMonthNames[month] + ' ' + year + '</option>';
		date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
	}
	select += '</select>';
	this.$monthObj.html(select);
	this.$monthLabel.html(this.monthNames[this.month] + ' ' + this.year);
};

datepicker.prototype.getTarget = function (target) {
    return $('#' + target);
};

datepicker.prototype.setTarget = function (target) {
    this.$target = $('#' + target);
};

datepicker.prototype.setMinDate = function (dateObj) {
	this.minDate = dateObj;
	this.popGrid();
};

datepicker.prototype.setMaxDate = function (dateObj) {
	this.maxDate = dateObj;
	this.popGrid();
}

datepicker.prototype.setCloseCb = function (closeCb) {
	this.closeCb = closeCb;
};

//
// popGrid() is a member function to populate the datepicker grid with calendar days
// representing the current month
//
// @return N/A
//
datepicker.prototype.popGrid = function() {

	var numDays = this.calcNumDays(this.year, this.month);
	var startWeekday = this.calcStartWeekday(this.year, this.month);
	var weekday      = 0;
	var curDay       = 1;
	var rowCount     = 1;
	var $tbody = this.$grid.find('tbody');

	var gridCells = '\t<tr role="row">\n';

	// clear the grid
	$tbody.empty();
	$('#msg').empty();

	// Insert the leading empty cells
	for (weekday = 0; weekday < startWeekday; weekday++) {

		gridCells += '\t\t<td class="empty">&nbsp;</td>\n';
	}

	// insert the days of the month.
	var isMinMonth = this.isMinMonth();
	var isMaxMonth = this.isMaxMonth();
	var maxDay = this.maxDate.getDate();
	var minDay = this.minDate.getDate();

	var active = this.$grid.attr('aria-activedescendant');
	if (active) {
		var ariaDate = parseInt(active.replace(/day/, ''), 10);
		if (isMinMonth && ariaDate < minDay) {
			this.date = minDay;
			this.$grid.attr('aria-activedescendant', 'day' + minDay);
		} else if (isMaxMonth && ariaDate > maxDay) {
			this.date = maxDay;
			this.$grid.attr('aria-activedescendant', 'day' + maxDay);
		}
	}

	for (curDay = 1; curDay <= numDays; curDay++) {

		var isDisabled = (isMinMonth && curDay < minDay) || (isMaxMonth && curDay > maxDay);

		if (isDisabled) {
			gridCells += '\t\t<td id="day' + curDay + '" class="disabled"';
		} else if (curDay === this.date && this.currentDate === true) {
			gridCells += '\t\t<td id="day' + curDay + '" class="today"';
		} else {
			gridCells += '\t\t<td id="day' + curDay + '"';
		}
		gridCells += ' headers="' + this.dayNames[weekday] + '" role="gridcell" aria-selected="false">' + curDay + '</td>';


		if (weekday === 6 && curDay < numDays) {
			// This was the last day of the week, close it out
			// and begin a new one
			gridCells += '\t</tr>\n\t<tr id="row' + rowCount + '" role="row">\n';
			rowCount++;
			weekday = 0;
		} else {
			weekday++;
		}
	}

	// Insert any trailing empty cells
	for (weekday; weekday < 7; weekday++) {

		gridCells += '\t\t<td class="empty">&nbsp;</td>\n';
	}

	gridCells += '\t</tr>';

	$tbody.append(gridCells);
};

//
// calcNumDays() is a member function to calculate the number of days in a given month
//
// @return (integer) number of days
//
datepicker.prototype.calcNumDays = function(year, month) {

	return 32 - new Date(year, month, 32).getDate();
};

//
// calcstartWeekday() is a member function to calculate the day of the week the first day of a
// month lands on
//
// @return (integer) number representing the day of the week (0=Sunday....6=Saturday)
//
datepicker.prototype.calcStartWeekday = function(year, month) {

	return  new Date(year, month, 1).getDay();

}; // end calcStartWeekday()

datepicker.prototype.isMinMonth = function () {
	var minYr = this.minDate.getFullYear();
	if (this.year < minYr || (this.year === minYr && this.month <= this.minDate.getMonth())) {
		return true;
	}
	return false;
};

datepicker.prototype.isMaxMonth = function () {
	var maxYr = this.maxDate.getFullYear();
	if (this.year > maxYr || (this.year === maxYr && this.month >= this.maxDate.getMonth())) {
		return true;
	}
	return false;
};

datepicker.prototype.disablePrevBtn = function (isDisabled) {
	this.$prev[isDisabled ? 'addClass' : 'removeClass']('disabled');
};

datepicker.prototype.disableNextBtn = function (isDisabled) {
	this.$next[isDisabled ? 'addClass' : 'removeClass']('disabled');
};

datepicker.prototype.updateButtons = function () {
	this.disablePrevBtn(this.isMinMonth());
	this.disableNextBtn(this.isMaxMonth());
};


//
// showPrevMonth() is a member function to show the previous month
//
// @param (offset int) offset may be used to specify an offset for setting
//                      focus on a day the specified number of days from
//                      the end of the month.
// @return N/A
//
datepicker.prototype.showPrevMonth = function(offset) {
	// show the previous month if it's within bounds
	if (this.isMinMonth()) {
		return false;
	}

	if (this.month === 0) {
		this.month = 11;
		this.year--;
	} else {
		this.month--;
	}

	if (this.month !== this.curMonth || this.year !== this.curYear) {
		this.currentDate = false;
	} else {
		this.currentDate = true;
	}

	// populate the calendar grid
	this.popGrid();

	this.setMonthDropdown();

	// if offset was specified, set focus on the last day - specified offset
	if (offset != null) {
		var numDays = this.calcNumDays(this.year, this.month);
		var day = 'day' + (numDays - offset);

		this.$grid.attr('aria-activedescendant', day);
		$('#' + day).addClass('focus').attr('aria-selected', 'true');
	}

	this.updateButtons();

}; // end showPrevMonth()

//
// showNextMonth() is a member function to show the next month
//
// @param (offset int) offset may be used to specify an offset for setting
//                      focus on a day the specified number of days from
//                      the beginning of the month.
// @return N/A
//
datepicker.prototype.showNextMonth = function(offset) {

	// show the next month if it's within bounds
	if (this.isMaxMonth()) {
		return false;
	}

	if (this.month === 11) {
		this.month = 0;
		this.year++;
	} else {
		this.month++;
	}

	if (this.month !== this.curMonth || this.year !== this.curYear) {
		this.currentDate = false;
	} else {
		this.currentDate = true;
	}

	// populate the calendar grid
	this.popGrid();

	this.setMonthDropdown();

	// if offset was specified, set focus on the first day + specified offset
	if (offset != null) {
		var day = 'day' + offset;

		this.$grid.attr('aria-activedescendant', day);
		$('#' + day).addClass('focus').attr('aria-selected', 'true');
	}

	this.updateButtons();

}; // end showNextMonth()

//
// showPrevYear() is a member function to show the previous year
//
// @return N/A
//
datepicker.prototype.showPrevYear = function() {

	// decrement the year
	this.year--;

	if (this.isMinMonth()) {
		this.month = this.minDate.getMonth();
		this.year  = this.minDate.getFullYear();
	}

	if (this.month !== this.curMonth || this.year !== this.curYear) {
		this.currentDate = false;
	} else {
		this.currentDate = true;
	}

	// populate the calendar grid
	this.popGrid();

	this.setMonthDropdown();

	this.updateButtons();

}; // end showPrevYear()

//
// showNextYear() is a member function to show the next year
//
// @return N/A
//
datepicker.prototype.showNextYear = function() {

	// increment the year
	this.year++;

	if (this.isMaxMonth()) {
		this.month = this.maxDate.getMonth();
		this.year  = this.maxDate.getFullYear();
	}

	if (this.month !== this.curMonth || this.year !== this.curYear) {
		this.currentDate = false;
	} else {
		this.currentDate = true;
	}

	// populate the calendar grid
	this.popGrid();

	this.setMonthDropdown();

	this.updateButtons();
}; // end showNextYear()

//
// bindHandlers() is a member function to bind event handlers for the widget
//
// @return N/A
//
datepicker.prototype.bindHandlers = function() {

	var thisObj = this;

	////////////////////// bind button handlers //////////////////////////////////
	this.$prev.click(function(e) {
		return thisObj.handlePrevClick(e);
	});

	this.$next.click(function(e) {
		return thisObj.handleNextClick(e);
	});

	this.$prev.keydown(function(e) {
		return thisObj.handlePrevKeyDown(e);
	});

	this.$next.keydown(function(e) {
		return thisObj.handleNextKeyDown(e);
	});

	this.$id.delegate('#month-dropdown', 'change', function (e) {
		if (e.which === thisObj.keys.down) {
			return true;
		}
		var theDate = new Date($(this).val());
		thisObj.setActiveDate(theDate);
		$('#month-dropdown').focus();
	});

	///////////// bind grid handlers //////////////

	this.$grid.keydown(function(e) {
		return thisObj.handleGridKeyDown(e);
	});

	this.$grid.keypress(function(e) {
		return thisObj.handleGridKeyPress(e);
	});

	this.$grid.focus(function(e) {
		return thisObj.handleGridFocus(e);
	});

	this.$grid.blur(function(e) {
		return thisObj.handleGridBlur(e);
	});

	this.$grid.delegate('td', 'click', function(e) {
		return thisObj.handleGridClick(this, e);
	});

}; // end bindHandlers();

//
// handlePrevClick() is a member function to process click events for the prev month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handlePrevClick = function(e) {

	if (e.ctrlKey) {
		this.showPrevYear();
	} else {
		this.showPrevMonth();
	}

	var active = this.$grid.attr('aria-activedescendant');
	if (this.currentDate === false) {
		this.$grid.attr('aria-activedescendant', 'day1');
	} else {
		this.$grid.attr('aria-activedescendant', active);
	}

	e.stopPropagation();
	return false;

}; // end handlePrevClick()

//
// handleNextClick() is a member function to process click events for the next month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleNextClick = function(e) {

	if (e.ctrlKey) {
		this.showNextYear();
	} else {
		this.showNextMonth();
	}

	var active = this.$grid.attr('aria-activedescendant');
	if (this.currentDate === false) {
		this.$grid.attr('aria-activedescendant', 'day1');
	} else {
		this.$grid.attr('aria-activedescendant', active);
	}

	e.stopPropagation();
	return false;

}; // end handleNextClick()

//
// handlePrevKeyDown() is a member function to process keydown events for the prev month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handlePrevKeyDown = function(e) {

	if (e.altKey) {
		return true;
	}

	switch (e.keyCode) {
		case this.keys.tab: {
			if (this.bModal === false || !e.shiftKey || e.ctrlKey) {
				return true;
			}

			this.$grid.focus();
			e.stopPropagation();
			return false;
		}
		case this.keys.enter:
		case this.keys.space: {
			if (e.shiftKey) {
				return true;
			}

			if (e.ctrlKey) {
				this.showPrevYear();
			}
			else {
				this.showPrevMonth();
			}

			e.stopPropagation();
			return false;
		}
	}

	return true;

}; // end handlePrevKeyDown()

//
// handleNextKeyDown() is a member function to process keydown events for the next month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleNextKeyDown = function(e) {

	if (e.altKey) {
		return true;
	}

	switch (e.keyCode) {
		case this.keys.enter:
		case this.keys.space: {

			if (e.ctrlKey) {
				this.showNextYear();
			}
			else {
				this.showNextMonth();
			}

			e.stopPropagation();
			return false;
		}
	}

	return true;

}; // end handleNextKeyDown()

//
// handleGridKeyDown() is a member function to process keydown events for the datepicker grid
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleGridKeyDown = function(e) {

		var $rows = this.$grid.find('tbody tr');
		var $curDay = $('#' + this.$grid.attr('aria-activedescendant'));
		var $days = this.$grid.find('td').not('.empty');
		var $curRow = $curDay.parent();

		if (e.altKey) {
			return true;
		}

		switch(e.keyCode) {
			case this.keys.tab: {

				if (this.bModal === true) {
					if (e.shiftKey) {
						this.$next.focus();
					}
					else {
						this.$prev.focus();
					}
					e.stopPropagation();
					return false;
				}
				break;
			}
			case this.keys.enter:
			case this.keys.space: {

				if (e.ctrlKey) {
					return true;
				}
				this.setDate($curDay);

				// fall through
			}
			case this.keys.esc: {
				// dismiss the dialog box
				this.hideDlg(e.keyCode === this.keys.esc);

				e.stopPropagation();
				return false;
			}
			case this.keys.left: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				var dayIndex = $days.index($curDay) - 1;
				var $prevDay = null;

				if (dayIndex >= 0) {
					$prevDay = $days.eq(dayIndex);
					if ($prevDay.hasClass('disabled')) {
						return false;
					}

					$curDay.removeClass('focus').attr('aria-selected', 'false');
					$prevDay.addClass('focus').attr('aria-selected', 'true');

					this.$grid.attr('aria-activedescendant', $prevDay.attr('id'));
				} else {
					this.showPrevMonth(0);
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.right: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				var dayIndex = $days.index($curDay) + 1;
				var $nextDay = null;

				if (dayIndex < $days.length) {
					$nextDay = $days.eq(dayIndex);
					if ($nextDay.hasClass('disabled')) {
						return false;
					}

					$curDay.removeClass('focus').attr('aria-selected', 'false');
					$nextDay.addClass('focus').attr('aria-selected', 'true');

					this.$grid.attr('aria-activedescendant', $nextDay.attr('id'));
				} else {
					// move to the next month
					this.showNextMonth(1);
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.up: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				var dayIndex = $days.index($curDay) - 7;
				var $prevDay = null;

				if (dayIndex >= 0) {
					$prevDay = $days.eq(dayIndex);
					if ($prevDay.hasClass('disabled')) {
						return false;
					}

					$curDay.removeClass('focus').attr('aria-selected', 'false');
					$prevDay.addClass('focus').attr('aria-selected', 'true');

					this.$grid.attr('aria-activedescendant', $prevDay.attr('id'));
				} else {
					// move to appropriate day in previous month
					dayIndex = 6 - $days.index($curDay);

					this.showPrevMonth(dayIndex);
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.down: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				var dayIndex = $days.index($curDay) + 7;
				var $prevDay = null;

				if (dayIndex < $days.length) {
					$prevDay = $days.eq(dayIndex);
					if ($prevDay.hasClass('disabled')) {
						return false;
					}

					$curDay.removeClass('focus').attr('aria-selected', 'false');
					$prevDay.addClass('focus').attr('aria-selected', 'true');

					this.$grid.attr('aria-activedescendant', $prevDay.attr('id'));
				} else {
					// move to appropriate day in next month
					dayIndex = 8 - ($days.length - $days.index($curDay));

					this.showNextMonth(dayIndex);
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.pageup: {
				var active = this.$grid.attr('aria-activedescendant');


				if (e.shiftKey) {
					return true;
				}


				if (e.ctrlKey) {
					this.showPrevYear();
				} else {
					this.showPrevMonth();
				}

				if (this.isMinMonth()) {
					active = 'day' + this.minDate.getDate();
					this.$grid.attr('aria-activedescendant', active);
				}
				if ($('#' + active).attr('id') === undefined) {
					var lastDay = 'day' + this.calcNumDays(this.year, this.month);
					$('#' + lastDay).addClass('focus').attr('aria-selected', 'true');
				} else {
					$('#' + active).addClass('focus').attr('aria-selected', 'true');
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.pagedown: {
				var active = this.$grid.attr('aria-activedescendant');


				if (e.shiftKey) {
					return true;
				}

				if (e.ctrlKey) {
					this.showNextYear();
				} else {
					this.showNextMonth();
				}

				if (this.isMaxMonth()) {
					active = 'day' + this.maxDate.getDate();
					this.$grid.attr('aria-activedescendant', active);
				}
				if ($('#' + active).attr('id') === undefined) {
					var lastDay = 'day' + this.calcNumDays(this.year, this.month);
					$('#' + lastDay).addClass('focus').attr('aria-selected', 'true');
				} else {
					$('#' + active).addClass('focus').attr('aria-selected', 'true');
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.home: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				$curDay.removeClass('focus').attr('aria-selected', 'false');

				var firstDay = 'day1';
				if (this.isMinMonth()) {
					firstDay = 'day' + this.minDate.getDate();
				}
				$('#' + firstDay).addClass('focus').attr('aria-selected', 'true');
				this.$grid.attr('aria-activedescendant', firstDay);

				e.stopPropagation();
				return false;
			}
			case this.keys.end: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				$curDay.removeClass('focus').attr('aria-selected', 'false');

				var lastDay = 'day' + this.calcNumDays(this.year, this.month);
				if (this.isMaxMonth()) {
					lastDay = 'day' + this.maxDate.getDate();
				}
				$('#' + lastDay).addClass('focus').attr('aria-selected', 'true');

				this.$grid.attr('aria-activedescendant', lastDay);

				e.stopPropagation();
				return false;
			}
		}

		return true;

}; // end handleGridKeyDown()

//
// handleGridKeyPress() is a member function to consume keypress events for browsers that
// use keypress to scroll the screen and manipulate tabs
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleGridKeyPress = function(e) {

		if (e.altKey) {
			return true;
		}

		switch(e.keyCode) {
			case this.keys.tab:
			case this.keys.enter:
			case this.keys.space:
			case this.keys.esc:
			case this.keys.left:
			case this.keys.right:
			case this.keys.up:
			case this.keys.down:
			case this.keys.pageup:
			case this.keys.pagedown:
			case this.keys.home:
			case this.keys.end: {
				e.stopPropagation();
				return false;
			}
		}

		return true;

}; // end handleGridKeyPress()

datepicker.prototype.handleGridClick = function(id, e) {
	var $cell = $(id);

	if ($cell.is('.empty') || $cell.is('.disabled')) {
		return true;
	}

	var cellId = $cell.attr('id');
	this.$grid.find('.active').removeClass('active').attr('aria-selected', 'false');
	$cell.addClass('active').attr('aria-selected', 'true');
	this.$grid.attr('aria-activedescendant', cellId);

	var $curDay = $('#' + cellId);

	this.setDate($curDay);

	this.hideDlg();
	e.stopPropagation();

	var next = this.$target.attr('next-id');
	$('#' + next).focus().click();

	return false;
};

datepicker.prototype.setDate = function ($curDay) {
    this.$target.val((this.month + 1) + '/' + $curDay.html() + '/' + (this.year - 2000));
    this.$target.trigger('change');
    this.handleDateSelection($curDay.html());
}

//
// handleGridFocus() is a member function to process focus events for the datepicker grid
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) true
//
datepicker.prototype.handleGridFocus = function (e) {
	var active = this.$grid.attr('aria-activedescendant');

	if ($('#' + active).attr('id') === undefined) {
		var lastDay = 'day' + this.calcNumDays(this.year, this.month);
		$('#' + lastDay).addClass('focus').attr('aria-selected', 'true');
	} else {
		$('#' + active).addClass('focus').attr('aria-selected', 'true');
	}

	return true;

}; // end handleGridFocus()

//
// handleGridBlur() is a member function to process blur events for the datepicker grid
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) true
//
datepicker.prototype.handleGridBlur = function (e) {
	$('#' + this.$grid.attr('aria-activedescendant')).removeClass('focus').attr('aria-selected', 'false');

	return true;

}; // end handleGridBlur()


datepicker.prototype.handleDateSelection = function (dayOfMonth) {
	this.date = dayOfMonth;
	this.$grid.find('.selected').removeClass('selected');
	this.$grid.find('.focus').removeClass('focus');
	$('#day' + dayOfMonth).addClass('selected');
	return true;
};

//
// showDlg() is a member function to show the datepicker and give it focus. This function is only called if
// the datepicker is used in modal dialog mode.
//
// @return N/A
//
datepicker.prototype.showDlg = function() {

	var thisObj = this;

	this.isVisible = true;
	this.isGridClick = false;

	this.$id.bind('click', function () {
		thisObj.isGridClick = true;
	});

	// Bind an event listener to the document to capture all mouse events to make dialog modal
	$(document).bind('click', {asDatepicker: this}, this.documentClick);

	this.$grid.bind('mouseover', function () {
		thisObj.$grid.find('focus').removeClass('focus');
	});

	this.popGrid();

	// show the dialog
	this.$id.attr('aria-hidden', 'false');

	this.$grid.focus();

	var currentValue = new Date(this.$target.val());
	if (!isNaN(currentValue.getTime())) {
	    $('#day' + currentValue.getDate()).addClass('focus');
	    this.handleDateSelection(currentValue.getDate());
    }
}; // end showDlg()

datepicker.prototype.documentClick = function (e) {
	var thisObj = e.data.asDatepicker;
	if (thisObj.isGridClick) {
		thisObj.isGridClick = false;
	} else {
		thisObj.hideDlg(false, true);
		return false;
	}
};

//
// hideDlg() is a member function to hide the datepicker and remove focus. This function is only called if
// the datepicker is used in modal dialog mode.
//
// @return N/A
//
datepicker.prototype.hideDlg = function (isEsc, isDocumentClick) {

	this.isVisible = false;

	// unbind the modal event sinks
	$(document).unbind('click', this.documentClick);
	this.$grid.unbind('mouseover');
	this.$id.unbind('click');

	// hide the dialog
	this.$id.attr('aria-hidden', 'true');

	if (!isEsc && this.closeCb && !isDocumentClick) {
		this.closeCb();
	}
	if (!isDocumentClick) {
		// set focus on the focus target
		this.$target.focus();
	}

}; // end showDlg()

