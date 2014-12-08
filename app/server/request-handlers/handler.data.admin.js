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
    contentDataService.updateContentData(req.params.category, req.params.sequenceNumber, req.body.content)
        .then(function(content) {
            res.send(content);
        })
        .catch(function(err) {
            log.error("error updating:", err);
            res.send(err);
        });
}


function processPutSectionData(req, res) {
    contentDataService.updateSectionData(req.params.category, req.params.sequenceNumber, req.body.section)
        .then(function(section) {
            log.debug("saved - ppsd");
            res.send(section);
        })
        .catch(function(err) {
            log.error("error updating:", err);
            res.send(err);
        });
}

// get possible section thumbnails (urls)
function getSectionThumbnailFileList() {
    var thumbnailFolderFiles = fs.readdirSync(path.dirname(require.main.filename) + common['archives-thumbnail'].serverFolder);
    var thumbnails = [];
    thumbnailFolderFiles.forEach(function(pic) {
        log.debug("looking for '"+path.extname(pic)+"'");
        if (common.allowedImageExtensions.indexOf(path.extname(pic)) >= 0) {
            thumbnails.push(common['archives-thumbnail'].clientFolder + pic);
        }
    });

    return thumbnails;
}

// get possible section description images (urls)
function getSectionDescriptionImageFileList() {
    var descriptionImageFolderFiles = fs.readdirSync(path.dirname(require.main.filename) + common['archives-description-image'].serverFolder);
    var descriptionImages = [];
    descriptionImageFolderFiles.forEach(function(pic) {
        if (common.allowedImageExtensions.indexOf(path.extname(pic)) >= 0) {
            descriptionImages.push(common['archives-description-image'].clientFolder + pic);
        }
    });

    return descriptionImages;
}

function processGetSectionData(req, res) {
    contentDataService.getSectionData(req.params.category, req.params.sequenceNumber)
        .then(function(sectionData) {
            sectionData.thumbnails = getSectionThumbnailFileList();
            sectionData.descriptionImages = getSectionDescriptionImageFileList();

            res.send(sectionData);
        })
        .catch(function(err) {
            log.error("error getting section data:", err);
            res.send(err);
        });
}

function processGetContentInCategory(req, res) {
    var category = req.params.category;

    contentDataService.getContentDataBySection(category)
        .then(function(contentItemsBySection) {
            log.debug("returned from service with ",contentItemsBySection);
            res.send(contentItemsBySection);
        })
        .catch(function(err) {
            log.error("error displaying comic: ", err);
        });
}

module.exports = function (app) {
    app.use(busboy());
    app.get('/data/admin/content/:category/all', processGetContentInCategory);
    app.get('/data/admin/content/:category/:sequenceNumber', processGetContentDataBySequenceNumber);
    app.get('/data/admin/section/:category/:sequenceNumber', processGetSectionData);
    app.post('/data/upload/:uploadCategory', processPostImageUploadRequest);
    app.put('/data/admin/content/:category/:sequenceNumber', processPutContentDataBySequenceNumber);
    app.put('/data/admin/section/:category/:sequenceNumber', processPutSectionData);
};