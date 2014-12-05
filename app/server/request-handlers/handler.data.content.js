var log = require('warnerburg-logging-config')();
var common = require("warnerburg-common");
var contentDataService = require("../services/service.data.content.js");
var commentsDataService = require("../services/service.data.comments.js");
var Q = require('q');

function processGetContentInCategory(req, res) {
    var category = req.params.category;

    contentDataService.getContentDataBySection(category)
        .then(function(contentItemsBySection) {
            log.debug("returned from service with ",contentItemsBySection);
            res.send(contentItemsBySection);
        })
        .catch(function(err) {
            log.error("error displaying comic: ", err);
        });
}

function processContentReorder(req, res) {
    contentDataService.reorderContentItems(req.body.sections).then(function() {
        log.debug("reorder complete");
        res.send("");
    });
}

function processGetContentDataBySequenceNumber(req, res) {
    log.debug("running processGetContentDataBySequenceNumber for "+req.params.sequenceNumber + " "+req.params.category);
    contentDataService.getContentDataBySequenceNumber(req.params.sequenceNumber, req.params.category)
        .then(function(content) {
            log.debug("returned from service with "+req.params.category+" "+content);

            res.send(content);
            log.debug("returned "+req.params.category+" data for "+req.params.sequenceNumber);
        })
        .catch(function(err) {
            log.error("error getting "+req.params.category+": ", err);
        });
}

function processPostCommentData(req, res) {
    log.debug('posted:',req.body);
    commentsDataService.addComment(req.body.sequenceNumber, req.body.comment)
        .then(function(newComment) {
            res.send(newComment);
        })
        .catch(function(err) {
            log.error("error saving comment: "+err);
        });
}

function processGetContentCategories(req, res) {
    contentDataService.getContentCategories()
        .then(function(categories) {
            res.send(categories);
        })
        .catch(function(err) {
            log.error("error getting categories: "+err);
        });
}

function processGetContentSections(req, res) {
    contentDataService.getContentSections(req.params.category)
        .then(function(sections) {
            res.send(sections);
        })
        .catch(function(err) {
            log.error("error getting sections: "+err);
        });
}

module.exports = function (app) {
    app.get('/data/content/categories', processGetContentCategories);
    app.get('/data/content/:category/sections', processGetContentSections);
    app.get('/data/content/:category/all', processGetContentInCategory);
    // defining /data/content/:category/ and /data/content/:category/:sequenceNumber to to the same thing
    // so that calls with no sequence number go to the last item of content in that category
    app.get('/data/content/:category/', processGetContentDataBySequenceNumber);
    app.get('/data/content/:category/:sequenceNumber', processGetContentDataBySequenceNumber);
    app.post('/data/content/:sequenceNumber/comments', processPostCommentData);
    app.post('/data/content/:category/reorder/', processContentReorder);
};