var mongoose = require("mongoose");

module.exports = {
    'processGetComicData': function(sequenceNumber, callback) {
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

                console.log("finding comment count for " + comic._id);
                return mongoose.model('comment').count({contentId: comic._id}).exec();
            }).then(function (commentCount) {
                // attach comment count
                comic.commentCount = commentCount;

                console.log("returning comic from service");
                // return comic
                return callback(comic);
            }).onReject(function (err) {
                console.log("error getting comic page data: " + err);
            });
    }
};