var express = require('express');
var path = require("path");
var swig = require("swig");
var mongoose = require("mongoose");

// require all model files
require('./models/content.model.js');
require('./models/comment.model.js');

var app = express();

// set view engine
app.engine('html', swig.renderFile);
app.set('view engine', 'html');

// set path to views
app.set('views', __dirname + '/views');

// allow pages to see files in root directory
app.use('/',    express.static(__dirname));

// override swig's use of handlebars so it doesn't conflict with angular
swig.setDefaults({varControls: ['[[',']]']});

// define routes
app.get('/', processGetRoot);
app.get('/content/', processGetContent);
app.get('/comic/:sequenceNumber', processGetComicPage);

// connect to the database, then start accepting requests if it works.
// keepAlive prevents DB connection timeout
mongoose.connect('mongodb://localhost/warnerburgLocal', { keepAlive: 1 }, function(err) {
    if (err) throw err;

    // if no error, db is now open and we can accept requests
    console.log('db open');

    app.listen(3001);
});




// request handlers
function processGetRoot(req, res) {
    res.render(
        'main.html'
    );
}

function processGetContent(req, res) {
    mongoose.model('content').find({},
        function(err, data) {
            if (err) return console.error(err);
            res.send(JSON.stringify(data));
        }
    );
}

function processGetComicPage(req, res) {
    mongoose.model('content').find({},
        function(err, data) {
            if (err) return console.error(err);
            res.send(JSON.stringify(data));
        }
    );
}