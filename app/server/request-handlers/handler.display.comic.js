var log = require('warnerburg-logging-config')();
var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentDataService = require("../services/service.data.content.js");

function processGetComicPage(req, res) {
    log.debug("running processGetComicPage for "+req.params.sequenceNumber);
    contentDataService.getContentDataBySequenceNumber(req.params.sequenceNumber, 'comic')
        .then(function(content) {
            log.debug("returned from service with comic "+content);
            var pageData = {
                environment: process.env.NODE_ENV,
                area: 'comic',
                common: common,
                content: content
            };

            res.render('comic.html', pageData);
            log.debug("rendered from processGetComicPage for "+req.params.sequenceNumber);
        })
        .catch(function(err) {
            log.error("error displaying comic: ", err);
        });
}

function processGetComicArchives(req, res) {
    contentDataService.getSectionInformation('comic')
        .then(function(sectionInfo) {
            log.debug("returned from service with ", sectionInfo);
            var pageData = {
                environment: process.env.NODE_ENV,
                area: 'comic',
                common: common,
                sectionInfo: sectionInfo
            };

            res.render('comic.archives.html', pageData);
            log.debug("rendered from processGetComicArchives");
        })
        .catch(function(err) {
            log.error("error getting archives content: ", err);
        });
}

module.exports = function (app) {
    app.get('/comic/archives', processGetComicArchives);
    app.get('/comic/:sequenceNumber', processGetComicPage);
    app.get('/comic', processGetComicPage);
};