if (document.referrer.indexOf('intentmedia.net') == -1
    && document.referrer.indexOf('www.kayak.com') == -1
    && document.referrer.indexOf('www.alaskaair.com') == -1
    && document.referrer.indexOf('alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/') == -1
    && top != self) { top.location = self.location; } //Prevents XSF
