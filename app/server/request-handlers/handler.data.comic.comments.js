var mongoose = require("mongoose");

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
    app.post('/data/comics/:sequenceNumber/comments', processPostCommentData);
};
