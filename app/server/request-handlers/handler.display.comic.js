var mongoose = require("mongoose");
var common = require("warnerburg-common");
var Q = require('q');
var comicService = require("../services/service.data.comic.js");

function processGetComicPage(req, res) {
    console.log("running processGetComicPage for "+req.params.sequenceNumber);
    comicService.processGetComicData(req.params.sequenceNumber,
        function(comic) {
            console.log("returned from service with comic "+comic);
            var pageData = {
                common: common,
                area: 'comic',
                comic: comic
            };

            res.render('comic', pageData);
            console.log("xendered from processGetComicPage for "+req.params.sequenceNumber);
        });
}

function processGetComicArchives(req, res) {
    var pageData = {
        common: common,
        area: 'comic'
    };

    res.render('comic', pageData);
}

module.exports = function (app) {
    app.get('/comic/archives', processGetComicArchives);
    app.get('/comic/:sequenceNumber', processGetComicPage);
    app.get('/comic', processGetComicPage);
};