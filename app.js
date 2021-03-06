var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// database connection: mongoDB and Mongoose
var mongo = require('mongodb');
var mongoose = require('mongoose');

// connect to the mongodb database
mongoose.connect('mongodb://localhost:27017/pitch-tracker');

// mongoose connection and event handlers
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() { console.log('database connection successful'); });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// create a session
app.use(session({
    secret: 'pitch-tracker-secret',
    resave: true,
    saveUninitialized: false
}));

// make db and models accessible to the router
app.use(function(req, res, next) {
    req.db = db;
    req.models = require('./models/models');
    next();
});

app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/admin', require('./routes/admin'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    // add line breaks to html output
    app.locals.pretty = true;

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
