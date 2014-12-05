var log = require('warnerburg-logging-config')();
var mongoose = require("mongoose");
var Q = require('q');

var addComment = function(contentSequenceNumber, comment) {
    var deferred = Q.defer();
    mongoose.model('content').find({sequenceNumber:contentSequenceNumber}).exec()
        .then(function(contents) {
            var Comment = mongoose.model('comment');
            var newComment = new Comment({
                contentId: contents[0]._id,
                text: comment.text,
                author: comment.author,
                commentDate: new Date()
            });

            // save and return saved model if successful
            newComment.save(function(err, newComment) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(newComment);
                }
            });
        }).onReject(function(err) {
            log.error("error saving comment: "+err);
            deferred.reject(err);
        });

    return deferred.promise;
};

module.exports = {
    addComment: addComment
};