
/**!
 * Developed by : Igor Ivanovic
 * User: igor
 * Date: 1/23/13
 * Time: 11:18 AM
 * @copyright : Igor Ivanovic
 * https://github.com/igorzg/js-profiler
 */


if ( !Array.prototype.forEach ) {
    Array.prototype.forEach = function(fn, scope) {
        for(var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope, this[i], i, this);
        }
    }
}

if( !Function.prototype.method ){
    Function.prototype.method = function(n,c){
        this.prototype[n] = c;
    }
}

if( !Object.size ){
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)){
                size += 1;
            }
        }
        return size;
    }
};

/**
 * Logging
 * @constructor
 */
function Profiler(config){

    /**
     * if otherwise this will be global object
     */
    if (!(this instanceof Profiler)) {
        throw new Error("Profiler must be constructed");
    }
    /**
     * Extend data
     */
    var extend = function(s,d){
        var n = {};
        for(var i in s){
            if( d !== undefined && d.hasOwnProperty(i)){
                n[i] = d[i];
            }else{
                n[i] = s[i];
            }
        }
        return n;
    }
    /**
     * Settings
     */
    var settings = extend({
        debug : true,
        trace : true,
        displayHistory : false,
        loggingCurrentLog : false,
        displayOnlyExecutionTime : false
    },config);

    /**
     * Debugging
     */
    this.debug = settings.debug;
    /**
     * Tracing
     */
    this.tracing =  settings.trace;
    /**
     * Display history
     */
    this.displayHistory = settings.displayHistory;
    /**
     * Logging current log
     */
    this.loggingCurrentLog = settings.loggingCurrentLog;

    /**
     * Display Only exectuion time
     */
    this.displayOnlyExecutionTime = settings.displayOnlyExecutionTime;


    /**
     * Random Id
     */
    this.generateId = function(string_length){
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        var randomstring = '';
        for (var i=0; i<string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    }


    /**
     * History
     */
    this.history = [];
    this.id = this.generateId(40);
    this.name = "";
    this.startTime = 0;
    this.endTime = 0;
    this.excludeTraceNames = [];
    this.currentLog = {
        end : null,
        start : null,
        log : null,
        execution : null,
        info : null,
        id : null,
        executionTime : 0
    };
}

/**
 * Check if trace is excluded from tracing
 */
Profiler.method("isExcluded",function(){

    if( this.debug  === false ){
        return true;
    }

    var len = this.excludeTraceNames.length, i, current, pattern;
    for(i = 0; i < len; ++i){
        pattern = new RegExp(this.excludeTraceNames[i],"g");
        if(pattern.test(this.name)){
            return true;
        }
    }

    return false;
});

/**
 * Exclude traces
 */
Profiler.method("exclude",function(n){
    if(Object.prototype.toString.call(n) === '[object Array]'){
        this.excludeTraceNames = n;
    }
    return this;
});


/**
 * Set trace name
 */
Profiler.method("startTracing",function(name){
    if( name === undefined ){
        throw new Error("Property name is  required");
    }
    this.setName(name);
    this.start();
    return this;
});


/**
 * Set trace name
 */
Profiler.method("endTracing",function(name,trace){
    if( name === undefined || trace === undefined ){
        throw new Error("Properties name and treace are required");
    }
    this.setName(name);
    this.trace(trace);
    this.end();
    return this;
});

/**
 * Set trace name
 */
Profiler.method("setName",function(n){
    this.name = n;
    return this;
});

/**
 * Start profile
 */
Profiler.method("start",function(n){
    if( !this.isExcluded() ){



        this.id = this.generateId(40);
        this.currentLog.id = this.id;
        this.startTime = new Date();
        this.currentLog.start = "START TIME: " + this.startTime.getUTCHours() + ":" + this.startTime.getUTCMinutes() + ":" + this.startTime.getUTCSeconds()  + " - " + this.startTime.getUTCMilliseconds() + "ms";
        if( this.displayOnlyExecutionTime === false ){
            console.log(this.name +" "+ this.currentLog.start);
        }
    }
    return this;
});

/**
 * Trace data
 */
Profiler.method("trace",function(o){
    if( !this.isExcluded() ){
        this.log(o);
        if( this.tracing === true && console.trace  && this.displayOnlyExecutionTime === false){
            console.trace(o);
        }
    }
    return this;
});

/**
 * Log data
 */
Profiler.method("log",function(o){
    if( !this.isExcluded() ){
        this.currentLog.info = this.name;
        this.currentLog.log = o;
        if(  this.displayOnlyExecutionTime === false ){
            console.log(this.currentLog.log);
        }
    }
    return this;
});

/**
 * End profile
 */
Profiler.method("end",function(n){
    if( !this.isExcluded() ){
        this.endTime = new Date();
        var profiler = (this.endTime.getTime() - this.startTime.getTime());

        this.currentLog.execution = "EXECUTION ID:"+this.id+ ", EXECUTION TIME:"+profiler+"ms";
        this.currentLog.end = "END TIME: " + this.endTime.getUTCHours() + ":" + this.endTime.getUTCMinutes() + ":" + this.endTime.getUTCSeconds()  + " - " + this.endTime.getUTCMilliseconds() + "ms";
        this.currentLog.executionTime = profiler;

        if( this.loggingCurrentLog && this.displayOnlyExecutionTime === false ){
            console.log(this.currentLog);
        }

        console.log(this.name +" EXECUTION TIME: "+profiler+" ms");

        if( this.displayOnlyExecutionTime === false ){
            console.log(this.name +" "+ this.currentLog.execution);
            console.log(this.name +" "+ this.currentLog.end);
            this.history.push(this.currentLog);
            if(this.displayHistory){
                console.log(this.history);
            }
        }


    }

    return this;
});

/**
 * Returns history
 */
Profiler.method("getHistory", function(){
    return this.history;
});

/***
 * Initialize profiler
 * @return {Profiler}
 */
exports.init = function(){
    /**
     * Construct
     * @type {Profiler}
     */
    var profiler =  new Profiler({
        debug : true,
        trace : false,
        displayHistory : false,
        loggingCurrentLog : false,
        displayOnlyExecutionTime : false
    });

    /**
     * Exclude logs
     */
    profiler.exclude([
        "Model",
        "SessionModel.getByID",
        "HomeController",
        "Controller"
    ]);
    /**
     * Return
     */
    return profiler;
}
