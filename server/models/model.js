/**
 * File:
 * User: igorivanovic
 * Date: 2/4/13
 * Time: 12:42 AM
 * @copyright : Igor Ivanovic
 */
var validators = require("../config/validators").init();
var profiler = require('../profiler').init();


function Model(){
    /**
     * database
     * @type {config.db}
     */
    var db =  require("../config/db").init();
    /**
     * Private
     * @return {config.db}
     */
    this.getDb = function(){
        return db;
    }
    /**
     * Collection
     * @type {null}
     */
    this.collection = null;

    /**
     * Cloned schema
     * @type {null}
     */
    this.clonedSchema = null;
    /**
     * Shema
     * @type {Object}
     */
    this.schema = {};


}




/**
 * Model identifier
 * @return {String}
 */
Model.prototype.getIdentifier = function(){
    return this.getCollection().collectionName + "Model";
}
/**
 * Sets collection
 * @param name
 */
Model.prototype.setCollection = function(name){
    this.collection = this.getDb().collection(name);
}

/**
 * Get collection
 */
Model.prototype.getCollection = function(){
    return this.collection;
}

/**
 * Add properys
 */
Model.prototype.setSchema = function(schema){
    this.clonedSchema = schema;
    /**
     * This will be updated
     * @todo functionality will be updated
     * @todo validation cecks on before each write method
     * @todo schema will be structured like
     *
     * {
     *   title : { value : "This is value", validatiors : [{name:"required"},{name:"length", min:6, max: 12}]}
     *   desc : { value : "This is value", validatiors : [{name:"required"},{name:"length", min:6, max: 12}]}
     * }
     * @todo validators will be checked on each write method
     * Currently is not implemented schema validations
     */
}

/**
 * Regenerates schema
 */
Model.prototype.regenerateSchema = function(){
    this.schema = {};
    /**
     * Regenerates schema
     */
    for(var i in this.clonedSchema){
        /**
         * Regenerate schema
         */
        if(this.clonedSchema.hasOwnProperty(i)){
            this.schema[i] = this.clonedSchema[i];
        }
    }
}
/**
 * Shema
 * @return {*}
 */
Model.prototype.getSchema = function(){
    return this.schema;
}
/**
 * Before event
 */
Model.prototype.onBeforeInsert = function( insertFunc ){
    insertFunc();
}
/**
 * After event
 */
Model.prototype.onAfterInsert = function( error, data ){

}
/**
 * On before update
 */
Model.prototype.onBeforeUpdate = function( updateFunc, data ){
    updateFunc();
}
/**
 * On after update
 */
Model.prototype.onAfterUpdate = function( error, data ){

}
/**
 * Get last Insert Id
 * @param callback
 * @param options
 */
Model.prototype.lastInsertId = function(callback){
    this.listAll(function(error,data){
        if( data.length > 0 ){
            callback(error, data[0]);
        }else{
            callback(error, null);
        }
    }, { $query: {}, $orderby: { created : -1, _id : -1 }  },  {limit: 1});
}
/**
 * Insert new record
 * @param req
 * @param callback
 */
Model.prototype.insert = function(req,callback,options){

    /**
     * Required because data referencing
     * Otherwise each method requre new instance
     */
    this.regenerateSchema();

    profiler.startTracing(this.getIdentifier() + ".insert");

    var self = this;

    this.schema.created = (new Date()).getTime();
    this.schema = validators.extend(this.schema,req);
    this.schema = validators.addSlashesRecursive( this.schema );

    var o = validators.extend({}, options);

    /***
     * Id must be incremented so insert must be delayd
     * @param self
     * @param o
     */



    this.lastInsertId(function(error,data){

         if( data !== null ){
             self.schema._id = data._id + 1;
         }else{
             self.schema._id = 1;
         }

        self.onBeforeInsert(function(){

            self.collection.insert(self.schema, o, function(error,res){
                callback( error, res );
                self.onAfterInsert( error, res );
                profiler.endTracing(self.getIdentifier() + ".insert", {
                    error: error,
                    data: res
                });
            });

        });
    });





}


/**
 * Update
 * @param req
 * @param callback
 */
Model.prototype.update = function(req,callback, options){

    /**
     * Required because data referencing
     * Otherwise each method requre new instance
     */
    this.regenerateSchema();

    profiler.startTracing(this.getIdentifier() + ".update");

    this.schema.updated = new Date().getTime();
    this.schema = validators.extend(this.schema,req);
    this.schema = validators.addSlashesRecursive( this.schema );


    var id =  validators.validateMongoObjectId( req.id ), self = this;

    var o = validators.extend({}, options);



    this.getByID(id,function(error,res){

        self.onBeforeUpdate(function(){


            if(res !== null){
                self.schema.created = res.created;
                self.collection.update({_id : id }, self.schema, o, callback);
            }else if(e){
                callback(true,null);
            }else{
                callback(false,{
                    data : null,
                    error : true,
                    translations : {
                        "No data fetched" : "No data fetched",
                        "There is no data by id" : "There is no data by id"
                    },
                    id : req.id
                });
            }

            self.onAfterUpdate( error, res );

            profiler.endTracing(self.getIdentifier() + ".insert", {
                error: error,
                data: res
            });
        }, res);

    });

}


/**
 * Save data
 * @param data
 * @param callback
 */
Model.prototype.save = function(data,callback,options){

    if( validators.isDefined(data.id) ){
        this.update(data,callback,options);
    }else{
        this.insert(data,callback,options);
    }
}


/**
 * Return by id
 * @param id
 * @param callback
 */
Model.prototype.getByID = function(id,callback, options){

    profiler.startTracing(this.getIdentifier() + ".getByID");

    var self = this;

    var o = validators.extend({}, options);




    var id = validators.validateMongoObjectId( id );


    this.collection.findOne({ $query: { _id : id }, $orderby: { created : -1, _id : -1 }  }, o, function(error,data){

        callback(error, validators.stripSlashesRecursive(data) );


        profiler.endTracing( self.getIdentifier() + ".getByID" , {
            error : error,
            data : data,
            id : id
        });
    });

};

/**
 * Delete by id
 * @param id
 * @param callback
 */
Model.prototype.deleteByID = function(id,callback, options){

    profiler.startTracing(this.getIdentifier() + ".deleteByID");

    var self = this;


    var o = validators.extend({}, options);

     var id = validators.validateMongoObjectId( id );


    this.collection.remove({
        _id : id
    }, o, function(error,data){

        callback(error, validators.stripSlashesRecursive(data) );

        profiler.endTracing(self.getIdentifier() + ".deleteByID", {
            error: error,
            data: data,
            id : id
        });
    });

};



/**
 * List all data
 * @param callback
 */
Model.prototype.listAll = function(callback, query, options){

    profiler.startTracing(this.getIdentifier() + ".listAllArticles");

    if( query === undefined ){
        query = { $query: {}, $orderby: { created : -1, _id : -1 }  };
    }

    var self = this;

    var o = validators.extend({}, options);

    this.collection.find(query,o).toArray(function(error,data){
        callback(error, validators.stripSlashesRecursive(data) );
        profiler.endTracing(self.getIdentifier() + ".listAllArticles", {
            error: error,
            data: data
        });
    });

}


/**
 * List all data
 * @param callback
 */
Model.prototype.one = function(query, callback, options){

    profiler.startTracing(this.getIdentifier() + ".one");

    var self = this;

    var o = validators.extend({}, options);

    this.collection.findOne( query, o, function(error,data){

        if( validators.isFunction(callback) ){
            callback(error, validators.stripSlashesRecursive( data ) );
        }
        profiler.endTracing(self.getIdentifier() + ".one", {
            error: error,
            data: data,
            query : query
        });
    });

}



/**
 * Exports model
 * @param app
 * @return {Model}
 */
exports.init = function(){
    return new Model();
}


