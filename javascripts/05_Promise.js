(
function (utils) {
    utils.SyncPromise = function(data) {
        var self = this;
        self.then = function(action) {
             if (action) {
                action(data);
            }
        };
        self.each = function() {
            return new utils.SyncAllPromise(data);
        };
    };

    utils.SyncAllPromise = function (data) {
        var self = this;
        self.then = function (action) {
            if (action) {
                for (var i in data) {
                    action(data[i]);
                }
            }
        };

        self.each = function () {
            var tempArray = new Array();
            for (var i in data) {
                for (var j in data[i]) {
                    tempArray.push(data[i][j]);
                }
            }
            return new utils.SyncAllPromise(tempArray);
        };
    };
})
(asFrameworkUtils);
