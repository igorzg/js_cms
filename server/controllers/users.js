/**
 * File:
 * User: igorivanovic
 * Date: 2/2/13
 * Time: 8:02 PM
 * @copyright : Igor Ivanovic
 */
/**
 * Controller instance
 * @type {Controller}
 */
var controller = require("./controller").init();
/**
 * Configuration
 */
controller.setRoutePrefix("/admin/users");


/**
 * Models and validators
 * @type {*}
 */
var userModel = require("../models/user").init();
var categoriesModel = require("../models/categories").init();
var sessionModel = require("../models/session").init();
var validators = require("../config/validators").init();
var profiler = require('../profiler').init();

/**
 * Gets route
 */
controller.setRoute("get","/list",function(req,res){

    profiler.startTracing("UsersController.list");

    var response;

    /**
     * Exports user current session !!!!
     * @type {Array}
     */
    sessionModel.checkSession(req, function(session){

        userModel.listAll(function(error,rows){


            if( rows !== null ){
                response = {
                    error : false,
                    data : rows
                };
            }else if(error){
                response = {
                    error : true,
                    translations : {
                        "Error in query no data fetched" : "Error in query no data fetched"
                    }
                };
            }else{
                response = {
                    error : false,
                    data : rows
                };
            }


            res.json(response);

            profiler.endTracing("UsersController.list", {
                response : response,
                session : session,
                rows : rows
            });
        });

    }, function(session){

        response = {
            error : true,
            translations : {
                "You dont have perrmision to do that" : "You dont have perrmision to do that"
            }
        };

        res.json(response);

        profiler.endTracing("UsersController.list", {
            response : response,
            session : session
        });
    });
});


/**
 * Initialize controler
 * @param app
 */
exports.init  = function(app, controllers){




    /**
     * compile routes
     */
    controller.compileRoutes(app);
    /**
     * Rreturn data to router
     */
    return controller;
}
