var log = require('warnerburg-logging-config')();
var common = require("warnerburg-common");

function processGetCommonData(req, res) {
    res.send(common);
}

module.exports = function (app) {
    app.get('/data/common', processGetCommonData);
};