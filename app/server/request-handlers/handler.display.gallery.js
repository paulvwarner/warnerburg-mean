var log = require('warnerburg-logging-config')();
var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentService = require("../services/service.data.content.js");

// request handlers
function processDisplayGalleryPage(req, res) {
    var pageData = {
        area: 'gallery',
        common: common,
        colorImages: {},
        pencilImages: {}
    };

    var queryColor = mongoose.model('content').find({category: 'gallery-color'}).sort({sequenceNumber:'asc'});
    var queryPencil = mongoose.model('content').find({category: 'gallery-pencil'}).sort({sequenceNumber:'asc'});

    queryColor.lean().exec()
        .then(function (contents) {
            pageData.colorImages = contents;
            return queryPencil.lean().exec();
        }).then(function(contents) {
            pageData.pencilImages = contents;

            log.debug("rendering gallery page");
            res.render(
                'gallery.html', pageData
            );
        }).onReject(function (err) {
            log.error("error getting gallery images: " + err);
        });
}

function renderImagePageWithContent(category, req, res) {
    contentService.getContentDataBySequenceNumber(req.params.imageSequenceNumber, category)
        .then(function(content) {
            log.debug("rendering... with ",content);

            var pageData = {
                area: 'gallery',
                common: common,
                content: content
            };

            res.render('gallery.image.html', pageData);
            log.debug("processDisplayColorGalleryImage for "+req.params.imageSequenceNumber);
        })
        .catch(function(err) {
            log.error("error getting gallery image: " + err);
        });
}

function processDisplayColorGalleryImage(req, res) {
    renderImagePageWithContent('gallery-color', req, res);
}

function processDisplayPencilGalleryImage(req, res) {
    renderImagePageWithContent('gallery-pencil', req, res);
}

function processDisplayGalleryProgressionPage(req, res) {
    renderImagePageWithContent('gallery-progression', req, res);
}

function processDisplayGallerySketchPage(req, res) {
    var pageData = {
        area: 'gallery',
        common: common
    };

    res.render(
            'gallery.sketches.'+req.params.sketchPageNumber+'.html', pageData
    );
}

module.exports = function(app) {
    app.get('/gallery', processDisplayGalleryPage);
    app.get('/gallery/progression', processDisplayGalleryProgressionPage);
    app.get('/gallery/progression/:imageSequenceNumber', processDisplayGalleryProgressionPage);
    app.get('/gallery/color/:imageSequenceNumber', processDisplayColorGalleryImage);
    app.get('/gallery/pencil/:imageSequenceNumber', processDisplayPencilGalleryImage);
    app.get('/gallery/progression', processDisplayGalleryProgressionPage);
    app.get('/gallery/color', processDisplayColorGalleryImage);
    app.get('/gallery/pencil', processDisplayPencilGalleryImage);
    app.get('/gallery/sketches/:sketchPageNumber', processDisplayGallerySketchPage);
};