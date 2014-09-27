var mongoose = require("mongoose");

// define schema - second arg is the collection to map to
var contentSchema = mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        sequenceNumber: Number,
        legacyId: Number,
        author: Number,
        createdDate: Date,
        lastModifiedDate: Date,
        lastPublishedDate: Date,
        text: String,
        image: String,
        title: String,
        category: Number,
        status: String
    },
    {collection:'content'});

// register schema as the "content" mongoose model
mongoose.model('content', contentSchema);
