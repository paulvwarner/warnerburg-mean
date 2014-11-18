var mongoose = require("mongoose");
var common = require("warnerburg-common");
var contentService = require("../services/service.data.content.js");

// request handlers
function processDisplayGalleryPage(req, res) {
    var pageData = {
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

            console.log("rendering gallery page");
            res.render(
                'gallery.html', pageData
            );
        }).onReject(function (err) {
            console.log("error getting gallery images: " + err);
        });
}

function renderImagePageWithContent(content, res) {
    console.log("returned from service with content "+content);
    var pageData = {
        common: common,
        comic: content
    };

    res.render('gallery.image.html', pageData);
    console.log("processDisplayColorGalleryImage for "+req.params.sequenceNumber);
}

function processDisplayColorGalleryImage(req, res) {
    console.log("running processDisplayColorGalleryImage for "+req.params.sequenceNumber);
    contentService.processGetContentData(req.params.sequenceNumber, 'gallery-color')
        .then(function(content) {
            console.log("rendering... with ",content);
            renderImagePageWithContent(content, res);
        })
        .catch(function(err) {
            console.log("error getting gallery image: " + err);
        });
}

function processDisplayPencilGalleryImage(req, res) {

}

function processDisplayGallerySketchPage(req, res) {
    var pageData = {
        common: common
    }

    res.render(
        'gallery.sketches.'+req.params.sketchPageNumber+'.html', pageData
    );
}

function processDisplayGalleryProgressionPage(req, res) {
    var pageData = {
        common: common
    }

    res.render(
        'gallery.progression.html', pageData
    );
}

module.exports = function(app) {
    app.get('/gallery', processDisplayGalleryPage);
    app.get('/gallery/progression', processDisplayGalleryProgressionPage);
    app.get('/gallery/color/:imageSequenceNumber', processDisplayColorGalleryImage);
    app.get('/gallery/pencil/:imageSequenceNumber', processDisplayPencilGalleryImage);
    app.get('/gallery/sketches/:sketchPageNumber', processDisplayGallerySketchPage);
};