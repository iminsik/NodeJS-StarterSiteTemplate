$(document).ready(function () {
    $('body').delegate('.side-drawer-init, .side-drawer-link', 'click', function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        if (url) {
            var title = $(this).data('title');
            var description = $(this).data('description') || title;
            var drawer = new SideDrawer(title, description);
            var selectorData = $(this).data('contentSelector');
            if ($(this).data('side-drawer-width')) {
                drawer.SetWidth($(this).data('side-drawer-width'));
            }
            drawer.Show();
            $.ajax({
                url: url,
                success: function (data) {
                    var drawerContent = document.createElement('div');
                    if (selectorData == undefined) {
                        drawerContent.innerHTML = data;
                    } else {
                        var drawerContentOject = $(data).find(selectorData);
                        drawerContent.innerHTML = drawerContentOject.html();
                    }
                    drawer.TransferContent(drawerContent);
                }
            });
        }
    });
});
