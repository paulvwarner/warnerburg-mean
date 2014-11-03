var mongoose = require("mongoose");
var common = require("../common.js");

function processGetAllComicData(req, res) {
    var pageData = {
        common: common
    };

    // get all comics
    mongoose.model('content').find().exec()
        .then(function(contents) {
            res.send(contents);
        }).onReject(function(err) {
            console.log("error getting comics: "+err);
        });
}

module.exports = function(app) {
    app.get('/data/admin/comics', processGetAllComicData);
};