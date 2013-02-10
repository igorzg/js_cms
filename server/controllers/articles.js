/**
 * File:
 * User: igorivanovic
 * Date: 1/24/13
 * Time: 1:07 AM
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
controller.setRoutePrefix("/admin/articles");

var ObjectID = require('mongodb').ObjectID;
/**
 * Models and validators
 * @type {*}
 */
var userModel = require("../models/user").init();
var categoriesModel = require("../models/categories").init();
var articlesModel = require("../models/articles").init();
var sessionModel = require("../models/session").init();
var validators = require("../config/validators").init();
var profiler = require('../profiler').init();

/**
 * list all data
 */
controller.setRoute("get","/list", function(req,res){

    profiler.startTracing("ArticlesController.list");

    var response, categories = [];

    /**
     * Filter category
     * @param id
     * @param categories
     * @return {*}
     */
    var filterCategory = function(id, categories){

        var clen = categories.length;

        for(var i = 0; i < clen; ++i){
            if( String(categories[i]._id) === String(id) ){
                return categories[i];
            }
        }

        return null;
    }

    /**
     * Merge Articles
     * @param articles
     * @param categories
     * @return {*}
     */
    var mergeArticles = function(articles, categories){
        var alen = articles.length;

        for(var i = 0; i < alen; ++i){
            articles[i].categoryData = filterCategory( articles[i].category, categories );
        }

        return articles;
    }

    /**
     * Exports user current session !!!!
     * @type {Array}
     */
    sessionModel.checkSession(req, function(session){

        categoriesModel.listAll(function(error,rows){
            categories = rows;
        });


        /**
         * Required for fetching categories
         */
        setTimeout(function(){

            articlesModel.listAll(function(error,rows){

                if( rows !== null ){
                    response = {
                        error : false,
                        data : mergeArticles(rows,categories)
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

                profiler.endTracing("ArticlesController.list", {
                    response : response,
                    session : session,
                    rows : rows
                });

            });

        }, 20);

    }, function(session){

        response = {
            error : true,
            translations : {
                "You dont have perrmision to do that" : "You dont have perrmision to do that"
            }
        };

        res.json(response);

        profiler.endTracing("ArticlesController.list", {
            response : response,
            session : session
        });
    });

});


/**
 * list all data
 */
controller.setRoute("get","/one", function(req,res){

    profiler.startTracing("ArticlesController.one");

    var response;


    /**
     * Exports user current session !!!!
     * @type {Array}
     */
    sessionModel.checkSession(req, function(session){

        articlesModel.getByID(req.param("id"),function(error,rows){


            if( rows !== null ){
                response = {
                    error : false,
                    data : rows,
                    id : req.param("id")
                };
            }else if(error){
                response = {
                    error : true,
                    translations : {
                        "Error in query no data fetched" : "Error in query no data fetched"
                    },
                    id : req.param("id")
                };
            }else{
                response = {
                    error : false,
                    data : rows,
                    id : req.param("id")
                };
            }


            res.json(response);

            profiler.endTracing("ArticlesController.one", {
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

        profiler.endTracing("ArticlesController.one", {
            response : response,
            session : session
        });
    });

});

/**
 * Save articles
 * @param app
 * @param controllers
 * @return {Controller}
 */


controller.setRoute("post","/save", function(req,res){




    profiler.startTracing("ArticlesController.save");

    var errors = [], response = {}, image = null;

    var data = {
        title : req.param("title"),
        tags : req.param("tags"),
        short_description : req.param("short_description"),
        description : req.param("description"),
        youtube : req.param("youtube"),
        category : parseInt(req.param("category")),
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

    if( !validators.isDefined(data.description) ){
        errors.push("You must enter description");
    }

    if( req.files && req.files.image && req.files.image.type && req.files.image.size > 0  ){
        var types = ['image/jpeg','image/png','image/gif'];
        if(types.indexOf(req.files.image.type) === -1 ){
            errors.push("Image is not valid type");
        }else{
            image =  req.files.image.name;
            data.image = image;
        }
     }


     if( isNaN(data.category) ){
         data.category = null;
     }


    var redirect = function(response,data){

        if(validators.isDefined(data.id)){
            res.redirect( req.param("redirect") + "/add/" + data.id + "?errors=" + JSON.stringify(response) );
        }else{
            res.redirect( req.param("redirect") + "/add" + "?errors=" + JSON.stringify(response) );
        }

    }




    /**
     * Exports user current session !!!!
     * @type {Array}
     */
    sessionModel.checkSession(req, function(session){

        if( errors.length > 0 ){
            response.error = true;
            response.translations = errors;

            redirect(response,data);

            profiler.endTracing("ArticlesController.save", {
                response : response,
                session : session,
                error : true,
                errors : errors
            });
            return;
        }

        articlesModel.save(data,function(error,rows){


            if( rows !== null ){
                if( validators.isDefined(data.id) ){

                    if( image !== null && data !== null ){

                        var fs = require("fs"), dir = __dirname + "/../../public/static/images/" + data.id + "/";
                        fs.exists(dir, function (exists) {
                            if( exists === false ){
                                fs.mkdir(dir);
                            }
                        });
                        fs.readFile(req.files.image.path, function (err, f) {
                            var newPath =  dir + image;
                            fs.writeFile(newPath, f);
                        });
                    }
                    response.error = false;
                    response.data = rows;
                    res.redirect( req.param("redirect") );


                }else{

                    articlesModel.lastInsertId(function(error,last){

                        if( image !== null && data !== null && last !== null ){

                            var fs = require("fs"),  dir = __dirname + "/../../public/static/images/"  + last._id + "/";
                            fs.exists(dir, function (exists) {
                                if(!exists){
                                    fs.mkdir(dir);
                                }
                            });
                            fs.readFile(req.files.image.path, function (err, f) {
                                var newPath =  dir + image;
                                fs.writeFile(newPath, f);
                            });
                        }

                        response.error = false;
                        response.data = rows;
                        res.redirect( req.param("redirect") );

                    });

                }


            }else if(error){

                response.error = true;
                response.translations = {
                    "Error in query no data fetched" : "Error in query no data fetched"
                };
                redirect(response,data);
            }else{
                response.error = false;
                response.data = null;
                redirect(response,data);

            }




            profiler.endTracing("ArticlesController.save", {
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

        profiler.endTracing("ArticlesController.save", {
            response : response,
            session : session
        });
    });

});




/***
 * Delete all
 */
controller.setRoute("get","/delete/:id", function(req,res){

    profiler.startTracing("ArticlesController.delete");

    var response, id = req.param("id");

    /**
     * Exports user current session !!!!
     * @type {Array}
     */
    sessionModel.checkSession(req, function(session){

        articlesModel.deleteByID(id,function(error,rows){


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

            profiler.endTracing("ArticlesController.delete", {
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

        profiler.endTracing("ArticlesController.delete", {
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
