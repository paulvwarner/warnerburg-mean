var express = require('express');
var path = require("path");
var swig = require("swig");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');

var app = express();

// require all model files
require('./app/server/models/content.model.js');
require('./app/server/models/comment.model.js');


// set view engine
app.engine('html', swig.renderFile);
app.set('view engine', 'html');

// enable access to JSON POST data through req.body
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// set path to views
app.set('views', __dirname + '/app/client/views');

// allow pages to see files in certain directories
app.use('/controllers',    express.static(__dirname + '/app/client/controllers'));
app.use('/routes',    express.static(__dirname + '/app/client/routes'));
app.use('/includes',    express.static(__dirname + '/app/client/views/includes'));
app.use('/images',    express.static(__dirname + '/app/client/images'));
app.use('/bower_components',    express.static(__dirname + '/app/client/bower_components'));
app.use('/views',    express.static(__dirname + '/app/client/views'));

// override swig's use of handlebars so it doesn't conflict with angular
swig.setDefaults({varControls: ['[[',']]']});

// require request handler definition files
require('./app/server/request-handlers/handler.display.main.js')(app);
require('./app/server/request-handlers/handler.display.comic.js')(app);
require('./app/server/request-handlers/handler.display.admin.js')(app);
require('./app/server/request-handlers/handler.data.comic.comments.js')(app);
require('./app/server/request-handlers/handler.data.admin.comics.js')(app);
require('./app/server/request-handlers/handler.data.comic.js')(app);

// connect to the database, then start accepting requests if it works.
// keepAlive prevents DB connection timeout
mongoose.connect('mongodb://localhost/warnerburgLocal', { keepAlive: 1 }, function(err) {
    if (err) throw err;

    // if no error, db is now open and we can accept requests
    console.log('db open');

    app.listen(3001);
});