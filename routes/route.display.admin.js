var mongoose = require("mongoose");
var common = require("../common.js");

function processGetAdminPage(req, res) {
    var pageData = {
        common: common,
        area: 'admin'
    };

    res.render('admin', pageData);
}

module.exports = function (app) {
    app.get('/admin', processGetAdminPage);
};