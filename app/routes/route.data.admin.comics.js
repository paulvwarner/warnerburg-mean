var mongoose = require("mongoose");
var Q = require('q');
var common = require("warnerburg-common");

function processGetAllComicData(req, res) {
    var pageData = {
        common: common
    };

    // get all comics
    mongoose.model('content').find().sort({sequenceNumber:1}).lean().exec()
        .then(function(contents) {
            res.send(contents);
        }).onReject(function(err) {
            console.log("error getting comics: "+err);
        });
}

function processPostComicReorder(req, res) {
    var updateTasks = [];
    req.body.comics.forEach(function (comic) {
        console.log("id:" + comic._id + " oldseq:" + comic.originalSequenceNumber + " newseq:"+comic.sequenceNumber);
        var query = {"_id":comic._id};
        updateTasks.push(mongoose.model('content').update(query,{sequenceNumber:comic.sequenceNumber}).exec()
            .then(function() {
                console.log("updated comic "+comic._id);
            }).onReject(function(err) {
                console.log("ERR");
                console.log("error updating comic sequence number for comic "+comic._id+": "+err);
            }));
    });

    // don't return until all mongoose updates are done
    Q.allSettled(updateTasks).then(function() {
        console.log("END")
        res.send("");
    });
}

module.exports = function(app) {
    app.get('/data/admin/comics', processGetAllComicData);
    app.post('/data/admin/comics/reorder', processPostComicReorder);
};