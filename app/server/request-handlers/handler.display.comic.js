var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentService = require("../services/service.data.content.js");

function processGetComicPage(req, res) {
    console.log("running processGetComicPage for "+req.params.sequenceNumber);
    contentService.processGetContentData(req.params.sequenceNumber, 'comic')
        .then(function(comic) {
            console.log("returned from service with comic "+comic);
            var pageData = {
                common: common,
                comic: comic
            };

            res.render('comic.html', pageData);
            console.log("xendered from processGetComicPage for "+req.params.sequenceNumber);
        })
        .catch(function(err) {
            console.log("error displaying comic: ", err);
        });
}

function processGetComicArchives(req, res) {
    var pageData = {
        common: common
    };

    res.render('comic.archives.html', pageData);
}

module.exports = function (app) {
    app.get('/comic/archives', processGetComicArchives);
    app.get('/comic/:sequenceNumber', processGetComicPage);
    app.get('/comic', processGetComicPage);
};