var mongoose = require("mongoose");
var Q = require('q');

module.exports = {
    getContentDataBySequenceNumber: function(sequenceNumber, category) {
        console.log("getting content at "+category+"/"+sequenceNumber);

        var deferred = Q.defer();

        var content;
        var query;

        if (sequenceNumber) {
            query = mongoose.model('content').find({sequenceNumber: sequenceNumber, category: category});
        } else {
            console.log("getting latest");
            query = mongoose.model('content').find({category: category, publishDate: {$lt: new Date()}}).sort({ sequenceNumber: -1 }).limit(1);
        }

        // get content using "lean" in order to attach comments to it afterwards (not allowed for
        // the true mongoose document object, since "comments" aren't part of the "content" schema)
        query.lean().exec()
            .then(function (contents) {
                console.log(contents);
                content = contents[0];

                return mongoose.model('content').find({category: category, publishDate: {$lt: new Date()}}).count().exec();
            }).then(function(contentCount) {
                console.log("COUNT "+contentCount);

                content.isLast = false;
                content.isFirst = false;

                if (content.sequenceNumber == contentCount) {
                    console.log("LAST");
                    content.isLast = true;
                } else if (content.sequenceNumber == '1') {
                    console.log("FIRST");
                    content.isFirst = true;
                }

                console.log("finding comments for " + content._id);
                return mongoose.model('comment').find({contentId: content._id}).sort({commentDate:'asc'}).exec();
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
    getContentSequenceNumbersBySection: function(category) {
        console.log("getContentSequenceNumbersBySection getting content at "+category);

        var deferred = Q.defer();

        var content;
        var query = mongoose.model('content').find({category: category}).sort({ sequenceNumber: 1 });

        query.lean().exec()
            .then(function (contents) {

                var contentSequenceNumbersBySection = {};
                contents.forEach(function(item) {
                    if (typeof contentSequenceNumbersBySection[item.section] === 'undefined') {
                        contentSequenceNumbersBySection[item.section] = [];
                    }

                    contentSequenceNumbersBySection[item.section].push(item.sequenceNumber);
                });

                // return content by resolving promise with it
                deferred.resolve(contentSequenceNumbersBySection);

            }).onReject(function (err) {
                console.log("error getting content: " + err);
                deferred.reject(err);
            });

        return deferred.promise;
    },
    getContentDataBySection: function(category) {
        console.log("getContentDataBySection getting content at "+category);

        var deferred = Q.defer();

        var content;
        var query = mongoose.model('content').find({category: category}).sort({ sequenceNumber: 1 });

        query.lean().exec()
            .then(function (contents) {

                var contentItemsBySection = {};
                contents.forEach(function(item) {
                    if (''+item.section == 'undefined') {
                        item.section = 'default';
                    }
                    if (typeof contentItemsBySection[item.section] === 'undefined') {
                        contentItemsBySection[item.section] = [];
                    }

                    contentItemsBySection[item.section].push(item);
                });

                // return content by resolving promise with it
                deferred.resolve(contentItemsBySection);

            }).onReject(function (err) {
                console.log("error getting content: " + err);
                deferred.reject(err);
            });

        return deferred.promise;
    },
    updateContentData: function(updatedContent) {
        console.log("updating content at "+updatedContent.category+"/"+updatedContent.sequenceNumber);

        var deferred = Q.defer();
        var query = mongoose.model('content').findOne({sequenceNumber: updatedContent.sequenceNumber, category: updatedContent.category});

        query.exec()
            .then(function (content) {
                console.log("pre-update:", content);

                content.authorPicture = updatedContent.authorPicture;

                content.save(function(err, savedContent, numberAffected) {
                    if (err) {
                        console.log("error updating content: ",err);
                        deferred.reject(err);
                    } else {
                        console.log("post-update:", savedContent);
                        deferred.resolve(savedContent);
                    }
                });
            }).onReject(function (err) {
                console.log("error getting content: " + err);
                deferred.reject(err);
            });

        return deferred.promise;
    }
};