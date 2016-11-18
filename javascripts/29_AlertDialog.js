var AS = window.AS || {};

AS.AlertDialog = function (title, message, callback) {
    this.title = title;
    this.message = message;
    this.isConfirmDialog;
    this.divElement = document.createElement('div');
    this.divElement.setAttribute('role', 'dialog');
    this.divElement.setAttribute('aria-label', title);
    this.divElement.tabIndex = 0;
    this.divElement.classList.add('confirm-dialog-container');
    this.hasRadioGroup = false;
    this.previousElement = null;
    this.focusHandler = null;
    this.elementsHiddenOnOpen = null;
    this.callback = callback;
};

AS.AlertDialog.prototype.Close = function (isConfirmed) {
    document.body.style.overflow = 'auto';

    var radioGroupValue;
    if (this.hasRadioGroup) {
        var radioButtons = this.divElement.querySelectorAll('input[name=alertDialogRadio]');
        for (var x = 0; x < radioButtons.length; x += 1) {
            if (radioButtons[x].checked) {
                radioGroupValue = radioButtons[x].value;
            }
        }
    }

    document.body.removeChild(this.divElement);
    if (this.previousElement) {
        this.previousElement.focus();
    }
    if (this.focusHandler) {
        document.removeEventListener('focus', this.focusHandler);
        this.focusHandler = null;
    }

    for (var x = 0; x < this.elementsHiddenOnOpen; x += 1) {
        this.elementsHiddenOnOpen[x].removeAttribute('aria-hidden');
    }
    this.elementsHiddenOnOpen = null;

    if (this.callback) {
        this.callback(isConfirmed);
    }

    this.onclose(isConfirmed, radioGroupValue);
};

AS.AlertDialog.prototype.Confirm = function () {
    var continueButton = this.divElement.querySelector('.btn-primary');
    if (continueButton.getAttribute('disabled') === 'true') {
        return;
    }

    this.Close(true);
};

AS.AlertDialog.prototype.Cancel = function () {
    this.Close(false);
};

AS.AlertDialog.prototype.AttachEvents = function () {
    this.focusHandler = this.HandleFocusChange.bind(this);
    document.addEventListener('focus', this.focusHandler, true);

    var acceptButton = this.divElement.querySelector('.btn-primary');
    var cancelButton = this.divElement.querySelector('.btn-secondary');
    var background = this.divElement.querySelector('.confirm-dialog-background');
    background.onclick = this.Cancel.bind(this);
    acceptButton.onclick = this.Confirm.bind(this);
    if (cancelButton) {
        cancelButton.onclick = this.Cancel.bind(this);
    }
    this.divElement.onkeydown = function (e) {
        var evt = e || window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode === 27) { // esc
            this.Cancel();
        }
        else if (keyCode === 9) { // tab
            var focusables = $(this.divElement).find(':focusable');
            var handled = false;

            if (evt.shiftKey) { // shift+tab
                if (document.activeElement === this.divElement) {
                    focusables[focusables.length - 1].focus();
                    handled = true;
                }
            }
            else {
                if (focusables[focusables.length - 1] === document.activeElement) {
                    this.divElement.focus();
                    handled = true;
                }
            }

            if (handled) {
                if (evt.preventDefault) {
                    evt.preventDefault();
                }
                return false;
            }
        }

        return true;
    }.bind(this);

    if (this.hasRadioGroup) {
        var continueButton = this.divElement.querySelector('.btn-primary');
        continueButton.classList.add('disabled');
        continueButton.setAttribute('disabled', 'true');

        var radioButtons = this.divElement.querySelectorAll('input[name=alertDialogRadio]');
        for (var x = 0; x < radioButtons.length; x += 1) {
            radioButtons[x].onclick = this.HandleRadioGroupSelection.bind(this);
        }
    }
};

AS.AlertDialog.prototype.HandleRadioGroupSelection = function (e) {
    var continueButton = this.divElement.querySelector('.btn-primary');
    continueButton.classList.remove('disabled');
    continueButton.removeAttribute('disabled');
};

AS.AlertDialog.prototype.HandleFocusChange = function (e) {
    var evt = e || window.event;
    // For accessibility, we must trap the focus in the dialog.
    if (!this.divElement.contains(evt.target)) {
        evt.stopPropagation();
        this.divElement.focus();
        return false;
    }
};

AS.AlertDialog.prototype.onclose = function () { };

AS.AlertDialog.prototype.SetConfirmDialog = function (isConfirmDialog) {
    this.isConfirmDialog = isConfirmDialog;
};

AS.AlertDialog.prototype.Show = function (isConfirmationDialog, options) {
    options = options || {};
    this.SetConfirmDialog(isConfirmationDialog);
    this.previousElement = document.activeElement;

    var acceptText = options.acceptText || (this.isConfirmDialog ? 'Okay' : 'Close');
    var cancelText = options.cancelText || 'Cancel';
    var isAutoSize = options.autoSize || false;

    var html = '<div class="confirm-dialog-background"></div>';
    html += '<div class="confirm-dialog' + (isAutoSize ? ' autosize' : '') + '">';
    if (this.title) {
        html += '<h2>' + this.title + '</h2>';
    }
    html += '<div class="confirm-dialog-content">';
    if (this.message) {
        html += '<p>' + this.message + '</p>';
    }
    if (options.radioGroup) {
        this.hasRadioGroup = true;
        for (var option in options.radioGroup) {
            html += '<label><input type="radio" name="alertDialogRadio" value="' + option + '" /> ' + options.radioGroup[option] + '</label>';
        }
    }
    html += '</div>';
    html += '<div class="confirm-dialog-actions">';
    if (this.isConfirmDialog) {
        html += '<button class="btn btn-secondary">' + cancelText + '</button>';
    }
    html += '<button class="btn btn-primary">' + acceptText + '</button>';
    html += '</div>';
    html += '</div>';
    this.divElement.innerHTML = html;
    document.body.appendChild(this.divElement);
    this.AttachEvents();

    this.elementsHiddenOnOpen = [];
    var sibling = this.divElement.nextElementSibling;
    while (sibling) {
        if (!sibling.getAttribute('aria-hidden')) {
            sibling.setAttribute('aria-hidden', 'true');
            this.elementsHiddenOnOpen.push(sibling);
        }
        sibling = sibling.nextElementSibling;
    }
    sibling = this.divElement.previousElementSibling;
    while (sibling) {
        if (!sibling.getAttribute('aria-hidden')) {
            sibling.setAttribute('aria-hidden', 'true');
            this.elementsHiddenOnOpen.push(sibling);
        }
        sibling = sibling.previousElementSibling;
    }

    this.PositionDialogBox();

    this.divElement.focus();
};

AS.AlertDialog.prototype.PositionDialogBox = function () {
    var $dialogBackground = $('.confirm-dialog-background'),
        $confirmDialogContainer = $('.confirm-dialog-container'),
        $dialog = $('.confirm-dialog');

    $confirmDialogContainer.removeClass('container-for-tall-dialog');

    if ($dialogBackground.length > 0 && $dialogBackground.css('display').toLowerCase() !== 'none') {

        if ($dialog.hasClass('autosize')) {

            $confirmDialogContainer.addClass('container-for-tall-dialog');

            var
                dialogHeight = $dialog.outerHeight(),
                windowHeight = $(window).height();

            document.body.style.overflow = windowHeight > dialogHeight ? 'hidden' : 'auto';

            var top = 0;
            if (windowHeight > dialogHeight) {
                top = (windowHeight - dialogHeight) / 2.0;
            }
            $dialog.css('top', top);

            document.documentElement.scrollTop = document.body.scrollTop = 0;
        } else {
            document.body.style.overflow = 'hidden';
        }
    } else {
        document.body.style.overflow = 'auto';
    }
};

$(document).ready(function () {
    $(window).resize(function () {
        AS.AlertDialog.prototype.PositionDialogBox();
    });
});
