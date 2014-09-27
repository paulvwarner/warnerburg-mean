var mongoose = require("mongoose");

// define schema - second arg is the collection to map to
var commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    contentId: mongoose.Schema.Types.ObjectId,
    author: String,
    authorEmail: String,
    authorIP: String,
    commentDate: Date,
    text: String
},{collection:'comments'});

// register schema as the "comment" mongoose model
mongoose.model('comment', commentSchema);