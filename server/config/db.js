/**
 * File:
 * User: igorivanovic
 * Date: 1/19/13
 * Time: 10:58 PM
 * @copyright : Igor Ivanovic
 */
var assert = require('assert');
var config =  {
    db : require('mongodb').Db,
    server : require('mongodb').Server,
    port : 27017,
    host : 'localhost',
    dbname : 'YOUR_DATABASE_NAME',
    dbuser : "YOUR_DATABASE_USER",
    dbpass : "YOUR_DATABASE_PASSWORD"
};

/* establish the database connection */

var db = new config.db(config.dbname, new config.server(config.host, config.port, {auto_reconnect: true}), {w:1});



/**
 * Open connection
 */
db.open(function(e, db){
    if (e) {
        console.log(e);
    }else{

        db.authenticate(config.dbuser, config.dbpass, function(err, result) {
            if(e){
                db.close();
                console.log(e);
            }else{
                if( result ){
                    console.log({
                        method : "authenticate",
                        result : result,
                        error : err,
                        message : 'connected to database : ' + config.dbname
                    });
                }else{
                    console.log('Please verify your credentials for database: ' + config.dbname);
                    db.close();
                }
            }
        });

    }
});


/**
 * Exports db to other file
 * @type {config.db}
 */
exports.init = function(){
    return db;
};