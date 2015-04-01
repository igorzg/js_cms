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
     * @method HomeController#before_each
     *
     * @description
     * Before each
     * @return {*|string}
     */
    beforeEach: function (action, params) {
        var html = this.getCache(this.getRequestUrl());
        if (!!html) {
            this.stopChain();
            return html;
        }
        return this._super(action, params);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HomeController#afterEach
     *
     * @description
     * Before index get menu and some data
     * @return {*|string}
     */
    afterEach: function ViewController_afterEach(action, params, html) {
        this.setCache(this.getRequestUrl(), html);
        return html;
    },
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
        return articleModel.find().sort({created: -1}).limit(10).exec();
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
        this.locals.articles = data;
        return this.renderFile('home/index', this.locals);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HomeController#before_article
     *
     * @description
     * Before article get data
     * @return {*|string}
     */
    before_article: function HomeController_before_article(params) {
        return articleModel.findOne({id: params.route.type_id}).exec().then(function (article) {
            this.locals.article = article;
            return categoriesModel.findOne({id: article.category}).exec().then(function (category) {
                this.locals.category = category;
            }.bind(this));
        }.bind(this));
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HomeController#action_article
     *
     * @description
     * Show article
     * @return {*|string}
     */
    action_article: function HomeController_article(params) {

        this.locals.breadcrumbs.push({
            url: this.createUrl('home/index'),
            label: this.translate('Home')
        });

        this.locals.breadcrumbs.push({
            url: this.getRoute(this.locals.category.id, 'category'),
            label: this.locals.category.title
        });

        this.locals.breadcrumbs.push({
            label: this.locals.article.title
        });

        this.locals.metaTitle = this.locals.article.meta_title;
        this.locals.metaDesc = this.locals.article.meta_description;

        return this.renderFile('home/content', this.locals);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HomeController#before_category
     *
     * @description
     * Before category
     * @return {*|string}
     */
    before_category: function HomeController_category(params) {
        return Promise.all([
            categoriesModel.findOne({id: params.route.type_id}).exec(),
            articleModel.find({category: params.route.type_id}).sort({created: -1}).limit(10).exec()
        ])
            .then(function (data) {
                this.locals.category = data.shift();
                this.locals.articles = data.shift();
            }.bind(this));
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HomeController#action_article
     *
     * @description
     * Show article
     * @return {*|string}
     */
    action_category: function HomeController_category() {


        this.locals.breadcrumbs.push({
            url: this.createUrl('home/index'),
            label: this.translate('Home')
        });

        this.locals.breadcrumbs.push({
            label: this.locals.category.title
        });

        this.locals.metaTitle = this.locals.category.meta_title;
        this.locals.metaDesc = this.locals.category.meta_description;

        return this.renderFile('home/index', this.locals);
    }


});


module.exports = HomeController;