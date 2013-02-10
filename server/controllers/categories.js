/**
 * File:
 * User: igorivanovic
 * Date: 1/28/13
 * Time: 9:29 PM
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
controller.setRoutePrefix("/admin/categories");


/**
 * Models and validators
 * @type {*}
 */
var userModel = require("../models/user").init();
var categoriesModel = require("../models/categories").init();
var sessionModel = require("../models/session").init();
var validators = require("../config/validators").init();
var profiler = require('../profiler').init();

/***
 * Delete all
 */
controller.setRoute("get","/delete/:id", function(req,res){

    profiler.startTracing("CategoriesController.delete");

    var response, id = req.param("id");

    /**
     * Exports user current session !!!!
     * @type {Array}
     */
    sessionModel.checkSession(req, function(session){

        categoriesModel.deleteByID(id,function(error,rows){


            if( rows !== null ){
                response = {
                    error : false,
                    data : rows,
                    id : id,
                    refresh : true
                };
            }else{
                response = {
                    error : true,
                    translations : {
                        "Error in query no data deleted" : "Error in query no data deleted"
                    },
                    id : id,
                    refresh : false
                };
            }


            res.json(response);

            profiler.endTracing("CategoriesController.delete", {
                response : response,
                session : session,
                rows : rows
            });
        });

    }, function(session){

        sessionModel.deleteSession(req);

        response = {
            error : true,
            translations : {
                "You dont have perrmision to do that" : "You dont have perrmision to do that"
            }
        };

        res.json(response);

        profiler.endTracing("CategoriesController.delete", {
            response : response,
            session : session
        });
    });

});

/**
 * list all data
 */
controller.setRoute("get","/one", function(req,res){

    profiler.startTracing("CategoriesController.one");

    var response;

    /**
     * Exports user current session !!!!
     * @type {Array}
     */
    sessionModel.checkSession(req, function(session){

        categoriesModel.getByID(req.param("id"),function(error,rows){


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

            profiler.endTracing("CategoriesController.one", {
                response : response,
                session : session,
                rows : rows
            });
        });

    }, function(session){

        sessionModel.deleteSession(req);

        response = {
            error : true,
            translations : {
                "You dont have perrmision to do that" : "You dont have perrmision to do that"
            }
        };

        res.json(response);

        profiler.endTracing("CategoriesController.one", {
            response : response,
            session : session
        });
    });

});


/**
 * list all data
 */
controller.setRoute("get","/list", function(req,res){

    profiler.startTracing("CategoriesController.list");

    var response;

    /**
     * Exports user current session !!!!
     * @type {Array}
     */
    sessionModel.checkSession(req, function(session){

        categoriesModel.listAll(function(error,rows){


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

            profiler.endTracing("CategoriesController.list", {
                response : response,
                session : session,
                rows : rows
            });
        });

    }, function(session){

        sessionModel.deleteSession(req);

        response = {
            error : true,
            translations : {
                "You dont have perrmision to do that" : "You dont have perrmision to do that"
            }
        };

        res.json(response);

        profiler.endTracing("CategoriesController.list", {
            response : response,
            session : session
        });
    });

});


/**
 * Save category
 * @param app
 * @param controllers
 * @return {Controller}
 */

controller.setRoute("post","/save", function(req,res){

    profiler.startTracing("CategoriesController.save");

    var errors = [];

    var data = {
        title : req.param("title"),
        tags : req.param("tags"),
        short_description : req.param("short_description"),
        parent_category : parseInt( req.param("parent_category") ),
        id : req.param("id")
    };

    if( !validators.isDefined(data.title) ){
        errors.push("You must enter title");
    }

    if( !validators.isDefined(data.tags) ){
        errors.push("You must enter tags");
    }

    if( !validators.isDefined(data.short_description) ){
        errors.push("You must enter short description");
    }

    if( isNaN(data.parent_category) ){
        data.parent_category = null;
    }


    var response;

    /**
     * Exports user current session !!!!
     * @type {Array}
     */
    sessionModel.checkSession(req, function(session){

        if( errors.length > 0 ){
            response = {
                error : true,
                translations : errors
            };
            res.json(response);
            profiler.endTracing("CategoriesController.save", {
                response : response,
                session : session,
                error : true,
                errors : errors
            });
            return;
        }

        categoriesModel.save(data,function(error,rows){


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
                    data : null
                };
            }


            res.json(response);

            profiler.endTracing("CategoriesController.save", {
                response : response,
                session : session,
                rows : rows
            });
        });

    }, function(session){

        sessionModel.deleteSession(req);

        response = {
            error : true,
            translations : {
                "You dont have perrmision to do that" : "You dont have perrmision to do that"
            }
        };

        res.json(response);

        profiler.endTracing("CategoriesController.save", {
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
