var express = require('express');
var swig = require("swig");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var auth = require('basic-auth');
var app = express();
var crypto = require("crypto");

// set up logging
var log = require('warnerburg-logging-config')();

// enforce global authentication
app.use(function(req, res, next) {
    var user = auth(req);
    if (user === undefined ||
        user['name'] !== 'admin' ||
        ('' + crypto.createHmac('sha1', process.env.ENCKEY).update(user['pass']).digest('hex')) !== '19ce8ba148cf53f0514aa3300def80549cd70f75') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        res.end('Unauthorized');
    } else {
        next();
    }
});

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
app.use('/modules',    express.static(__dirname + '/app/client/modules'));
app.use('/routes',    express.static(__dirname + '/app/client/routes'));
app.use('/includes',    express.static(__dirname + '/app/client/views/includes'));
app.use('/images',    express.static(__dirname + '/app/client/images'));
app.use('/bower_components',    express.static(__dirname + '/app/client/bower_components'));
app.use('/views',    express.static(__dirname + '/app/client/views'));
app.use('/env/properties',    express.static(__dirname + '/node_modules/warnerburg-common'));
app.use('/env/logging',    express.static(__dirname + '/node_modules/warnerburg-logging-config'));

// override swig's use of handlebars so it doesn't conflict with angular
swig.setDefaults({varControls: ['[[',']]']});

// require request handler definition files
require('./app/server/request-handlers/handler.display.main.js')(app);
require('./app/server/request-handlers/handler.display.gallery.js')(app);
require('./app/server/request-handlers/handler.display.info.js')(app);
require('./app/server/request-handlers/handler.display.store.js')(app);
require('./app/server/request-handlers/handler.display.links.js')(app);
require('./app/server/request-handlers/handler.display.comic.js')(app);
require('./app/server/request-handlers/handler.display.admin.js')(app);
require('./app/server/request-handlers/handler.data.content.js')(app);
require('./app/server/request-handlers/handler.data.common.js')(app);
require('./app/server/request-handlers/handler.data.admin.js')(app);

// connect to the database, then start accepting requests if it works.
// keepAlive prevents DB connection timeout
mongoose.connect('mongodb://localhost/warnerburgLocal', { keepAlive: 1 }, function(err) {
    if (err) throw err;

    // if no error, db is now open and we can accept requests
    log.info('db open - listening at 3001');

    app.listen(3001);
});