var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var schedule = require('node-schedule');


var Promise = require('promise');

var ejsLayouts  = require("express-ejs-layouts");
var moment      = require('moment');
var multer  = require('multer');

var flash       = require('express-flash');

var db          = require('./connection');
var settings    =require('./config/settings');
var routes      = require('./routes/index');
var users       = require('./routes/users');
var messages    = require('./routes/messages');
var friends     = require('./routes/friends');
var admin       = require('./routes/admin');
var crons       = require('./routes/crons');

var app        = express();


// Comment for some time
// var j = schedule.scheduleJob('* * * * * *', function(){
//     crons.delete_conversation();
// });

app.set('trust proxy', 1) // trust first proxy
var session = require('express-session');
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
    var original_request =req.originalUrl;
    var string_array =original_request.split('/');
    console.log(string_array['0']);
    /*if(string_array == '/users/logins' || req.originalUrl == '/users/check_user_login'){
        app.set('layout', 'adminLoginLayout');
    }
    else if(req.originalUrl == '/admin/login' || req.originalUrl == '/admin/signup'){
        app.set('layout', 'adminLoginLayout');  
    }
    else if(req.originalUrl == '/'){
        app.set('layout', 'layouts/mainLayout');
    }
    else{
        app.set('layout', 'adminMainLayout');
    }*/
    if(string_array['1'] == 'admin' && string_array['2'] == 'login'){
        global.cssJSUrl   = req.protocol + '://' + req.headers.host + '/'+'backend';
        app.set('layout', 'adminLoginLayout');
    }
    else if(string_array['1'] == 'admin' && string_array['2'] != 'login'){
        global.cssJSUrl = req.protocol + '://' + req.headers.host + '/'+'backend';
        global.baseUrl = req.protocol + '://' + req.headers.host;
        app.set('layout', 'adminMainLayout');
    }
    else{
        global.cssJSUrl = req.protocol + '://' + req.headers.host + '/frontend';
        
        global.baseUrl = req.protocol + '://' + req.headers.host;
        
        app.set('layout', 'layouts/mainLayout');
    }
    res.locals.admin = req.session.admin;
    res.locals.currentUser = req.session.currentUser;


    
    return next();
});

app.use(ejsLayouts); 

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());


app.use('/', routes);
app.use('/users', users);
app.use('/admin', admin);
app.use('/messages', messages);
app.use('/friends', friends);
app.use('/crons', crons);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
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
