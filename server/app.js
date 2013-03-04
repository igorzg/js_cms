/**
 * File:
 * User: igorivanovic
 * Date: 1/19/13
 * Time: 11:42 PM
 * @copyright : Igor Ivanovic
 */
var express = require('express');
var http = require('http');
var app = express();

/**
 * Configure express
 */
app.configure(function(){
    app.set('port', 10350);
    app.locals.pretty = true;
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'TWFuIGlzIGRc3Rpbmd1ZWQsvdCBvbmxGJ5IGhpcyByZWFzb2J1dCBeSB0aGlz' }));
    app.use(express.methodOverride());
    app.use(express.bodyParser({uploadDir:'/tmp'}));
    app.use(app.router);
});


/**
 * On all requests add headers
 */
app.all('*', function(req, res,next) {


    /**
     * Response settings
     * @type {Object}
     */
    var responseSettings = {
        "AccessControlAllowOrigin": req.headers.origin,
        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
        "AccessControlAllowCredentials": true
    };

    /**
     * Headers
     */
    res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
    res.header("Access-Control-Allow-Origin",  responseSettings.AccessControlAllowOrigin);
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
    res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);

    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }


});



/**
 * Require router
 */
require('./config/router')(app, express);
/**
 * Create server
 */
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
})