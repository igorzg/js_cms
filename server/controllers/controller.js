/**
 * File:
 * User: igorivanovic
 * Date: 1/20/13
 * Time: 12:34 PM
 * @copyright : Igor Ivanovic
 */
function Controller(){
    this.routePrefix = "";
    this.exports = {};
    this.routes = [];
}

/**
 * Retrun routes
 * @return {Array}
 */
Controller.prototype.getExports = function(v){
    if(v !== undefined){
        if(this.exports.hasOwnProperty(v)){
            return this.exports[v];
        }
    }
    return this.exports;
}

/**
 * Retrun routes
 * @return {Array}
 */
Controller.prototype.watch = function(callback,time){

    var interval = null;

    var internal = function(){
        interval = setInterval(function(){
            internal();
            callback();
        },time);
    }

    internal();

    return interval;

}

/**
 * Retrun routes
 * @return {Array}
 */
Controller.prototype.setExports = function(v){
    return this.exports = v;
}

/**
 * Set route
 * @param type
 * @param url
 * @param callback
 */
Controller.prototype.setRoutePrefix = function(prefix){
    this.routePrefix = prefix;
}


/**
 * Retrun routes
 * @return {Array}
 */
Controller.prototype.getRoutes = function(){
    return this.routes;
}

/**
 * Set route
 * @param type
 * @param url
 * @param callback
 */
Controller.prototype.getRoutesByUrl = function(url){

    var purl = this.routePrefix + url,
        routes = [],
        current;

    /**
     * Foreach routes
     */
    this.routes.forEach(function(val){
        if(val.url === purl){
           routes.push(current);
        }
    });

    /**
     * Routes length
     */
    if( routes.length === 1 ){
        return routes[0];
    }

    return routes;
}


/**
 * Set route
 * @param type
 * @param url
 * @param callback
 */
Controller.prototype.setRoute = function(type,url,callback){
    var self = this;
    this.routes.push({
        type : type,
        url : self.routePrefix + url,
        callback : callback
    });
}

/**
 * Set route
 * @param type
 * @param url
 * @param callback
 */
Controller.prototype.compileRoutes = function(app){
    /**
     * Foreach routes
     */
    this.routes.forEach(function(val){
        switch(val.type){
            case "get":
                app.get(val.url,val.callback);
                break;
            case "post":
                app.post(val.url,val.callback);
                break;
            case "all":
                app.all(val.url,val.callback);
                break;

        }
    });
}

/**
 * Export controller
 * @type {Function}
 */
exports.init = function(){
    return new Controller();
};