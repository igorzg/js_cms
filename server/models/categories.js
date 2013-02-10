/**
 * File:
 * User: igorivanovic
 * Date: 1/24/13
 * Time: 12:35 AM
 * @copyright : Igor Ivanovic
 */
var validators = require("../config/validators").init();
var moment = require("moment");
var profiler = require('../profiler').init();


/**
 * Recursive url build
 * @param data
 * @return {String}
 */
var recursiveUrl = function(data){

    var title = "";

    if( validators.isDefined(data) ){
        if( validators.isDefined(data.parent) ){
            title += recursiveUrl(data.parent);
        }
        if( validators.isDefined(data.title) ){
            title += data.title + "/";
        }
    }
    return title;
};



/**
 * Model constructor
 * @constructor
 */
function Categories(){}
/**
 * Inherit model
 * @type {Model}
 */
Categories.prototype = require("./model").init();

/**
 * Recursive
 * @param parent
 */
Categories.prototype.createUrlRecursive = function(parent, callback){

    profiler.startTracing("CategoriesModel.createUrlRecursive");

    var self = this;

    parent = validators.validateMongoObjectId(parent);

    if( !isNaN(parent) &&  parent > 0 ){
        this.getByID(parent, function(error,data){



            if( validators.isDefined(data) && validators.isDefined(data.parent_category) ){
                self.createUrlRecursive(data.parent_category,function(parent_error, parent_data){
                    data.parent = parent_data;
                    callback(error,data);
                });
            }

            callback(error,data);

            profiler.endTracing("CategoriesModel.createUrlRecursive", {
                error: error,
                data: data
            });
        });
    }else{
        profiler.endTracing("CategoriesModel.createUrlRecursive", {
            error: true,
            data: null,
            message: "PARENT IS NAN"
        });
    }

}


/**
 * Initalize users model
 * @return {Model}
 */
exports.init = function(){
    /**
     * Construct model
     * @type {Articles}
     */
    var model =  new Categories();

    /**
     * Set model shema
     */
    model.setSchema({
        title : null,
        tags : null,
        short_description : null,
        parent_category : null,
        url : null
    });


    /**
     * Set collection
     */
    model.setCollection("categories");

    /**
     * On before insert add recursive url build
     * @param insert
     */
    model.onBeforeInsert = function(insert){

        /**
         * Model
         * @type {*}
         */
        var self = this;
        /**
         * Build url recursive
         */
        model.createUrlRecursive( self.schema.parent_category, function(parent_error,parent_data){
            if( parent_data !== null ){
                self.schema.url = recursiveUrl(parent_data);
            }
        });

        /**
         * Timeout insert
         */
        setTimeout(function(){
            /**
             * Clean url
             * @type {*}
             */
            if( validators.isDefined(self.schema.url) ){
                self.schema.url = "/" + validators.cleanUrl( self.schema.url + self.schema.title  );
            }else{
                self.schema.url = "/" + validators.cleanUrl( self.schema.title );
            }

            /**
             * Invoke insert
             */
            insert();
        }, 20);
    }

    /**
     * Applay same functionality
     * @type {*}
     */
    model.onBeforeUpdate = model.onBeforeInsert;



    return model;
}
