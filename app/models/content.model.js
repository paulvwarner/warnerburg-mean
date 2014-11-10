var mongoose = require("mongoose");

// define schema - second arg is the collection to map to
var contentSchema = mongoose.Schema({
        sequenceNumber: Number,
        sequenceNumberElements: Array,
        legacyId: Number,
        author: Number,
        authorPicture: String,
        createdDate: Date,
        lastModifiedDate: Date,
        lastPublishedDate: Date,
        createdDateElements: Array,
        text: String,
        image: String,
        title: String,
        category: String,
        status: String,
        isFirst: Boolean,
        isLast: Boolean
    },
    {collection:'content'});

// register schema as the "content" mongoose model
mongoose.model('content', contentSchema);
