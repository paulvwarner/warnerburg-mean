var mongoose = require("mongoose");
var Q = require('q');

module.exports = {
    processGetContentData: function(sequenceNumber, category) {
        console.log("getting comic at "+sequenceNumber);

        var deferred = Q.defer();

        var comic;
        var query;

        if (sequenceNumber) {
            query = mongoose.model('content').find({sequenceNumber: sequenceNumber, category: category});
        } else {
            console.log("getting latest");
            query = mongoose.model('content').find({category: category}).sort({ sequenceNumber: -1 }).limit(1);
        }

        // get content using "lean" in order to attach comments to it afterwards (not allowed for
        // the true mongoose document object, since "comments" aren't part of the "content" schema)
        query.lean().exec()
            .then(function (contents) {
                console.log(contents);
                comic = contents[0];

                console.log("finding comments for " + comic._id);
                return mongoose.model('comment').find({contentId: contents[0]._id}).sort({commentDate:'asc'}).exec();
            }).then(function(comments) {
                console.log("cm l "+comments.length);

                // attach comment data
                comic.comments = comments;

                // return comic by resolving promise with it
                console.log("returning comic from service");
                deferred.resolve(comic);

            }).onReject(function (err) {
                console.log("error getting comic page data: " + err);
                deferred.reject(err);
            });

        return deferred.promise;
    }
};