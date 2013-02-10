/**
 * File:
 * User: igorivanovic
 * Date: 2/10/13
 * Time: 10:10 PM
 * @copyright : Igor Ivanovic
 */
var email   = require("emailjs/email");
/**
 * Email server data
 * @type {*}
 */
var server  = email.server.connect({
    user:    "youremail@email.com",
    password:"YOUR_EMAIL_PASSWORD",
    host:    "YOUR_EMAIL_SERVER",
    ssl:     false
});

/**
 * Init
 * @return {*}
 */
exports.init = function(){
    return server;
}