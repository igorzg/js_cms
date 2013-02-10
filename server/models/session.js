/**
 * File:
 * User: igorivanovic
 * Date: 1/22/13
 * Time: 10:56 PM
 * @copyright : Igor Ivanovic
 */
var moment = require("moment");
var validators = require("../config/validators").init();
var profiler = require('../profiler').init();
/**
 * Session
 * @constructor
 */
function Session(){}
/**
 * Inherit model
 * @type {Model}
 */
Session.prototype = require("./model").init();



/**
 * GenneratesUniqueId
 * @param uid
 */
Session.prototype.createNewSession = function(uid, callback){
    var start = moment(new Date().getTime()).unix();
    var end = start + (60*24);
    this.insert({
        uid : uid,
        start : start,
        end : end
    }, callback, {w:1});
}

/**
 * Check session
 * @param req
 * @param callback
 * @param handleError
 */
Session.prototype.checkSession = function(req, callback, handleError){

    profiler.startTracing("SessionModel.checkSession");

    var start = moment(new Date().getTime()).unix(),
        end = start + (60*24),
        self = this,
        id = req.session.currentSessionId;

    if( req.session && req.session.user && req.session.currentSessionId ){
        this.one({
            _id : validators.validateMongoObjectId( id ),
            start : { $lt : start },
            end : { $gt : start }
        }, function(error,data){
               if( data === null ){
                   handleError(error,data);
               }else{

                   /**
                    * update session end time on user interaction
                    * DONT USE this.update because of memory allocation
                    */
                   self.collection.update(
                       {
                           id : id,
                           start : { $lt : start },
                           end : { $gt : start }
                       },
                       { $set: { end : end } },
                       function(e,d){

                       }
                   );


                   callback(data,req.session.user);
               }
                profiler.endTracing("SessionModel.checkSession", {
                    data : data,
                    session : req.session,
                    error : error
                });
        });
    }else{
        handleError(true,"nosession");
        profiler.endTracing("SessionModel.checkSession", {
            session : req.session
        });
    }
}

/**
 * Set Session
 * @param req
 */
Session.prototype.setSession = function(req,user,id){
    req.session.user = user;
    req.session.currentSessionId = id;
}

/**
 * DeleteSession
 * @param req
 */
Session.prototype.deleteSession = function(req){
    req.session.destroy();
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
    var model =  new Session();
    /**
     * Set collection
     */
    model.setCollection("session");

    /**
     * Set model shema
     */
    model.setSchema({
        uid : null,
        start : null,
        end : null
    });

    return model;
}