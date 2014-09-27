var mongoose = require("mongoose");
var common = require("../common.js");

function processGetComicPage(req, res) {
    var pageData = {
        common: common
    };

    // get content using "lean" in order to attach comments to it afterwards (not allowed for
    // the true mongoose document object, since "comments" aren't part of the "content" schema)
    mongoose.model('content').find({sequenceNumber:req.params.sequenceNumber}).lean().exec()
        .then(function(contents) {
            console.log(contents);
            pageData.comic = contents[0];

            console.log("finding comments for "+pageData.comic._id);
            return mongoose.model('comment').find({contentId: pageData.comic._id}).exec();
        }).then(function(comments) {
            //console.log('got comments: '+comments);

            pageData.comic.comments = comments;

            //console.log(pageData);

            res.render('comicPage', pageData);
        }).onReject(function(err) {
            console.log("error getting comic page data: "+err);
        });
}

module.exports = function(app) {
    app.get('/comic/:sequenceNumber', processGetComicPage);
};