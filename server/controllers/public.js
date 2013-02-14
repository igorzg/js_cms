/**
 * File:
 * User: igorivanovic
 * Date: 2/7/13
 * Time: 11:46 PM
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
//controller.setRoutePrefix("/");


/**
 * Models and validators
 * @type {*}
 */
var categoriesModel = require("../models/categories").init();
var articlesModel = require("../models/articles").init();
var validators = require("../config/validators").init();

/**
 * List articles
 * @param req
 * @param res
 * @param query
 */
var listArticles = function(callback, query){

    var response;

    articlesModel.listAll(function(error,rows){

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
                data : []
            };
        }


        response.listAll = true;


        callback(response);

    }, query, { limit: 10 } );

}



/**
 * Search
 */
controller.setRoute("get","/search", function(req,res){

    var q = req.param("q");
    q = validators.addSlashesRecursive(q);

    if( validators.isDefined(q) ){
        listArticles(function(response){
            res.json(response);
        },{
            $query: {
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { tags: { $regex: q, $options: 'i' } }
                ]
            },
            $orderby: { created : -1, _id : -1 }
        });
    }else{
        res.json({
            error : false,
            data : []
        });
    }




});




/**
 * Resolve url
 */
controller.setRoute("get","/resolve", function(req,res){

    var url = req.param("url");
        url = validators.addSlashesRecursive(url);

    if( url !== "/" ){

        var u = url.replace(/\/$/,"");

        categoriesModel.one({ url : u },function(error,category){

            if(category === null){
                articlesModel.one({ url : u }, function(error,data){
                    res.json({
                        error : error,
                        data : data,
                        url : u,
                        category : null
                    });
                });
            }else{
                listArticles(function(response){
                    response.category = category;
                    response.url = u;
                    res.json(response);
                },  { $query: { category : category._id }, $orderby: { created : -1, _id : -1 } } );

            }

        });


    }else{
        listArticles(function(response){
            res.json(response);
        });
    }


});

/**
 * Display categories
 */
controller.setRoute("get","/categories", function(req,res){

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
                data : null
            };
        }

        res.json(response);
    },{ $query: { parent_category: null }, $orderby: { created : -1, _id : -1 }  }, { limit: 10 } );
});

/**
 * Email validations
 */
controller.setRoute("get","/token", function(req,res){
    /**
     * Random Id
     */

    req.session.token = validators.generateString(40);
    req.session.sendCounter = 0;


    res.json({
        token : req.session.token
    });

});

/**
 * Send email
 */
controller.setRoute("post","/email", function(req,res){


    req.session.sendCounter = req.session.sendCounter + 1;


    var errors = [], spam = false;

    var data = {
        message : req.param("message"),
        subject : req.param("subject"),
        email : req.param("email"),
        name : req.param("name"),
        token : req.param("token")
    };

    data = validators.stripTagsRecursive(data);

    if( !validators.isDefined(data.message) ){
        errors.push("You must enter message");
    }

    if( !validators.isDefined(data.subject) ){
        errors.push("You must enter subject");
    }

    if( !validators.isDefined(data.name) ){
        errors.push("You must enter name");
    }

    if( !validators.isDefined(data.email) || !validators.validateEmail(data.email) ){
        errors.push("You must enter valid email");
    }






    if( data.token !== req.session.token ){
        errors.push("Please dont spam :)");
        spam = true;
    }else if( validators.isUnDefined(data.token) ){
        errors.push("Please dont spam :)");
        spam = true;
    }else if( data.token.length !== 40 ){
        errors.push("Please dont spam :)");
        spam = true;
    }else if( req.session.sendCounter && req.session.sendCounter > 10 ){
        errors.push("Please dont spam :), send counter exceeded");
        spam = true;
    }





    var server = require("../config/email").init();


    var message = {
        text:    data.message,
        from:    data.name + " <"+data.email+">",
        to:      "Igor Ivanovic <info@igorivanovic.info>",
        subject: data.subject
    };


    if( errors.length === 0 ){

        server.send(message, function(error, message) {

            res.json({
                error : error,
                data : message,
                messages : [
                    "I will contact you as soon as possible.",
                    "Enjoy surfing :)"
                ],
                title : "Email sent",
                close_button_title : "Close",
                validators : {
                    validEmail : validators.validateEmail(data.email)
                },
                spam : spam
            });
        });
    }else{
        res.json({
            error : true,
            messages : errors,
            title : "Ups shomething wrong",
            close_button_title : "Close",
            validators : {
                validEmail : validators.validateEmail(data.email)
            },
            //data : data,
            //session : req.session,
            //sendtimes : req.session.sendCounter,
            spam : spam
        });
    }


});



/**
 * Send email
 */
controller.setRoute("post","/snapshot", function(req,res){
    var html = req.param("html");
    var name = req.param("name");
    name = name.replace(/\//ig,"_");
    var snapshot = "/snapshot/" + name + ".html";
    var dir = __dirname + "/../../public" + snapshot;
    var fs = require('fs');
    fs.writeFile(dir, html, 'utf8',function(error) {
        res.json({
            error : error,
            snapshot : snapshot
        });
    });

});

/**
 * Send email
 */
controller.setRoute("get","/sitemap", function(req,res){


    var host = req.host;
    var xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    xml += '<url><loc>http://'+host+'</loc><changefreq>weekly</changefreq></url>';

    categoriesModel.listAll(function(error,data){
        if(data !== null){
            data.forEach(function(val){
                xml += '<url><loc>http://'+host+val.url+'</loc><changefreq>weekly</changefreq></url>';
            });
        }
    });

    articlesModel.listAll(function(error,data){
        if(data !== null){
            data.forEach(function(val){
                xml += '<url><loc>http://'+host+val.url+'</loc><changefreq>weekly</changefreq></url>';
            });
        }
    });


    setTimeout(function(){
        xml += '</urlset>';
        var dir = __dirname + "/../../public/sitemap.xml";
        var fs = require('fs');
        fs.writeFile(dir, xml, 'utf8',function(error) {
            res.set('Content-Type', 'text/xml');
            res.send(new Buffer(xml));
        });
    }, 50);


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

