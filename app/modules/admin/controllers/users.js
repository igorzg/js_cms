"use strict";
var di = require('mvcjs'), // mvcjs as node package
    CoreController = di.load('@{module_admin}/controllers/core'),
    usersModel = di.load('@{modelsPath}/users'),
    UsersController;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name UsersController
 *
 * @constructor
 * @description
 * Home controller is responsible for home actions
 */
UsersController = CoreController.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method UsersController#action_remove
     *
     * @description
     * Remove by id
     * @return {*|string}
     */
    action_delete: function (params) {
        return this.getUser().then(function (user) {
            if (user.id === parseInt(params.id)) {
                this.setSession('flashMessage', 'Deleting current user is not allowed!');
            } else {
                return usersModel.removeById(params.id);
            }
        }.bind(this))
            .then(function () {
                return this.redirect(this.createUrl('admin/users/list', {page: params.page}), true);
            }.bind(this))
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method UsersController#before_list
     *
     * @description
     * Before list get all data
     * @return {*|string}
     */
    before_add: function UsersController_before_add(params) {

        var body, data;
        if (this.getMethod() === 'POST') {
            body = this.getParsedBody();

            if (!body.username) {
                this.locals.errors.push(this.translate('Please provide your username!'));
            } else if (body.username.length < 5) {
                this.locals.errors.push(this.translate('Your username must be at least 6 characters long'));
            }

            if (!body.type) {
                this.locals.errors.push(this.translate('Please provide user type'));
            }

            if (!!body.new_password && body.new_password.length < 5) {
                this.locals.errors.push(this.translate('Your password must be at least 6 characters long'));
            }

            this.locals.post = body;

            if (this.locals.errors.length > 0) {
                return true;
            }

            data = {
                username: body.username,
                type: body.type
            };

            if (body.new_password) {
                data.password = this.md5(body.new_password);
            }

            if (!!params.id) {
                return usersModel.update(params.id, data)
                    .then(function () {
                        return this.redirect(this.createUrl('admin/users/list', {page: params.page}), true);
                    }.bind(this));
            }

            return usersModel.save(data)
                .then(function () {
                    return this.redirect(this.createUrl('admin/users/list', {page: params.page}), true);
                }.bind(this))
                .catch(function (error) {
                    if (error.stack.indexOf('insertDocument') > -1) {
                        this.locals.errors.push(this.translate('Record exists'));
                    }
                    console.error(error.stack);
                }.bind(this));
        }


        if (params.id) {
            return usersModel.findById(params.id)
                .then(function (data) {
                    this.locals.post = data;
                }.bind(this));
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method UsersController#action_index
     *
     * @description
     * Index action request
     * @return {*|string}
     */
    action_add: function UsersController_action_add(params) {

        this.locals.params = params;
        this.locals.types = [
            {
                key: 'admin',
                value: this.translate('Admin')
            },
            {
                key: 'editor',
                value: this.translate('Editor')
            },
            {
                key: 'view',
                value: this.translate('View')
            }
        ];
        this.locals.submenu.push({
            href: this.createUrl('admin/users/list', {page: params.page}),
            label: this.translate('List')
        });

        return this.renderFile('users/add', this.locals);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method UsersController#before_list
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
            return this.redirect(this.createUrl('admin/users/list'), true);
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
            usersModel.find().sort({id: -1}).limit(limit).skip(skip).exec(),
            usersModel.count().exec()
        ]).then(function (models) {
            var data = models.shift(), i;
            p.count = models.shift();
            p.maxPages = Math.ceil(p.count / limit);

            if (page > p.maxPages) {
                return this.redirect(this.createUrl('admin/users/list', {page: p.maxPages}), true);
            }

            if (p.page < p.maxPages) {
                p.next = this.createUrl('admin/users/list', {page: p.page + 1});
            }

            if (p.page > 1) {
                p.prev = this.createUrl('admin/users/list', {page: p.page - 1});
            }

            i = 1;
            while (i <= p.maxPages) {
                p.pages.push({
                    href: this.createUrl('admin/users/list', {page: i}),
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
     * @method UsersController#action_index
     *
     * @description
     * Index action request
     * @return {*|string}
     */
    action_list: function UsersController_action_list(params, data) {
        this.locals.submenu.push({
            href: this.createUrl('admin/users/add', {page: params.page}),
            label: this.translate('Add')
        });
        this.locals.data = data;
        return this.renderFile('users/list', this.locals);
    }
});


module.exports = UsersController;