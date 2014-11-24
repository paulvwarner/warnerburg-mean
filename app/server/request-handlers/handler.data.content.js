var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentDataService = require("../services/service.data.content.js");
var Q = require('q');

function processGetContentInCategory(req, res) {
    var category = req.params.category;

    contentDataService.processGetContentDataBySection(category)
        .then(function(contentItemsBySection) {
            console.log("returned from service with ",contentItemsBySection);
            res.send(contentItemsBySection);
        })
        .catch(function(err) {
            console.log("error displaying comic: ", err);
        });
}

function processContentReorder(req, res) {
    var updateTasks = [];

    console.log("START");

    for (var section in req.body.sections) {
        console.log("reorder ",section);

        req.body.sections[section].forEach(function (content) {
            console.log("id:" + content._id + " oldseq:" + content.originalSequenceNumber + " newseq:"+content.sequenceNumber
                + " oldsec:" + content.originalSection+ " newsec:" + content.section);
            var query = {"_id":content._id};
            updateTasks.push(mongoose.model('content').update(query,{sequenceNumber:content.sequenceNumber, section:content.section}).exec()
                .then(function() {
                    console.log("updated content seq num "+content._id);
                }).onReject(function(err) {
                    console.log("error updating content sequence number for content "+content._id+": "+err);
                }));
        });
    }

    // don't return until all mongoose updates are done
    Q.allSettled(updateTasks).then(function() {
        console.log("END")
        res.send("");
    });
}

function processGetContentDataBySequenceNumber(req, res) {
    console.log("running processGetContentDataBySequenceNumber for "+req.params.sequenceNumber + " "+req.params.category);
    contentDataService.processGetContentDataBySequenceNumber(req.params.sequenceNumber, req.params.category)
        .then(function(content) {
            console.log("returned from service with "+req.params.category+" "+content);

            res.send(content);
            console.log("returned "+req.params.category+" data for "+req.params.sequenceNumber);
        })
        .catch(function(err) {
            console.log("error getting "+req.params.category+": ", err);
        });
}

function processPostCommentData(req, res) {
    console.log('posted:',req.body);

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
            console.log("error saving comment: "+err);
        });
}

function processGetContentCategories(req, res) {
    mongoose.model('content').collection.distinct('category', function(err, categories) {
        if (err) {
            console.log("error getting categories: "+err);
        } else {
            console.log("returning categories ", categories);
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