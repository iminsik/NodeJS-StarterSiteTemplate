function SojernPixel() {
    this.insertSojernPixel = function () {
        if ($('#sojernPixelUrl').length) {
            $('body').append($("<img width='1' height='1' border='0' alt='sojern pixel url'></img>").attr({ src: $('#sojernPixelUrl').attr("href") }));
        }
    }
}

as.sojernPixel = new SojernPixel();
