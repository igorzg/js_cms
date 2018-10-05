var di = require('mvcjs'), // mvcjs as node package
    CoreController = di.load('@{module_admin}/controllers/core'),
    usersModel = di.load('@{modelsPath}/users'),
    AuthController;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name AuthController
 *
 * @constructor
 * @description
 * Auth controller is responsibler for user session
 */
AuthController = CoreController.inherit({}, {
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
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method AuthController#action_logout
     *
     * @description
     * login
     * @return {*|string}
     */
    action_logout: function AuthController_action_logout() {
        this.logout();
        return this.redirect(this.createUrl('admin/auth/login'));
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method AuthController#before_login
     *
     * @description
     * Check data
     * @return {*|string}
     */
    before_login: function () {
        var body;
        if (this.getMethod() === 'POST') {
            body = this.getParsedBody();
            if (!body.username) {
                this.locals.errors.push(this.translate('Please provide your username!'));
            }
            if (!body.password) {
                this.locals.errors.push(this.translate('Please provide your password!'));
            }

            this.locals.post = body;

            if (this.locals.errors.length === 0) {
                return usersModel.getUser(body.username, body.password).then(function (data) {
                    if (!data) {
                        this.locals.errors.push(this.translate('Please verify your credentials!'));
                    } else {
                        this.setUser(data.id);
                        return this.redirect(this.createUrl('admin/home/index'));
                    }
                }.bind(this));
            }
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method AuthController#action_login
     *
     * @description
     * login
     * @return {*|string}
     */
    action_login: function AuthController_action_login() {
        return this.renderFile('auth/login', this.locals);
    }
});


module.exports = AuthController;