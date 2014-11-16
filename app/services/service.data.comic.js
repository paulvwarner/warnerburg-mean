var mongoose = require("mongoose");

module.exports = {
    processGetComicData: function(sequenceNumber, callback) {
        console.log("getting comic at "+sequenceNumber);

        var comic;
        var query;

        if (sequenceNumber) {
            query = mongoose.model('content').find({sequenceNumber: sequenceNumber});
        } else {
            console.log("getting latest");
            query = mongoose.model('content').find().sort({ sequenceNumber: -1 }).limit(1);
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

                console.log("returning comic from service");
                // return comic
                return callback(comic);
            }).onReject(function (err) {
                console.log("error getting comic page data: " + err);
            });
    }
};