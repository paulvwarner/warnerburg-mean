var log = require('loglevel');
var mongoose = require("mongoose");
var common = require("warnerburg-common");

// request handlers
function processGetRoot(req, res) {
    var pageData = {
        area: 'info',
        common: common
    };

    res.render(
        'info.html', pageData
    );
}

module.exports = function(app) {
    app.get('/info', processGetRoot);
};