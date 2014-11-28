var log = require('warnerburg-logging-config')();
var mongoose = require("mongoose");
var common = require("warnerburg-common");

// request handlers
function processGetRoot(req, res) {
    var pageData = {
        environment: process.env.NODE_ENV,
        area: 'store',
        common: common
    };

    res.render(
        'store.html', pageData
    );
}

module.exports = function(app) {
    app.get('/store', processGetRoot);
};



