var log = require('loglevel');
var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentDataService = require("../services/service.data.content.js");
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
        log.debug("reorder complete")
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

    mongoose.model('content').find({sequenceNumber:req.body.sequenceNumber}).exec()
        .then(function(contents) {
            var Comment = mongoose.model('comment');
            var newComment = new Comment({
                contentId: contents[0]._id,
                text: req.body.comment.text,
                author: req.body.comment.author,
                commentDate: new Date()
            });

            // save and return saved model if successful
            newComment.save(function(err, newComment) {
                if (err) throw err;

                res.send(newComment);
            });
        }).onReject(function(err) {
            log.error("error saving comment: "+err);
        });
}

function processGetContentCategories(req, res) {
    mongoose.model('content').collection.distinct('category', function(err, categories) {
        if (err) {
            log.error("error getting categories: "+err);
        } else {
            log.debug("returning categories ", categories);
            res.send(categories);
        }
    });
}

module.exports = function (app) {
    app.get('/data/content/categories', processGetContentCategories);
    app.get('/data/content/:category/all', processGetContentInCategory);
    // defining /data/content/:category/ and /data/content/:category/:sequenceNumber to to the same thing
    // so that calls with no sequence number go to the last item of content in that category
    app.get('/data/content/:category/', processGetContentDataBySequenceNumber);
    app.get('/data/content/:category/:sequenceNumber', processGetContentDataBySequenceNumber);
    app.post('/data/content/:sequenceNumber/comments', processPostCommentData);
    app.post('/data/content/:category/reorder/', processContentReorder);
};