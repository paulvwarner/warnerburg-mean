var mongoose = require("mongoose");
var common = require("warnerburg-common");

// request handlers
function processGetRoot(req, res) {
    var pageData = {
        common: common
    };

    res.render(
        'index.html', pageData
    );
}

module.exports = function(app) {
    app.get('/', processGetRoot);
};



