/**
 * File:
 * User: igorivanovic
 * Date: 1/19/13
 * Time: 11:14 PM
 * @copyright : Igor Ivanovic
 */
/**
 * Require some validators
 * @type {*}
 */
var validators = require("../config/validators").init();
var moment = require("moment");
var profiler = require('../profiler').init();

/**
 * Model constructor
 * @constructor
 */
function User(){}
/**
 * Inherit model
 * @type {Model}
 */
User.prototype = require("./model").init();

/**
 * Find user by username
 * @param user
 */
User.prototype.findByUsername = function(user, callback){


    profiler.startTracing("UserModel.findByUsername");

    /**
     * Username can be email or username
     * @type {Object}
     */
    var obj = {};

    if( validators.validateEmail(user) ){
        obj.email = user;
    }else{
        obj.username = user;
    }

    /**
     * Antihack
     * @type {*}
     */
    obj = validators.addSlashesRecursive( obj );


    this.one(obj,callback);

    profiler.endTracing("UserModel.findByUsername", obj);
}

/***
 * Login user
 * @param user
 * @param password
 * @param callback
 */
User.prototype.loginUser = function(username,password,callback){

    username = validators.addSlashesRecursive( username );
    password = validators.addSlashesRecursive( password );

    /**
     * Fire method
     */
    this.findByUsername(username,function(error,user){

        user = validators.stripSlashesRecursive( user );

        var obj = {};

        if( validators.isDefined(user) ){

            if( validators.validatePassword(password,user.password) ){
                obj = {
                    error : false,
                    user : user,
                    methodFired : "User.loginUser",
                    translations : "User successufuly logged in"
                };
            }else{
                obj = {
                    error : true,
                    user : null,
                    methodFired : "User.loginUser.validatePassword",
                    translations : "Please verify your credentials!"
                };
            }
        }else{
            obj = {
                error : true,
                user : null,
                methodFired : "User.loginUser.isDefined",
                translations : "Please verify your credentials!"
            };
        }
        if( validators.isFunction(callback) ){
            callback(obj);
        }

    });
}




/**
 * Create user
 * @param data
 * @param callback
 */
User.prototype.createUser = function(data, callback){

    var errors = [];

    if( !validators.isDefined(data.name) ){
        errors.push("You must enter first name and last name");
    }else{
        if( !data.name.first ){
            errors.push("You must enter first name");
        }else if( !data.name.last ){
            errors.push("You must enter last name");
        }else if( String(data.name.first).length < 3 ){
            errors.push("Your first name length must be at least 3 characters");
        }else if( String(data.name.last).length < 3 ){
            errors.push("Your last name length must be at least 3 characters");
        }
    }

    if( !validators.isDefined(data.username) ){
        errors.push("You must enter username");
    }else if( String(data.username).length < 6 ){
        errors.push("Username must have at least 6 characters");
    }


    if( !validators.isDefined(data.password) ){
        errors.push("You must enter username");
    }else if( String(data.password).length < 6 ){
        errors.push("Password must have at least 6 characters");
    }else{
        validators.saltAndHash(data.password,function(pass){
            data.password = pass;
        });
    }

    if( !validators.isDefined(data.email) ){
        errors.push("You must enter email");
    }else if( !validators.validateEmail( String(data.email) ) ){
        errors.push("You must enter valid email pattern");
    }

    if( validators.isDefined(data.age) ){
        if( validators.isDefined(data.age.day) ){
            data.age.day = parseInt( data.age.day );
        }
        if( validators.isDefined(data.age.year) ){
            data.age.year = parseInt( data.age.year );
        }
        if( validators.isDefined(data.age.month) ){
            data.age.month = parseInt( data.age.month );
        }
    }


    if( errors.length > 0 ){
        var obj = {
            error : true,
            translations : errors
        };
        if( validators.isFunction(callback) ){
            callback(obj);
            return ;
        }
        return obj;
    }

    data.type = 1;


    this.insert(data, function(error,data){
        var obj = {
            error : false,
            translations : "User created successufuly",
            error : error,
            data : data
        };
        callback(obj);
    });


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
    var model =  new User();
    /**
     * Set collection
     */
    model.setCollection("users");


    /**
     * Set model shema
     */
    model.setSchema({
        "name": {
            "first": null,
            "last": null
        },
        "username": null,
        "password": null,
        "email": null,
        "age": {
            "day": null,
            "year": null,
            "month": null
        },
        "type": 0
    });

    /***
     * Model
     */
    return model;
}
