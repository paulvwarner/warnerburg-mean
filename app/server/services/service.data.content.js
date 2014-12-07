var log = require('warnerburg-logging-config')();
var mongoose = require("mongoose");
var Q = require('q');

var getContentDataBySequenceNumber = function(sequenceNumber, category) {
    log.debug("getting content at "+category+"/"+sequenceNumber);

    var deferred = Q.defer();

    var content;
    var query;

    if (sequenceNumber) {
        query = mongoose.model('content').find({sequenceNumber: sequenceNumber, category: category});
    } else {
        log.debug("getting latest");
        query = mongoose.model('content').find({category: category, publishDate: {$lt: new Date()}}).sort({ sequenceNumber: -1 }).limit(1);
    }

    // get content using "lean" in order to attach comments to it afterwards (not allowed for
    // the true mongoose document object, since "comments" aren't part of the "content" schema)
    query.lean().exec()
        .then(function (contents) {
            log.debug(contents);
            content = contents[0];

            return mongoose.model('content').find({category: category, publishDate: {$lt: new Date()}}).count().exec();
        }).then(function(contentCount) {
            log.debug("count: "+contentCount);

            content.isLast = false;
            content.isFirst = false;

            if (content.sequenceNumber == contentCount) {
                log.debug("is last = true");
                content.isLast = true;
            } else if (content.sequenceNumber == '1') {
                log.debug("is first = true");
                content.isFirst = true;
            }

            log.debug("finding comments for " + content._id);
            return mongoose.model('comment').find({contentId: content._id}).sort({commentDate:'asc'}).exec();
        }).then(function(comments) {
            log.debug("cm l "+comments.length);

            // attach comment data
            content.comments = comments;

            // return content by resolving promise with it
            log.debug("returning content from service");
            deferred.resolve(content);

        }).onReject(function (err) {
            log.error("error getting content: " + err);
            deferred.reject(err);
        });

    return deferred.promise;
};

var getSectionData = function(category, sequenceNumber) {
    log.debug("getSectionData getting section at "+category+", "+sequenceNumber);

    var deferred = Q.defer();

    var query = mongoose.model('section').find({category: category, sequenceNumber: sequenceNumber});

    query.lean().exec()
        .then(function (section) {
            log.debug("found section:",section);

            // return content by resolving promise with it
            deferred.resolve(section[0]);

        }).onReject(function (err) {
            log.error("error getting section: " + err);
            deferred.reject(err);
        });

    return deferred.promise;
};

var getSectionDataAndContent = function(category) {
    log.debug("getSectionDataAndContent getting content at "+category);

    var deferred = Q.defer();

    var content;
    var query = mongoose.model('content').find({category: category, publishDate: {$lt: new Date()}}).sort({ sequenceNumber: 1 });
    var sectionInfo = {};
    var sectionDataRetrievalTasks = [];

    query.lean().exec()
        .then(function (contents) {

            contents.forEach(function(item) {
                if (typeof sectionInfo[item.section] === 'undefined') {
                    sectionInfo[item.section] = {
                        sequenceNumbers: []
                    };
                    sectionDataRetrievalTasks.push(mongoose.model('section').find({sectionName: ''+item.section}).exec());
                }

                sectionInfo[item.section].sequenceNumbers.push(item.sequenceNumber);
            });

            return Q.allSettled(sectionDataRetrievalTasks);

        }).then(function (sections) {
            sections.forEach(function (section) {
                log.debug("result? ",section);
                sectionInfo[section.value[0].sectionName].section = section.value[0];
            });

            // return content by resolving promise with it
            deferred.resolve(sectionInfo);
        }).onReject(function (err) {
            log.error("error getting content: " + err);
            deferred.reject(err);
        });

    return deferred.promise;
};

var getContentDataBySection = function(category) {
    log.debug("getContentDataBySection getting content at "+category);

    var deferred = Q.defer();

    var content;
    var contentQuery = mongoose.model('content').find({category: category}).sort({ sequenceNumber: 1 });
    var sectionQuery = mongoose.model('section').find({category: category});

    var contentItemsBySection = {};
    var sectionDataRetrievalTasks = [];


    sectionQuery.exec()
        .then(function(sections) {
            sections.forEach(function (section) {
                log.debug("result? ", section);
                if (typeof contentItemsBySection[section.sectionName] === 'undefined') {
                    contentItemsBySection[section.sectionName] = {
                        contents: [],
                        section: section
                    };
                }
            });

            return contentQuery.lean().exec();
        })
        .then(function (contents) {

            contents.forEach(function (item) {
                if ('' + item.section == 'undefined') {
                    item.section = 'default';
                }
                if (typeof contentItemsBySection[item.section] === 'undefined') {
                    contentItemsBySection[item.section] = {
                        contents: [],
                        section: {sectionName: item.section}
                    };
                }

                contentItemsBySection[item.section].contents.push(item);
            });

            deferred.resolve(contentItemsBySection);
        })
        .onReject(function (err) {
            log.error("error getting content: " + err);
            deferred.reject(err);
        });

    return deferred.promise;
};

var updateSectionData = function(category, sequenceNumber, updatedSection) {
    log.debug("updating section at "+category+"/"+sequenceNumber);

    var deferred = Q.defer();
    var query = mongoose.model('section').findOne({sequenceNumber: sequenceNumber, category: category});
    var previousSectionName = '';

    query.exec()
        .then(function (section) {
            log.debug("pre-update:", section);

            previousSectionName = section.sectionName;

            section.sectionName = updatedSection.sectionName;
            section.thumbnailImageUrl = updatedSection.thumbnailImageUrl;
            section.descriptionImageUrl = updatedSection.descriptionImageUrl;

            var deferredSectionUpdate = Q.defer();

            section.save(function (err, savedSection, numberAffected) {
                if (err) {
                    log.error("error updating section: ", err);
                    deferredSectionUpdate.reject(err);
                } else {
                    log.debug("post-update:", savedSection);
                    deferredSectionUpdate.resolve(savedSection);
                }
            });

            return deferredSectionUpdate.promise;
        }).then(function (savedSection) {
            log.debug("saved ",savedSection);
            var deferredContentUpdate = Q.defer();

            // if section name changed, update all content items in the updated section to use the updated section name
            if (previousSectionName != updatedSection.sectionName) {
                log.debug("changing from section prev "+previousSectionName);
                mongoose.model('content').update({ category: category, section: previousSectionName },
                    { $set: { section: updatedSection.sectionName }}, { multi: true },
                    function (err, numberAffected) {
                        if (err) {
                            deferredContentUpdate.reject(err);
                        } else {
                            log.debug("updated "+numberAffected+" content items");
                            deferredContentUpdate.resolve(savedSection);
                        }
                    });
            } else {
                deferredContentUpdate.resolve(savedSection);
            }

            return deferredContentUpdate.promise;
        }).then(function (savedSection) {
            deferred.resolve(savedSection);
        }).onReject(function (err) {
            log.error("error getting section for update: " + err);
            deferred.reject(err);
        });

    return deferred.promise;
};

var updateContentData = function(category, sequenceNumber, updatedContent) {
    log.debug("updating content at "+category+"/"+sequenceNumber);

    var deferred = Q.defer();
    var query = mongoose.model('content').findOne({sequenceNumber: sequenceNumber, category: category});

    query.exec()
        .then(function (content) {
            log.debug("pre-update:", content);

            content.authorPicture = updatedContent.authorPicture;
            content.publishDate = updatedContent.publishDate;
            content.publishDateElements = getPublishDateElements(updatedContent.publishDate);
            content.lastModifiedDate = new Date();
            content.text = updatedContent.text;
            content.image = updatedContent.image;
            content.title = updatedContent.title;
            content.section = updatedContent.section;

            content.save(function(err, savedContent, numberAffected) {
                if (err) {
                    log.error("error updating content: ",err);
                    deferred.reject(err);
                } else {
                    log.debug("post-update:", savedContent);
                    deferred.resolve(savedContent);
                }
            });
        }).onReject(function (err) {
            log.error("error getting content: " + err);
            deferred.reject(err);
        });

    return deferred.promise;
};

// return date string formatted as MM/DD/YY
var getComicDisplayDateStringFromPublishDate = function(publishDate) {
    var dayOfMonth = ''+publishDate.getDate();
    if (dayOfMonth.length == 1) {
        dayOfMonth = "0"+dayOfMonth;
    }
    var monthOfYear = ''+(publishDate.getMonth() + 1);
    if (monthOfYear.length == 1) {
        monthOfYear = "0"+monthOfYear;
    }
    var year = (''+publishDate.getFullYear()).substring(2,4);

    return monthOfYear + "/"+dayOfMonth+ "/"+year;
};

var getPublishDateElements = function(publishDate) {
    var publishDateString = getComicDisplayDateStringFromPublishDate(new Date(publishDate));
    var dateElements = new Array();
    for ( var j = 0; j < publishDateString.length; j++ ) {
        var dateCharacter = publishDateString.charAt(j);
        if (dateCharacter == '/') {
            dateElements.push('slash');
        } else {
            dateElements.push(''+publishDateString.charAt(j));
        }
    }
    return dateElements;
};

var getSequenceNumberElements = function(sequenceNumber) {
    var sequenceNumber = parseInt(sequenceNumber);
    var sequenceNumberString = ''+sequenceNumber;
    var sequenceNumberElements = new Array();
    for ( var m = 0; m < sequenceNumberString.length; m++ ) {
        sequenceNumberElements.push((sequenceNumberString).charAt(m));
    }
    return sequenceNumberElements;
};

var reorderContentItems = function(sections) {
    var updateTasks = [];

    for (var section in sections) {
        log.debug("reorder ",section);

        sections[section].contents.forEach(function (content) {
            log.debug("id:" + content._id + " oldseq:" + content.originalSequenceNumber + " newseq:"+content.sequenceNumber
                + " oldsec:" + content.originalSection+ " newsec:" + content.section);
            var query = {"_id":content._id};
            var update = {
                sequenceNumber: content.sequenceNumber,
                section: content.section,
                sequenceNumberElements: getSequenceNumberElements(content.sequenceNumber)
            };
            updateTasks.push(mongoose.model('content').update(query,update).exec()
                .then(function() {
                    log.debug("updated content seq num "+content._id);
                }).onReject(function(err) {
                    log.error("error updating content sequence number for content "+content._id+": "+err);
                }));
        });
    }

    // don't return until all mongoose updates are done
    return Q.allSettled(updateTasks);
};

var getContentCategories = function() {
    var deferred = Q.defer();

    mongoose.model('content').collection.distinct('category', function(err, categories) {
        if (err) {
            log.error("error getting categories: "+err);
            deferred.reject(err);
        } else {
            log.debug("returning categories ", categories);
            deferred.resolve(categories);
        }
    });

    return deferred.promise;
};

var getContentSections = function(category) {
    var deferred = Q.defer();

    mongoose.model('content').find({category: category}).distinct('section', function(err, sections) {
        if (err) {
            log.error("error getting sections: "+err);
            deferred.reject(err);
        } else {
            log.debug("returning sections ", sections);
            deferred.resolve(sections.sort());
        }
    });

    return deferred.promise;
};

module.exports = {
    getContentDataBySequenceNumber: getContentDataBySequenceNumber,
    getSectionDataAndContent: getSectionDataAndContent,
    getContentDataBySection: getContentDataBySection,
    updateContentData: updateContentData,
    reorderContentItems: reorderContentItems,
    getContentCategories: getContentCategories,
    getContentSections: getContentSections,
    getSectionData: getSectionData,
    updateSectionData: updateSectionData
};