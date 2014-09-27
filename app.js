var express = require('express');
var path = require("path");
var swig = require("swig");
var mongoose = require("mongoose");

var app = express();

// require all model files
require('./models/content.model.js');
require('./models/comment.model.js');


// set view engine
app.engine('html', swig.renderFile);
app.set('view engine', 'html');

// set path to views
app.set('views', __dirname + '/views');

// allow pages to see files in certain directories
app.use('/controllers',    express.static(__dirname + '/controllers'));
app.use('/includes',    express.static(__dirname + '/views/includes'));
app.use('/images',    express.static(__dirname + '/images'));
app.use('/bower_components',    express.static(__dirname + '/bower_components'));

// override swig's use of handlebars so it doesn't conflict with angular
swig.setDefaults({varControls: ['[[',']]']});

// define routes
app.get('/', processGetRoot);
app.get('/content/', processGetContent);

// require route definition files
require('./routes/comicPage.js')(app);

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

