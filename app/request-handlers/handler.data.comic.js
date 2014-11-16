var mongoose = require("mongoose");
var common = require("warnerburg-common");
var Q = require('q');
var comicDataService = require("../services/service.data.comic.js");

function processGetComicPage(req, res) {
    console.log("running data processGetComicPage for "+req.params.sequenceNumber);
    comicDataService.processGetComicData(req.params.sequenceNumber,
        function(comic) {
            console.log("returned from service with comic "+comic);

            res.send(comic);
            console.log("returned comic data for "+req.params.sequenceNumber);
        });
}


module.exports = function (app) {
    app.get('/data/comic/:sequenceNumber', processGetComicPage);
    app.get('/data/comic/', processGetComicPage);
};