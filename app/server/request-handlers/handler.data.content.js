var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentDataService = require("../services/service.data.content.js");
var Q = require('q');

function processGetContentInCategory(req, res) {
    var pageData = {
        common: common
    };

    var category = req.params.category;

    // get all content items in given category
    mongoose.model('content').find({category:category}).sort({sequenceNumber:1}).lean().exec()
        .then(function(contents) {
            res.send(contents);
        }).onReject(function(err) {
            console.log("error getting content in category: "+category+":", err);
        });
}

function processContentReorder(req, res) {
    var updateTasks = [];
    req.body.contents.forEach(function (content) {
        console.log("id:" + content._id + " oldseq:" + content.originalSequenceNumber + " newseq:"+content.sequenceNumber);
        var query = {"_id":content._id};
        updateTasks.push(mongoose.model('content').update(query,{sequenceNumber:content.sequenceNumber}).exec()
            .then(function() {
                console.log("updated content "+content._id);
            }).onReject(function(err) {
                console.log("error updating content sequence number for content "+content._id+": "+err);
            }));
    });

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
    app.get('/data/content/:category/', processGetContentInCategory);
    app.get('/data/content/:category/:sequenceNumber', processGetContentDataBySequenceNumber);
    app.post('/data/content/:sequenceNumber/comments', processPostCommentData);
    app.post('/data/content/:category/reorder/', processContentReorder);
};