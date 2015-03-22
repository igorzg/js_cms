"use strict";
var di = require('mvcjs'), // mvcjs as node package
    CoreController = di.load('@{controllersPath}/private/core'),
    userModel = di.load('@{modelsPath}/users'),
    component = di.load('core/component'),
    params = component.get('params'),
    InstallController;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name InstallController
 *
 * @constructor
 * @description
 * Home controller is responsible for home actions
 */
InstallController = CoreController.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method AuthController#_construct
     *
     * @description
     * Extend locals or refresh errors
     * @return {*|string}
     */
    _construct: function () {
        this._super();
        this.locals.errors = [];

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

    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method InstallController#before_index
     *
     * @description
     * Install data
     * @return {*|string}
     */
    before_index: function InstallController_before_index() {
        var body;

        if (params.has("installed")) {
            return this.redirect(this.createUrl('home/index'));
        }else if (this.getMethod() === 'POST') {
            body = this.getParsedBody();
            if (!body.username) {
                this.locals.errors.push(this.translate('Please provide your username!'));
            } else if (body.username.length < 5) {
                this.locals.errors.push(this.translate('Your username must be at least 6 characters long'));
            }
            if (!body.password) {
                this.locals.errors.push(this.translate('Please provide your password!'));
            } else if (body.password.length < 5) {
                this.locals.errors.push(this.translate('Your password must be at least 6 characters long'));
            }
            if (!body.cipher) {
                this.locals.errors.push(this.translate('Please provide your cipher for encryption!'));
            } else if (body.cipher.length < 10) {
                this.locals.errors.push(this.translate('Your password must be at least 10 characters long'));
            }
            if (!body.email_server) {
                this.locals.errors.push(this.translate('Please provide your email server domain or ip!'));
            }
            if (!body.email_username) {
                this.locals.errors.push(this.translate('Please provide your email username!'));
            }
            if (!body.email_password) {
                this.locals.errors.push(this.translate('Please provide your email password!'));
            }

            if (!body.iso_locale) {
                this.locals.errors.push(this.translate('Please provide your iso locale!'));
            }



            this.locals.post = body;

            if (this.locals.errors.length === 0) {
                return userModel.addUser(body.username, body.password, 'admin').then(function () {
                    Object.keys(body).forEach(function (key) {
                        if (['username', 'password'].indexOf(key) === -1) {
                            params.set(key, body[key]);
                        }
                    });
                    params.set("installed", true);
                    params.save();
                    return this.redirect(this.createUrl('admin/home/index'));
                }.bind(this));
            }

        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method InstallController#action_index
     *
     * @description
     * Install data
     * @return {*|string}
     */
    action_index: function InstallController_install() {
        return this.renderFile('install/index', this.locals);
    }

});


module.exports = InstallController;