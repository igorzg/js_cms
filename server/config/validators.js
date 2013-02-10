/**
 * File:
 * User: igorivanovic
 * Date: 1/21/13
 * Time: 10:54 PM
 * @copyright : Igor Ivanovic
 */
/**
 * Mongo object id
 * @type {*}
 */
var ObjectID = require('mongodb').ObjectID;
/**
 * Salt
 * @type {String}
 */
var crypto = require('crypto');
/***
 * Your password salt
 * @type {String}
 */
var salt = "PLASDKO!1435@!!asd!#$%";
/**
 * Is function
 * @param val
 * @return {Boolean}
 */
var isFunction = function(val){
    return typeof val === "function";
}
/**
 * Check if value is number
 * @param value
 * @return {Boolean}
 */
var isNumber = function(value){
    return typeof value == 'number';
}

/**
 * Check if value is string
 * @param value
 * @return {Boolean}
 */
var isString = function(value){
    return typeof value == 'string';
}

/**
 * Check if is object
 * @param value
 * @return {Boolean}
 */
var isObject = function(value){
    return value != null && typeof value == 'object';
}

/**
 * Defined
 * @param value
 */
var isDefined = function(value){
    if(value === null){
        return false;
    }else if( value === undefined ){
        return false;
    }else if( value === "" ){
        return false;
    }else if( value === "undefined" ){
        return false;
    }else if( value === "null" ){
        return false;
    }

    return true;
}


/**
 * Defined
 * @param value
 */
var isUnDefined = function(value){
    if(value === null){
        return true;
    }else if( value === undefined ){
        return true;
    }else if( value === "" ){
        return true;
    }else if( value === "undefined" ){
        return true;
    }else if( value === "null" ){
        return true;
    }
    return false;
}

/**
 * Return Md5
 * @param str
 * @return {*}
 */
var md5 = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Salts password
 * @param pass
 * @param callback
 */
var saltAndHash = function(pass, callback){

    var salted = md5(salt + pass);

    if( isFunction(callback) ){
        callback(salted);
        return;
    }

    return salted;
}

/**
 * Validate password
 * @param plainPass
 * @param hashedPass
 * @param callback
 */
var validatePassword = function(plainPass, hashedPass, callback){

    var pass = saltAndHash(plainPass);

    if( isFunction(callback) ){
        callback(hashedPass === pass);
        return;
    }

    return hashedPass === pass;
}



/**
 * Validate email
 * @param email
 * @return {Boolean}
 */
var validateEmail = function(email) {
    var re = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/i;
    return re.test(email);
}

/**
 * Addslashes
 * @return {Object}
 */
var addslashes = function(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

/**
 * Strip slashes
 * @param str
 * @return {*|void}
 */
var stripslashes = function (str) {

    return (str + '').replace(/\\(.?)/g, function (s, n1) {
        switch (n1) {
            case '\\':
                return '\\';
            case '0':
                return '\u0000';
            case '':
                return '';
            default:
                return n1;
        }
    });
}

/**
 * Strip slashes recursive
 * @param ob
 * @return {*}
 */
var stripSlashesRecursive = function(ob){
    if( isString(ob) ){
        return stripslashes(ob);
    }else if( Array.isArray(ob) ){
        ob.forEach(function(val, index){
            val = stripSlashesRecursive(val);
        });
        return ob;
    }else if( isObject(ob) ){
        for(var i in ob){
            if(ob.hasOwnProperty(i)){
                ob[i] = stripSlashesRecursive( ob[i] );
            }
        }
        return ob;
    }else{
        return ob;
    }
}

/**
 * Add slashes recursive
 * @param ob
 * @return {*}
 */
var addSlashesRecursive = function(ob){
    if( isString(ob) ){
        return addslashes(ob);
    }else if( Array.isArray(ob) ){
        ob.forEach(function(val, index){
            val = addSlashesRecursive(val);
        });
        return ob;
    }else if( isObject(ob) ){
        for(var i in ob){
            if(ob.hasOwnProperty(i)){
                ob[i] = addSlashesRecursive( ob[i] );
            }
        }
        return ob;
    }else{
        return ob;
    }
}

/**
 * Extend
 * @param d
 * @param s
 */
var extend = function(d,s){

    if( isUnDefined(s) ){
        return d;
    }

    for(var i in d){
        if(s.hasOwnProperty(i)){
            d[i] = s[i];
        }
    }
    return d;
}

/**
 * Cleans url
 * @param value
 */
var cleanUrl = function(value){
    var rgxp = new RegExp("([^\/a-z0-9A-Z-]+)","ig"), str;

    if( isString(value) ){
        str = value.replace(rgxp,"-");
        return str.toLowerCase();
    }

    return value;
}

/**
 * Checks if is object id
 */
var validateMongoObjectId = function(value){
    return parseInt(value);
}


/**
 * Strip tags
 * @param input
 * @param allowed
 * @return {String|XML}
 */
var strip_tags = function(input, allowed) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}


/**
 * Add slashes recursive
 * @param ob
 * @return {*}
 */
var stripTagsRecursive = function(ob, allowed){
    if( isString(ob) ){
        return strip_tags(ob, allowed);
    }else if( Array.isArray(ob) ){
        ob.forEach(function(val, index){
            val = stripTagsRecursive(val, allowed);
        });
        return ob;
    }else if( isObject(ob) ){
        for(var i in ob){
            if(ob.hasOwnProperty(i)){
                ob[i] = stripTagsRecursive( ob[i], allowed );
            }
        }
        return ob;
    }else{
        return ob;
    }
}

/**
 * Generate random string
 * @param string_length
 * @return {String}
 */
var generateString = function(string_length){
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var randomstring = '';
    for (var i=0; i<string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;
}

/**
 * Export to other file
 * @type {Object}
 */
exports.init = function(){
    return {
        isFunction : isFunction,
        isDefined : isDefined,
        isUnDefined : isUnDefined,
        isNumber : isNumber,
        md5 : md5,
        saltAndHash : saltAndHash,
        validatePassword : validatePassword,
        validateEmail : validateEmail,
        addslashes : addslashes,
        stripslashes : stripslashes,
        stripSlashesRecursive : stripSlashesRecursive,
        addSlashesRecursive : addSlashesRecursive,
        isString : isString,
        isObject : isObject,
        extend : extend,
        cleanUrl : cleanUrl,
        validateMongoObjectId : validateMongoObjectId,
        strip_tags : strip_tags,
        stripTagsRecursive : stripTagsRecursive,
        generateString : generateString
    };
}