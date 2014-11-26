var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentDataService = require("../services/service.data.content.js");

function processGetComicPage(req, res) {
    console.log("running processGetComicPage for "+req.params.sequenceNumber);
    contentDataService.getContentDataBySequenceNumber(req.params.sequenceNumber, 'comic')
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
    contentDataService.getContentSequenceNumbersBySection('comic')
        .then(function(contentSequenceNumbersBySection) {
            console.log("returned from service with ", contentSequenceNumbersBySection);
            var pageData = {
                area: 'comic',
                common: common,
                contentSequenceNumbersBySection: contentSequenceNumbersBySection
            };

            res.render('comic.archives.html', pageData);
            console.log("rendered from processGetComicArchives");
        })
        .catch(function(err) {
            console.log("error getting archives content: ", err);
        });
}

module.exports = function (app) {
    app.get('/comic/archives', processGetComicArchives);
    app.get('/comic/:sequenceNumber', processGetComicPage);
    app.get('/comic', processGetComicPage);
};