"use strict";
var di = require('mvcjs'), // mvcjs as node package
    ViewController = di.load('@{controllersPath}/private/view'),
    Type = di.load('typejs'),
    ErrorController;


ErrorController = ViewController.inherit({}, {

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#action_error
     *
     * @description
     * Error handler for application
     * @return {*|string}
     */
    action_index: function CoreController_action_index(params) {
        var e = params.exception.toString();
        e += '\n ROUTE: ' + JSON.stringify(this.getParsedUrl(), null, '\t');
        this.locals.error = e;
        return this.renderFile('error/error', this.locals);
    }

});


module.exports = ErrorController;