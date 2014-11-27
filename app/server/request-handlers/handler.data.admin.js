var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentDataService = require("../services/service.data.content.js");
var Q = require('q');
var path = require("path");
var fs = require('fs');
var busboy = require('connect-busboy');

function processPostUploadAuthorPic(req, res) {
    console.log("up START");

    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        var uploadPath = path.dirname(require.main.filename) + common.authorPicServerFolder + filename;
        console.log("Uploading: " + uploadPath);

        var fileWriteStream = fs.createWriteStream(uploadPath);
        file.pipe(fileWriteStream);
        fileWriteStream.on('close', function () {
            console.log("upload END")
            res.send(common.authorPicClientFolder + filename);
        }).on('error', function (err) {
            console.log("upload failed: ",err);
            res.send("ERROR");
        });
    });
}

function processGetContentDataBySequenceNumber(req, res) {
    console.log("running admin processGetContentDataBySequenceNumber for "+req.params.sequenceNumber + " "+req.params.category);
    contentDataService.getContentDataBySequenceNumber(req.params.sequenceNumber, req.params.category)
        .then(function(content) {
            console.log("returned from service with "+req.params.category+" "+content);

            // get possible author pics (urls)
            var authorPicFolderFiles = fs.readdirSync(path.dirname(require.main.filename) + common.authorPicServerFolder);
            var authorPics = [];
            authorPicFolderFiles.forEach(function(pic) {
                console.log("looking for '"+path.extname(pic)+"'");
                if (common.allowedImageExtensions.indexOf(path.extname(pic)) >= 0) {
                    authorPics.push(common.authorPicClientFolder + pic);
                }
            });
            console.log("authpics: ",authorPics);

            var returnData = {
                content: content,
                authorPics: authorPics
            }

            res.send(returnData);
            console.log("returned "+req.params.category+" data for "+req.params.sequenceNumber);
        })
        .catch(function(err) {
            console.log("error getting "+req.params.category+": ", err);
            res.send(err);
        });
}

function processPutContentDataBySequenceNumber(req, res) {

    contentDataService.updateContentData(req.body.content)
        .then(function(content) {
            res.send(content);
        })
        .catch(function(err) {
            console.log("error updating:", err);
            res.send(err);
        });
}

module.exports = function (app) {
    app.use(busboy());
    app.get('/data/admin/content/:category/:sequenceNumber', processGetContentDataBySequenceNumber);
    app.post('/data/upload/authorPic', processPostUploadAuthorPic);
    app.put('/data/admin/content/:category/:sequenceNumber', processPutContentDataBySequenceNumber);
};