var mongoose = require("mongoose");
var common = require("../common.js");

function processGetCommentData(req, res) {
    var pageData = {
        common: common
    };

    // get comic for the entered sequenceNumber, then return the comments for that comic
    mongoose.model('content').find({sequenceNumber:req.params.sequenceNumber}).lean().exec()
        .then(function(contents) {
            return mongoose.model('comment').find({contentId: contents[0]._id}).exec();
        }).then(function(comments) {
            res.send(JSON.stringify(comments));
        }).onReject(function(err) {
            console.log("error getting comic comments: "+err);
        });
}

function processPostCommentData(req, res) {
    console.log('posted:',req.body);
}

module.exports = function(app) {
    app.get('/data/comics/:sequenceNumber/comments', processGetCommentData);
    app.post('/data/comics/:sequenceNumber/comments', processPostCommentData);
};
