var log = require('warnerburg-logging-config')();
var mongoose = require("mongoose");
var common = require("warnerburg-common");

// request handlers
function processGetDemo(req, res) {
    var pageData = {
        environment: process.env.NODE_ENV,
        area: 'demo',
        common: common
    };

    res.render(
        'demo.html', pageData
    );
}

module.exports = function(app) {
    app.get('/demo', processGetDemo);
};



