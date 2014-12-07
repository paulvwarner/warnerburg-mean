var log = require('warnerburg-logging-config')();
var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentDataService = require("../services/service.data.content.js");
var Q = require('q');
var path = require("path");
var fs = require('fs');
var busboy = require('connect-busboy');

function processPostImageUploadRequest(req, res) {
    var serverFolder = common[req.params.uploadCategory].serverFolder;
    var clientFolder = common[req.params.uploadCategory].clientFolder;
    log.debug("upload start - s:"+serverFolder + " c:"+clientFolder);

    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        var uploadPath = path.dirname(require.main.filename) + serverFolder + filename;
        log.debug("Uploading: " + uploadPath);

        var fileWriteStream = fs.createWriteStream(uploadPath);
        file.pipe(fileWriteStream);
        fileWriteStream.on('close', function () {
            log.debug("upload end");
            res.send(clientFolder + filename);
        }).on('error', function (err) {
            log.error("upload failed: ",err);
            res.send("ERROR");
        });
    });
}

function processGetContentDataBySequenceNumber(req, res) {
    log.debug("running admin processGetContentDataBySequenceNumber for "+req.params.sequenceNumber + " "+req.params.category);
    var returnData = {};
    contentDataService.getContentDataBySequenceNumber(req.params.sequenceNumber, req.params.category)
        .then(function(content) {
            log.debug("returned from service with "+req.params.category+" "+content);

            returnData.content = content;

            // get possible sections for this content category
            return contentDataService.getContentSections(req.params.category);
        })
        .then(function(sections) {
            returnData.sections = sections;

            // get possible author pics (urls)
            var authorPicFolderFiles = fs.readdirSync(path.dirname(require.main.filename) + common['author-pic'].serverFolder);
            var authorPics = [];
            authorPicFolderFiles.forEach(function(pic) {
                log.debug("looking for '"+path.extname(pic)+"'");
                if (common.allowedImageExtensions.indexOf(path.extname(pic)) >= 0) {
                    authorPics.push(common['author-pic'].clientFolder + pic);
                }
            });

            // get possible content images (urls)
            var imageFolderFiles = fs.readdirSync(path.dirname(require.main.filename) + common[req.params.category].serverFolder);
            var images = [];
            imageFolderFiles.forEach(function(pic) {
                if (common.allowedImageExtensions.indexOf(path.extname(pic)) >= 0) {
                    images.push(common[req.params.category].clientFolder + pic);
                }
            });

            returnData.authorPics = authorPics;
            returnData.images = images;

            res.send(returnData);
            log.debug("returned "+req.params.category+" data for "+req.params.sequenceNumber);
        })
        .catch(function(err) {
            log.error("error getting "+req.params.category+": ", err);
            res.send(err);
        });
}

function processPutContentDataBySequenceNumber(req, res) {

    contentDataService.updateContentData(req.body.content)
        .then(function(content) {
            res.send(content);
        })
        .catch(function(err) {
            log.error("error updating:", err);
            res.send(err);
        });
}

function processGetSectionData(req, res) {
    contentDataService.getSectionData(req.params.category, req.params.sectionName)
        .then(function(sectionData) {

            // get possible author pics (urls)
            var thumbnailFolderFiles = fs.readdirSync(path.dirname(require.main.filename) + common['archives-thumbnail'].serverFolder);
            var thumbnails = [];
            thumbnailFolderFiles.forEach(function(pic) {
                log.debug("looking for '"+path.extname(pic)+"'");
                if (common.allowedImageExtensions.indexOf(path.extname(pic)) >= 0) {
                    thumbnails.push(common['archives-thumbnail'].clientFolder + pic);
                }
            });

            // get possible content images (urls)
            var descriptionImageFolderFiles = fs.readdirSync(path.dirname(require.main.filename) + common['archives-description-image'].serverFolder);
            var descriptionImages = [];
            descriptionImageFolderFiles.forEach(function(pic) {
                if (common.allowedImageExtensions.indexOf(path.extname(pic)) >= 0) {
                    descriptionImages.push(common['archives-description-image'].clientFolder + pic);
                }
            });

            sectionData.thumbnails = thumbnails;
            sectionData.descriptionImages = descriptionImages;

            res.send(sectionData);
        })
        .catch(function(err) {
            log.error("error getting section data:", err);
            res.send(err);
        });
}

module.exports = function (app) {
    app.use(busboy());
    app.get('/data/admin/content/:category/:sequenceNumber', processGetContentDataBySequenceNumber);
    app.get('/data/admin/section/:category/:sectionName', processGetSectionData);
    app.post('/data/upload/:uploadCategory', processPostImageUploadRequest);
    app.put('/data/admin/content/:category/:sequenceNumber', processPutContentDataBySequenceNumber);
};