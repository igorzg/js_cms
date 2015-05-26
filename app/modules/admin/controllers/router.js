"use strict";
var di = require('mvcjs'), // mvcjs as node package
    CoreController = di.load('@{module_admin}/controllers/core'),
    routerModel = di.load('@{modelsPath}/router'),
    Promise = di.load('promise'),
    RouterController;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name RouterController
 *
 * @constructor
 * @description
 * Home controller is responsible for home actions
 */
RouterController = CoreController.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RouterController#action_remove
     *
     * @description
     * Remove by id
     * @return {*|string}
     */
    action_delete: function (params) {
        return routerModel.removeById(params.id).then(function () {
            return this.redirect(this.createUrl('admin/router/list', {page: params.page}), true);
        }.bind(this))
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RouterController#before_list
     *
     * @description
     * Before list get all data
     * @return {*|string}
     */
    before_add: function RouterController_before_add(params) {

        var body, data;
        if (this.getMethod() === 'POST') {
            body = this.getParsedBody();

            if (!body.url) {
                this.locals.errors.push(this.translate('Please provide url!'));
            }

            if (!body.type) {
                this.locals.errors.push(this.translate('Please provide type'));
            }
            if (!body.type_id) {
                this.locals.errors.push(this.translate('Please provide type_id'));
            }

            this.locals.post = body;

            if (this.locals.errors.length > 0) {
                return true;
            }

            data = {
                url: body.url,
                type: body.type,
                type_id: body.type_id,
                index: !!body.index,
                follow: !!body.follow
            };

            if (!!params.id) {
                return routerModel.update(params.id, data)
                    .then(function () {
                        return this.redirect(this.createUrl('admin/router/list', {page: params.page}), true);
                    }.bind(this));
            }

            return routerModel.save(data)
                .then(function () {
                    return this.redirect(this.createUrl('admin/router/list', {page: params.page}), true);
                }.bind(this))
                .catch(function (error) {
                    if (error.stack.indexOf('insertDocument') > -1) {
                        this.locals.errors.push(this.translate('Record exists'));
                    }
                }.bind(this));
        }


        if (params.id) {
            return routerModel.findById(params.id)
                .then(function (data) {
                    this.locals.post = data;
                }.bind(this));
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RouterController#action_index
     *
     * @description
     * Index action request
     * @return {*|string}
     */
    action_add: function RouterController_action_add(params) {

        this.locals.params = params;
        this.locals.types = [
            {
                key: 'category',
                value: this.translate('Category')
            },
            {
                key: 'article',
                value: this.translate('Article')
            }
        ];
        this.locals.submenu.push({
            href: this.createUrl('admin/router/list', {page: params.page}),
            label: this.translate('List')
        });

        return this.renderFile('router/add', this.locals);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RouterController#before_list
     *
     * @description
     * Before list get all data
     * @return {*|string}
     */
    before_list: function (params) {
        var limit = parseInt(params.limit) || 10,
            page = parseInt(params.page) || 1,
            skip = 0,
            p;

        if (params.page === '1') {
            return this.redirect(this.createUrl('admin/router/list'), true);
        }

        if (page > 1) {
            skip = limit * (page - 1);
        }

        p = {
            limit: limit,
            page: page,
            skip: skip,
            count: 0,
            maxPages: 0,
            pages: [],
            next: null,
            prev: null
        };

        return Promise.all([
            routerModel.find().sort({id: -1}).limit(limit).skip(skip).exec(),
            routerModel.count().exec()
        ]).then(function (models) {
            var data = models.shift(), i;
            p.count = models.shift();
            p.maxPages = Math.ceil(p.count / limit);

            if (page > p.maxPages) {
                return this.redirect(this.createUrl('admin/router/list', {page: p.maxPages}), true);
            }

            if (p.page < p.maxPages) {
                p.next = this.createUrl('admin/router/list', {page: p.page + 1});
            }

            if (p.page > 1) {
                p.prev = this.createUrl('admin/router/list', {page: p.page - 1});
            }

            i = 1;
            while (i <= p.maxPages) {
                p.pages.push({
                    href: this.createUrl('admin/router/list', {page: i}),
                    active: i === page,
                    label: i
                });
                ++i;
            }

            this.locals.pagination = p;

            return data;
        }.bind(this));
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RouterController#action_index
     *
     * @description
     * Index action request
     * @return {*|string}
     */
    action_list: function RouterController_action_list(params, data) {
        this.locals.submenu.push({
            href: this.createUrl('admin/router/add', {page: params.page}),
            label: this.translate('Add')
        });
        this.locals.data = data;
        return this.renderFile('router/list', this.locals);
    }
});


module.exports = RouterController;