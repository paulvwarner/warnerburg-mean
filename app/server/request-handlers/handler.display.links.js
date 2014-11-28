var log = require('warnerburg-logging-config')();
var mongoose = require("mongoose");
var common = require("warnerburg-common");

// request handlers
function processGetRoot(req, res) {
    var pageData = {
        environment: process.env.NODE_ENV,
        area: 'links',
        common: common
    };

    res.render(
        'links.html', pageData
    );
}

module.exports = function(app) {
    app.get('/links', processGetRoot);
};



