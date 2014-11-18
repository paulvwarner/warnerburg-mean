var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentDataService = require("../services/service.data.content.js");

function processGetContentData(req, res) {
    console.log("running processGetContentData for "+req.params.sequenceNumber + " "+req.params.category);
    contentDataService.processGetContentData(req.params.sequenceNumber, req.params.category)
        .then(function(comic) {
            console.log("returned from service with "+req.params.category+" "+comic);

            res.send(comic);
            console.log("returned "+req.params.category+" data for "+req.params.sequenceNumber);
        })
        .catch(function(err) {
            console.log("error getting "+req.params.category+": ", err);
        });
}

module.exports = function (app) {
    app.get('/data/:category/:sequenceNumber', processGetContentData);
    app.get('/data/:category/', processGetContentData);
};