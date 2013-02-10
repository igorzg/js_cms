/**
 * File:
 * User: igorivanovic
 * Date: 1/19/13
 * Time: 11:27 PM
 * @copyright : Igor Ivanovic
 */

/**
 * Controller instance
 * @type {Controller}
 */
var controller = require("./controller").init();
var profiler = require('../profiler').init();
/**
 * Configuration
 */
controller.setRoutePrefix("/admin");


/**
 * Models and validators
 * @type {*}
 */
var userModel = require("../models/user").init();
var sessionModel = require("../models/session").init();
var validators = require("../config/validators").init();


/**
 * Authenticate user
 */
controller.setRoute("post","/authenticate/login",function(req, res){

    profiler.startTracing("HomeController.authenticate.login");

    var errors = [];

    if( !validators.isDefined(req.param("username")) ){
        errors.push("Please enter your username");
    }

    if( !validators.isDefined(req.param("password")) ){
        errors.push("Please enter your password");
    }

    var response = {};


    /***
     * Before peeking in database check if everything is valid
     */
    if( errors.length === 0 ){
        userModel.loginUser(req.param("username"),req.param("password"), function(data){


            if( data.user !== null ){
                sessionModel.createNewSession(data.user._id,function(e,d){

                    sessionModel.setSession( req, data.user, d[0]._id );

                    response = {
                        data : data,
                        sessionID : d[0]._id
                    };

                    res.json(response);

                    profiler.endTracing("HomeController.authenticate.login", response);

                });
            }else{

                errors.push("Please verify your credentials!");
                response = {
                    error : true,
                    user : null,
                    serialized : null,
                    translations : errors
                };
                res.json(response);

                profiler.endTracing("HomeController.authenticate.login", response);
            }



        });

    }else{
        errors.push("Please verify your credentials!");
        response = {
            error : true,
            user : null,
            serialized : null,
            translations : errors
        };
        res.json(response);

        profiler.endTracing("HomeController.authenticate.login", response);
    }


});

/**
 * ValidateSession
 */
controller.setRoute("all","/checksession", function(req,res){

    profiler.startTracing("HomeController.checksession");
    var response;

    /**
     *
     * Exports user current session !!!!
     * @type {Array}
     */
    sessionModel.checkSession(req, function(session, user){

        response = {
            redirect : "/admin/",
            isLoggedIn : true,
            user : user,
            session : req.session,
            handler : "sessionHandler"
        };

        res.json(response);

        profiler.endTracing("HomeController.checksession", response);

    }, function(error,data){

        if( req.session.user ){
            response = {
                redirect : "/admin/",
                isLoggedIn : true,
                user : req.session.user,
                session : req.session,
                handler : "sessionErrorUSERHandler",
                error : error,
                data: data
            };
            res.json(response);
            profiler.endTracing("HomeController.checksession", response);
        }else{
            response = {
                redirect : "/admin/login",
                isLoggedIn : false,
                session : req.session,
                handler : "sessionErrorHandler",
                error : error,
                data: data
            };
            sessionModel.deleteSession(req);
            res.json(response);
            profiler.endTracing("HomeController.checksession", {response :response, session: req.session});
        }


    });


});




/**
 * ValidateSession
 */
controller.setRoute("all","/deletesession", function(req,res){


    profiler.startTracing("HomeController.deletesession");


    var id = req.param("sid") || req.session.currentSessionId;

    sessionModel.deleteByID(id, function(error,data){
        var response = {
            redirect : "/admin/login",
            isLoggedIn : false,
            error: error,
            data: data,
            id : id,
            session : req.session

        };
        sessionModel.deleteSession(req);
        res.json(response);

        profiler.endTracing("HomeController.deletesession", {response :response, session: req.session});
    });

});



/**
 * Initialize controler
 * @param app
 */
exports.init  = function(app){
    controller.compileRoutes(app);
    /**
     * Rreturn data to router
     */
    return controller;
}

