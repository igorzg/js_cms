"use strict";
var di = require('mvcjs'), // mvcjs as node package
    Type = di.load('typejs'),
    Promise = di.load('promise'),
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

        if (Type.isObject(params.route)) {
            this.locals.robots.index = params.route.index;
            this.locals.robots.follow = params.route.follow;
        }

        return this._super(action, params).then(function () {


            this.locals.scripts.push({
                href: this.assetsPath('/css/main.css'),
                type: "css"
            });

            this.locals.scripts.push({
                src: this.assetsPath('/vendor/zepto-full/zepto.min.js'),
                position: "body_bottom",
                type: "javascript"
            });

            this.locals.scripts.push({
                src: this.assetsPath('/js/index.js'),
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


