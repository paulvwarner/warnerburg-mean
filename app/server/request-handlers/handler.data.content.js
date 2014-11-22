var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentDataService = require("../services/service.data.content.js");

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
    app.get('/data/content/:category/', processGetContentDataBySequenceNumber);
    app.get('/data/content/:category/:sequenceNumber', processGetContentDataBySequenceNumber);
    app.post('/data/content/:sequenceNumber/comments', processPostCommentData);
};