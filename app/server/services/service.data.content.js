var mongoose = require("mongoose");
var Q = require('q');

module.exports = {
    processGetContentDataBySequenceNumber: function(sequenceNumber, category) {
        console.log("getting content at "+sequenceNumber);

        var deferred = Q.defer();

        var content;
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
                content = contents[0];

                console.log("finding comments for " + content._id);
                return mongoose.model('comment').find({contentId: contents[0]._id}).sort({commentDate:'asc'}).exec();
            }).then(function(comments) {
                console.log("cm l "+comments.length);

                // attach comment data
                content.comments = comments;

                // return content by resolving promise with it
                console.log("returning content from service");
                deferred.resolve(content);

            }).onReject(function (err) {
                console.log("error getting content: " + err);
                deferred.reject(err);
            });

        return deferred.promise;
    },
    processGetContentSequenceNumbersBySection: function(category) {
        console.log("processGetContentDataBySection getting content at "+category);

        var deferred = Q.defer();

        var content;
        var query = mongoose.model('content').find({category: category}).sort({ sequenceNumber: 1 });

        query.lean().exec()
            .then(function (contents) {

                var contentItemsBySection = {};
                contents.forEach(function(item) {
                    if (typeof contentItemsBySection[item.section] === 'undefined') {
                        contentItemsBySection[item.section] = {
                            section: item.section,
                            sequenceNumbers: []
                        };
                    }

                    contentItemsBySection[item.section].sequenceNumbers.push(item.sequenceNumber);
                });



                // return content by resolving promise with it
                deferred.resolve(contentItemsBySection);

            }).onReject(function (err) {
                console.log("error getting content: " + err);
                deferred.reject(err);
            });

        return deferred.promise;
    }
};