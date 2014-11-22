var mongoose = require("mongoose");
var common = require("warnerburg-common");

function processGetAdminPage(req, res) {
    var pageData = {
        common: common,
        area: 'admin'
    };

    res.render('admin', pageData);
}

module.exports = function (app) {
    app.get('/admin', processGetAdminPage);
    app.get('/admin/*', processGetAdminPage);
};