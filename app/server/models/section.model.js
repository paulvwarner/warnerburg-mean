var mongoose = require("mongoose");

// define schema - second arg is the collection to map to
var sectionSchema = mongoose.Schema({
        thumbnailImageUrl: String,
        descriptionImageUrl: String,
        category: String,
        sectionName: String,
        sequenceNumber: Number
    },
    {collection:'sections'});

// register schema as the "section" mongoose model
mongoose.model('section', sectionSchema);
