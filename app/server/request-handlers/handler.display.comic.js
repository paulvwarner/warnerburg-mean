var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentService = require("../services/service.data.content.js");

function processGetComicPage(req, res) {
    console.log("running processGetComicPage for "+req.params.sequenceNumber);
    contentService.processGetContentDataBySequenceNumber(req.params.sequenceNumber, 'comic')
        .then(function(content) {
            console.log("returned from service with comic "+content);
            var pageData = {
                area: 'comic',
                common: common,
                content: content
            };

            res.render('comic.html', pageData);
            console.log("rendered from processGetComicPage for "+req.params.sequenceNumber);
        })
        .catch(function(err) {
            console.log("error displaying comic: ", err);
        });
}

function processGetComicArchives(req, res) {
    contentService.processGetContentSequenceNumbersBySection('comic')
        .then(function(contentItemsBySection) {
            console.log("returned from service with comic "+contentItemsBySection);
            var pageData = {
                area: 'comic',
                common: common,
                contentItemsBySection: contentItemsBySection
            };

            res.render('comic.archives.html', pageData);
            console.log("rendered from processGetComicArchives");
        })
        .catch(function(err) {
            console.log("error displaying comic: ", err);
        });
}

module.exports = function (app) {
    app.get('/comic/archives', processGetComicArchives);
    app.get('/comic/:sequenceNumber', processGetComicPage);
    app.get('/comic', processGetComicPage);
};