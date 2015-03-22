"use strict";
var di = require('mvcjs'), // mvcjs as node package
    CoreController = di.load('@{module_admin}/controllers/core'),
    categoriesModel = di.load('@{modelsPath}/categories'),
    routerModel = di.load('@{modelsPath}/router'),
    CategoriesController;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name CategoriesController
 *
 * @constructor
 * @description
 * Home controller is responsible for home actions
 */
CategoriesController = CoreController.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CategoriesController#action_remove
     *
     * @description
     * Remove by id
     * @return {*|string}
     */
    action_delete: function (params) {
        return categoriesModel.removeById(params.id).then(function () {
            return routerModel.removeByTypeId(params.id, 'category');
        }.bind(this))
            .then(function () {
                return this.redirect(this.createUrl('admin/categories/list'), true);
            }.bind(this))
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CategoriesController#before_list
     *
     * @description
     * Before list get all data
     * @return {*|string}
     */
    before_add: function CategoriesController_before_add(params) {

        var body, data;
        if (this.getMethod() === 'POST') {
            body = this.getParsedBody();

            if (!body.meta_title) {
                this.locals.errors.push(this.translate('You must define meta title'));
            }

            if (!body.meta_description) {
                this.locals.errors.push(this.translate('You must define meta description'));
            }

            if (!body.title) {
                this.locals.errors.push(this.translate('You must define title'));
            }

            if (!body.short_description) {
                this.locals.errors.push(this.translate('You must define short description'));
            }

            if (!body.description) {
                this.locals.errors.push(this.translate('You must define description'));
            }

            this.locals.post = body;

            if (this.locals.errors.length > 0) {
                return true;
            }

            data = {
                url: '/' + this.normalizeUrl(body.title),
                meta_title: body.meta_title,
                meta_description: body.meta_description,
                title: body.title,
                short_description: body.short_description,
                description: body.description
            };

            if (!!params.id) {
                return categoriesModel.update(params.id, data)
                    .then(function () {
                        return this.redirect(this.createUrl('admin/categories/list'), true);
                    }.bind(this));
            }

            return categoriesModel.save(data)
                .then(function () {
                    return this.redirect(this.createUrl('admin/categories/list'), true);
                }.bind(this))
                .catch(function (error) {
                    if (error.stack.indexOf('insertDocument') > -1) {
                        this.locals.errors.push(this.translate('Record exists'));
                    }
                }.bind(this));
        }


        if (params.id) {
            return categoriesModel.findById(params.id)
                .then(function (data) {
                    this.locals.post = data;
                }.bind(this));
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CategoriesController#action_index
     *
     * @description
     * Index action request
     * @return {*|string}
     */
    action_add: function CategoriesController_action_add(params) {

        this.locals.params = params;
        this.locals.submenu.push({
            href: this.createUrl('admin/categories/list'),
            label: this.translate('List')
        });

        return this.renderFile('categories/add', this.locals);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CategoriesController#before_list
     *
     * @description
     * Before list get all data
     * @return {*|string}
     */
    before_list: function () {
        return categoriesModel.find().sort({id: -1}).exec();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CategoriesController#action_index
     *
     * @description
     * Index action request
     * @return {*|string}
     */
    action_list: function CategoriesController_action_list(params, data) {
        this.locals.submenu.push({
            href: this.createUrl('admin/categories/add'),
            label: this.translate('Add')
        });
        this.locals.data = data;
        return this.renderFile('categories/list', this.locals);
    }
});


module.exports = CategoriesController;