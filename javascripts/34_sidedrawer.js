var LiteEvent = (function () {
    function LiteEvent() {
        this.handlers = [];
    }
    LiteEvent.prototype.on = function (handler) {
        this.handlers.push(handler);
    };
    LiteEvent.prototype.off = function (handler) {
        this.handlers = this.handlers.filter(function (h) { return h !== handler; });
    };
    LiteEvent.prototype.trigger = function (data) {
        if (this.handlers) {
            for (var x = 0; x < this.handlers.length; x += 1) {
                this.handlers[x](data);
            }
        }
    };
    return LiteEvent;
}());
/// <reference path="../seatmaps/LiteEvent.ts" />
var SideDrawer = (function () {
    function SideDrawer(title, description) {
        this.scroll = new LiteEvent();
        this.title = title;
        this.description = description;
    }
    SideDrawer.prototype.IsClosed = function () { return this.isClosed; };
    SideDrawer.prototype.ContentDiv = function () { return this.contentDiv; };
    SideDrawer.prototype.Scroll = function () {
        return this.scroll;
    };
    SideDrawer.prototype.TitleHeight = function () {
        if (!this.titleHeight) {
            this.titleHeight = this.titleDiv.clientHeight;
        }
        return this.titleHeight;
    };
    SideDrawer.prototype.Show = function () {
        this.focusOnClose = document.activeElement;
        if (!this.rootDiv) {
            this.rootDiv = this.Render();
            this.contentDiv = this.rootDiv.querySelector('.drawerContent-dynamic');
            document.querySelector('body').appendChild(this.rootDiv);
        }
        else {
            this.rootDiv.style.display = 'block';
            this.rootDiv.classList.add('rightSideDrawer');
        }
        var html = document.querySelector('html');
        html.style['-ms-overflow-style'] = 'none';
        html.style['overflow'] = 'hidden';
        this.focusHandler = this.HandleFocusChange.bind(this);
        this.escHandler = this.HandleEscKey.bind(this);
        document.addEventListener('focus', this.focusHandler, true);
        document.addEventListener('keydown', this.escHandler, true);
        if (this.contentDiv.innerHTML === '') {
            var spinnerElement = document.createElement('div');
            spinnerElement.classList.add('loading-spinner');
            this.contentDiv.appendChild(spinnerElement);
        }
        this.elementsHiddenOnOpen = [];
        var sibling = this.rootDiv.nextElementSibling;
        while (sibling) {
            if (!sibling.getAttribute('aria-hidden')) {
                sibling.setAttribute('aria-hidden', 'true');
                this.elementsHiddenOnOpen.push(sibling);
            }
            sibling = sibling.nextElementSibling;
        }
        sibling = this.rootDiv.previousElementSibling;
        while (sibling) {
            if (!sibling.getAttribute('aria-hidden')) {
                sibling.setAttribute('aria-hidden', 'true');
                this.elementsHiddenOnOpen.push(sibling);
            }
            sibling = sibling.previousElementSibling;
        }
        this.rootDiv.focus();
        this.isShown = true;
        return this.contentDiv;
    };
    SideDrawer.prototype.HandleEscKey = function (event) {
        if (event.keyCode == 27) {
            this.Close(event);
        }
    };
    SideDrawer.prototype.HandleClickToClose = function (event) {
        this.Close(event);
    };
    SideDrawer.prototype.HandleFocusChange = function (event) {
        // For accessibility, we must trap the focus in the drawer.
        if (!this.rootDiv.contains(event.target)) {
            event.stopPropagation();
            this.rootDiv.focus();
            return false;
        }
    };
    SideDrawer.prototype.Close = function (e) {
        if (this.isClosed) {
            return;
        }
        this.closeAnchor.parentElement.removeChild(this.closeAnchor);
        while (this.contentDiv.childElementCount > 0) {
            this.contentDiv.removeChild(this.contentDiv.firstChild);
        }
        var html = document.querySelector('html');
        html.style['-ms-overflow-style'] = 'auto';
        html.style['overflow'] = 'auto';
        this.rootDiv.classList.add('closeRightSideDrawer');
        var rd = this.rootDiv;
        var that = this;
        setTimeout(function () {
            rd.innerHTML = '';
            rd.style.display = 'none';
            rd.parentElement.removeChild(rd);
            that.focusOnClose.focus();
        }, 300);
        document.removeEventListener('focus', this.focusHandler);
        document.removeEventListener('keydown', this.escHandler);
        for (var x = 0; x < this.elementsHiddenOnOpen.length; x += 1) {
            this.elementsHiddenOnOpen[x].removeAttribute('aria-hidden');
        }
        this.elementsHiddenOnOpen = [];
        var evt = e || window.event;
        if (evt.preventDefault) {
            evt.preventDefault();
        }
        else {
            evt.cancelBubble = true;
        }
        this.isClosed = true;
        return false;
    };
    SideDrawer.prototype.TransferContent = function (contentContainer) {
        if (!this.isShown) {
            this.Show();
        }
        this.contentDiv.innerHTML = '';
        while (contentContainer.childNodes.length > 0) {
            var element = contentContainer.firstChild;
            contentContainer.removeChild(element);
            this.contentDiv.appendChild(element);
        }
        if (contentContainer.parentElement) {
            contentContainer.parentElement.removeChild(contentContainer);
        }
    };
    SideDrawer.prototype.AddClassToContent = function (className) {
        this.contentDiv.classList.add(className);
    };
    SideDrawer.prototype.RemoveClassFromContent = function (className) {
        this.contentDiv.classList.remove(className);
    };
    SideDrawer.prototype.HandleScrollEvent = function (e) {
        var evt = e || window.event;
        this.scroll.trigger((evt.srcElement || evt.target).scrollTop);
    };
    SideDrawer.prototype.ForwardArrowKeys = function (e) {
        // TODO: Forward the arrow keys to the drawerContent div.
    };
    SideDrawer.prototype.HandleSiftTabOnRootDiv = function (e) {
        if (document.activeElement === this.rootDiv) {
            var evt = (e || window.event);
            if (evt.keyCode == 9 && evt.shiftKey) {
                this.closeAnchor.focus();
                if (evt.preventDefault) {
                    evt.preventDefault();
                }
                return false;
            }
        }
        return true;
    };
    SideDrawer.prototype.HandleTabKeyOnCloseAnchor = function (e) {
        var evt = (e || window.event);
        if (evt.keyCode == 9 && !evt.shiftKey) {
            this.rootDiv.focus();
            if (evt.preventDefault) {
                evt.preventDefault();
            }
            return false;
        }
        return true;
    };
    SideDrawer.prototype.Render = function () {
        var rootDiv = document.createElement('div');
        rootDiv.setAttribute('aria-label', this.description);
        rootDiv.tabIndex = -1;
        rootDiv.classList.add('rightSideDrawer');
        rootDiv.setAttribute('role', 'dialog');
        rootDiv.style['-ms-overflow-style'] = 'auto';
        rootDiv.onkeydown = this.HandleSiftTabOnRootDiv.bind(this);
        var drawerBackground = document.createElement('div');
        drawerBackground.classList.add('drawerBackground');
        rootDiv.appendChild(drawerBackground);
        drawerBackground.onclick = this.HandleClickToClose.bind(this);
        var drawerContent = document.createElement('div');
        drawerContent.classList.add('drawerContent');
        if (this.width) {
            drawerContent.style.width = this.width + 'px';
        }
        rootDiv.appendChild(drawerContent);
        drawerContent.onscroll = this.HandleScrollEvent.bind(this);
        this.titleDiv = document.createElement('h2');
        this.titleDiv.classList.add('slider-title');
        this.titleDiv.innerHTML = this.title;
        drawerContent.appendChild(this.titleDiv);
        var drawerContentDynamic = document.createElement('div');
        drawerContentDynamic.classList.add('drawerContent-dynamic');
        drawerContent.appendChild(drawerContentDynamic);
        this.closeAnchor = document.createElement('a');
        this.closeAnchor.classList.add('drawerClose');
        this.closeAnchor.title = 'Close dialog';
        this.closeAnchor.href = '#close';
        this.closeAnchor.onclick = this.Close.bind(this);
        this.closeAnchor.onkeydown = this.HandleTabKeyOnCloseAnchor.bind(this);
        drawerContent.appendChild(this.closeAnchor);
        var closeImg = document.createElement('img');
        closeImg.alt = 'close';
        closeImg.src = 'https://www.alaskaair.com/img/seatmaps/close_drawer.png';
        this.closeAnchor.appendChild(closeImg);
        return rootDiv;
    };
    SideDrawer.prototype.SetWidth = function (width) {
        this.width = width;
    };
    return SideDrawer;
}());

//# sourceMappingURL=sidedrawer.js.map
