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
                return this.redirect(this.createUrl('admin/users/list'), true);
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
                        return this.redirect(this.createUrl('admin/users/list'), true);
                    }.bind(this));
            }

            return usersModel.save(data)
                .then(function () {
                    return this.redirect(this.createUrl('admin/users/list'), true);
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
            href: this.createUrl('admin/users/list'),
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
    before_list: function () {
        return usersModel.find().sort({id: -1}).exec()
            .then(function (data) {
                this.locals.data = data;
            }.bind(this))
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
            href: this.createUrl('admin/users/add'),
            label: this.translate('Add')
        });

        return this.renderFile('users/list', this.locals);
    }
});


module.exports = UsersController;