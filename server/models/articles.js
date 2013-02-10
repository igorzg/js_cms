/**
 * File:
 * User: igorivanovic
 * Date: 1/24/13
 * Time: 12:35 AM
 * @copyright : Igor Ivanovic
 */
var validators = require("../config/validators").init();

/**
 * Model constructor
 * @constructor
 */
function Articles(){}
/**
 * Inherit model
 * @type {Model}
 */
Articles.prototype = require("./model").init();

/**
 * Initalize users model
 * @return {Model}
 */
exports.init = function(){
    /**
     * Construct model
     * @type {Articles}
     */
    var model =  new Articles();
    /**
     * Set collection
     */
    model.setCollection("articles");


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
         * Categories model
         * @type {Model}
         */
        var categoriesModel = require("./categories").init();
        /**
         * Category url
         * @type {null}
         */
        var categoryUrl = null;
        /**
         * Find category
         */
        categoriesModel.getByID( parseInt( self.schema.category ) , function(error,data){
            if(data !== null){
                categoryUrl = data.url;
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
            if( validators.isDefined(categoryUrl) ){
                self.schema.url = validators.cleanUrl( categoryUrl +"/"+ self.schema.title  );
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
    model.onBeforeUpdate = function(update, data){

        if( this.schema.image === null ){
            this.schema.image = data.image;
        }
        model.onBeforeInsert(update);
    };

    /**
     * Set model shema
     */
    model.setSchema({
        title : null,
        tags : null,
        short_description : null,
        description : null,
        image : null,
        category : null,
        youtube : null,
        url : null
    });

    return model;
}