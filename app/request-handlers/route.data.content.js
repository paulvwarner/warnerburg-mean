var mongoose = require("mongoose");
var common = require("warnerburg-common");

function processGetContent(req, res) {
    mongoose.model('content').find({},
        function(err, data) {
            if (err) return console.error(err);
            res.send(JSON.stringify(data));
        }
    );
}

module.exports = function(app) {
    app.get('/content/', processGetContent);
};