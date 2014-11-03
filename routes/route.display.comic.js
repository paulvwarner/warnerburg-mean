var mongoose = require("mongoose");
var common = require("../common.js");

function processGetComicPage(req, res) {
    var pageData = {
        common: common,
        area: 'comic'
    };

    var sequenceNumber = req.params.sequenceNumber;
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
            pageData.comic = contents[0];

            console.log("finding comment count for " + pageData.comic._id);
            return mongoose.model('comment').count({contentId: pageData.comic._id}).exec();
        }).then(function (commentCount) {
            // attach comment count
            pageData.comic.commentCount = commentCount;

            // render page
            res.render('comic', pageData);
        }).onReject(function (err) {
            console.log("error getting comic page data: " + err);
        });
}

function processGetComicArchives(req, res) {
    var pageData = {
        common: common,
        area: 'comic'
    };

    res.render('comic', pageData);
}

module.exports = function (app) {
    app.get('/comic/archives', processGetComicArchives);
    app.get('/comic/:sequenceNumber', processGetComicPage);
    app.get('/comic', processGetComicPage);
};