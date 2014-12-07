var mongoose = require("mongoose");

// define schema - second arg is the collection to map to
var contentSchema = mongoose.Schema({
        thumbnailImageUrl: String,
        descriptionImageUrl: String,
        category: String,
        sectionName: String,
        sequenceNumber: Number
    },
    {collection:'section'});

// register schema as the "content" mongoose model
mongoose.model('section', contentSchema);
