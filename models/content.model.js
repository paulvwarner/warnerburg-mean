var mongoose = require("mongoose");

// define schema - second arg is the collection to map to
var contentSchema = mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        sequenceNumber: Number,
        sequenceNumberElements: Array,
        legacyId: Number,
        author: Number,
        createdDate: Date,
        lastModifiedDate: Date,
        lastPublishedDate: Date,
        lastPublishedDateElements: Array,
        text: String,
        image: String,
        title: String,
        category: String,
        status: String
    },
    {collection:'content'});

// register schema as the "content" mongoose model
mongoose.model('content', contentSchema);
