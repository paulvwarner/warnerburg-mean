var mongoose = require("mongoose");
var common = require("../common.js");

function processGetCommentData(req, res) {
    var pageData = {
        common: common
    };

    // get comic for the entered sequenceNumber, then return the comments for that comic
    mongoose.model('content').find({sequenceNumber:req.params.sequenceNumber}).exec()
        .then(function(contents) {
            return mongoose.model('comment').find({contentId: contents[0]._id}).sort({commentDate:'asc'}).exec();
        }).then(function(comments) {
            console.log(typeof comments[0].commentDate);
            res.send(comments);
        }).onReject(function(err) {
            console.log("error getting comic comments: "+err);
        });
}

function processPostCommentData(req, res) {
    console.log('posted:',req.body);

    mongoose.model('content').find({sequenceNumber:req.body.comicSequenceNumber}).exec()
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
            console.log("error saving comic comment: "+err);
        });
}

module.exports = function(app) {
    app.get('/data/comics/:sequenceNumber/comments', processGetCommentData);
    app.post('/data/comics/:sequenceNumber/comments', processPostCommentData);
};
