"use strict";
var di = require('mvcjs'), // mvcjs as node package
    Type = di.load('typejs'),
    CoreController = di.load('@{controllersPath}/private/core'),
    usersModel = di.load('@{modelsPath}/users'),
    CoreAdminController;


/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name CoreAdminController
 *
 * @constructor
 * @description
 * Core admin controller, all admin modules are inherited from core controller
 */
CoreAdminController = CoreController.inherit({
    userSessioninDays: Type.NUMBER,
    userSessioninTime: Type.NUMBER
}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreAdminController#normalizeUrl
     *
     * @description
     * Normalize url
     * @return {*|string}
     */
    normalizeUrl: function CoreAdminController_normalizeUrl(value) {
        if (Type.isString(value)) {
            return value.toLowerCase().replace(/\s/g, '-').replace(/[^\w]/g, '');
        }
        return value;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreAdminController#getUser
     *
     * @description
     * Get current user
     * @return {*|string}
     */
    getUser: function CoreAdminController_getUser() {
        var cookies = this.getCookies(),
            id = parseInt(this.decrypt(cookies.mv_user_id));
        if (isNaN(id)) {
            id = -1;
        }
        return usersModel.getUserById(id);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreAdminController#isLoggedIn
     *
     * @description
     * Check if user is logged in
     * @return {*|string}
     */
    isLoggedIn: function CoreAdminController_isLoggedIn() {
        var cookies = this.getCookies(),
            id = parseInt(this.decrypt(cookies.mv_user_id)),
            time = parseInt(this.decrypt(cookies.mv_user_time)),
            t1 = new Date(),
            t2 = new Date(time),
            t3 = (t2 - t1) / (60 * 60 * 24 * 1000);

        if (100 - ((t3 * 100) / this.userSessioninDays) > 1) {
            this.setUserTime(new Date(time + (60 * 60 * 3 * 1000)));
        }
        return !!id && !!time && t3 > 0;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreAdminController#setUserTime
     *
     * @description
     * Set user time
     * @return {*|string}
     */
    setUserTime: function CoreAdminController_setUserTime(date) {
        this.setCookie("mv_user_time", this.encrypt(date.getTime() + this.userSessioninTime), this.userSessioninDays);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreAdminController#setUser
     *
     * @description
     * Set user in system
     * @return {*|string}
     */
    setUser: function CoreAdminController_setUser(id) {
        if (!this.isLoggedIn()) {
            this.setCookie("mv_user_id", this.encrypt(id), this.userSessioninDays);
            this.setUserTime(new Date);
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreAdminController#logout
     *
     * @description
     * Logout user
     * @return {*|string}
     */
    logout: function CoreAdminController_logout() {
        this.setCookie("mv_user_id", "delete", -1);
        this.setCookie("mv_user_time", "delete", -1);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreAdminController#beforeEach
     *
     * @description
     * Check user login
     * @return {*|string}
     */
    beforeEach: function CoreAdminController_beforeEach(action, params) {

        return this._super(action, params).then(function () {
            var controller = this.getControllerName(),
                action = this.getActionName(),
                route = controller + '/' + action,
                restrict = ['delete', 'deleteimage'];

            this.locals.scripts.push({
                href: this.assetsPath('/vendor/bootstrap/dist/css/bootstrap.min.css'),
                type: "css"
            });


            this.locals.scripts.push({
                href: this.assetsPath('/css/admin.css'),
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

            this.locals.scripts.push({
                src: this.assetsPath('/vendor/tinymce/jquery.tinymce.min.js'),
                position: "body_bottom",
                type: "javascript"
            });

            this.locals.scripts.push({
                src: this.assetsPath('/js/admin.js'),
                position: "body_bottom",
                type: "javascript"
            });

            this.locals.message = this.getSession('flashMessage');

            if (route === 'auth/login') {
                if (this.isLoggedIn()) {
                    return this.redirect(this.createUrl('admin/home/index'));
                }
            } else if (!this.isLoggedIn() && route !== 'auth/logout') {
                return this.redirect(this.createUrl('admin/auth/login'));
            } else  if (this.isLoggedIn()) {
                return this.getUser().then(function (data) {
                    if (data && data.id) {
                        this.setUser(data.id);
                        if ((this.getMethod() === 'POST' || restrict.indexOf(action) > -1) && data.type === 'view') {
                            this.setSession('flashMessage', 'This user can only view data');
                            return this.redirect(this.createUrl('admin/' + this.getControllerName() + '/list'), true);
                        }
                    } else {
                        this.logout();
                        return this.redirect(this.createUrl('admin/auth/login'));
                    }
                }.bind(this));
            }
        }.bind(this))
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreAdminController#afterEach
     *
     * @description
     * Constructor of
     * @return {*|string}
     */
    afterEach: function CoreAdminController_afterEach(action, params, html) {
        if (!!this.locals.message) {
            this.removeSession('flashMessage');
        }
        return html;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreAdminController#_construct
     *
     * @description
     * Constructor of
     * @return {*|string}
     */
    _construct: function CoreAdminController_construct() {
        this._super();
        this.userSessioninDays = 14;
        this.userSessioninTime = 60 * 60 * 24 * 1000 * this.userSessioninDays;
        this.locals.scripts = [];
        this.locals.isLoggedin = this.isLoggedIn();
        this.locals.submenu = [];
        this.locals.errors = [];
        this.locals.menu.push(
            {
                label: this.translate('Home'),
                href: this.createUrl('admin/home/index'),
                icon: 'glyphicon glyphicon-home'
            },
            {
                label: this.translate('Categories'),
                href: this.createUrl('admin/categories/list'),
                icon: 'glyphicon glyphicon-folder-open'
            },
            {
                label: this.translate('Articles'),
                href: this.createUrl('admin/articles/list'),
                icon: 'glyphicon glyphicon-list'
            },
            {
                label: this.translate('Users'),
                href: this.createUrl('admin/users/list'),
                icon: 'glyphicon glyphicon-user'
            },
            {
                label: this.translate('Router'),
                href: this.createUrl('admin/router/list'),
                icon: 'glyphicon glyphicon-list'
            },
            {
                label: this.translate('Logout'),
                href: this.createUrl('admin/auth/logout'),
                icon: 'glyphicon glyphicon-off'
            }
        );
    }
});


module.exports = CoreAdminController;


