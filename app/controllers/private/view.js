"use strict";
var di = require('mvcjs'), // mvcjs as node package
    Type = di.load('typejs'),
    CoreController = di.load('@{controllersPath}/private/core'),
    categoriesModel = di.load('@{modelsPath}/categories'),
    routerModel = di.load('@{modelsPath}/router'),
    ViewController;


/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name ViewController
 *
 * @constructor
 * @description
 * View controller
 */
ViewController = CoreController.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HomeController#beforeEach
     *
     * @description
     * Before index get menu and some data
     * @return {*|string}
     */
    beforeEach: function ViewController_beforeEach(action, params) {
        return this._super(action, params).then(function () {


            this.locals.scripts.push({
                href: this.assetsPath('/vendor/bootstrap/dist/css/bootstrap.min.css'),
                type: "css"
            });

            this.locals.scripts.push({
                href: this.assetsPath('/css/main.css'),
                type: "css"
            });

            this.locals.scripts.push({
                src: this.assetsPath('/vendor/jquery/dist/jquery.min.js'),
                position: "body_bottom",
                type: "javascript"
            });

            this.locals.scripts.push({
                src: this.assetsPath('/vendor/bootstrap/dist/js/bootstrap.min.js'),
                position: "body_bottom",
                type: "javascript"
            });

            return Promise.all([
                routerModel.find().exec(),
                categoriesModel.find().exec()
            ]).then(function (data) {
                this.routes = data.shift();
                this.locals.categories = data.shift();
            }.bind(this))
        }.bind(this));
    }
});


module.exports = ViewController;


