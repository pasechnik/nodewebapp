/**
 * Module dependencies.
 */
const http             = require('http');
const express          = require('express');
const compression      = require('compression');
const session          = require('express-session');
const bodyParser       = require('body-parser');
const logger           = require('morgan');
const errorHandler     = require('errorhandler');
const lusca            = require('lusca');
const dotenv           = require('dotenv');
const flash            = require('express-flash');
const path             = require('path');
const fs               = require('fs');
const expressValidator = require('express-validator');
const sass             = require('node-sass-middleware');
const multer           = require('multer');
const upload           = multer({dest: path.join(__dirname, 'uploads')});

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: '.env.example'});

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');

/**
 * Create Express server.
 */
const app = express();

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compression());
app.use(sass({
                 src : path.join(__dirname, 'public'),
                 dest: path.join(__dirname, 'public')
             }));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(session({
                    resave           : true,
                    saveUninitialized: true,
                    secret           : process.env.SESSION_SECRET,
                    cookie           : {secure: true}
                }));

app.use(flash());
app.use((req, res, next) => {
    if (req.path === '/api/upload') {
        next();
    }
    else {
        lusca.csrf()(req, res, next);
    }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;