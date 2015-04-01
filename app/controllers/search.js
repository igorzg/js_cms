"use strict";
var di = require('mvcjs'), // mvcjs as node package
    CoreController = di.load('@{controllersPath}/private/view'),
    categoriesModel = di.load('@{modelsPath}/categories'),
    articleModel = di.load('@{modelsPath}/articles'),
    HomeController;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name HomeController
 *
 * @constructor
 * @description
 * Home controller is responsible for home actions
 */
HomeController = CoreController.inherit({}, {


    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HomeController#before_index
     *
     * @description
     * Before index
     * @return {*|string}
     */
    before_index: function HomeController_before_index(params) {
        var page =  parseInt(params.page),
            size = 10;

        this.locals.robots = {
            index: false,
            follow: true
        };

        this.locals.page = isNaN(page) ? 1 : page;
        this.locals.pageSize = size;
        return Promise.all([
            articleModel.find({
                title : new RegExp(params.query, 'ig')
            }).sort({created: -1}).limit(size).exec(),
            articleModel.count({
                title : new RegExp(params.query, 'ig')
            }).exec()
        ]);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HomeController#action_index
     *
     * @description
     * Index action
     * @return {*|string}
     */
    action_index: function HomeController_index(params, data) {
        var count;
        this.locals.articles = data.shift();
        this.locals.count = data.shift();
        count =  Math.floor(this.locals.count / this.locals.pageSize);

        this.locals.numOfPages = count > 0 ? count : 1;

        return this.renderFile('home/search', this.locals);
    }

});


module.exports = HomeController;