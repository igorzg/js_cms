var di = require('mvcjs'), // mvcjs as node package
    CoreController = di.load('@{module_admin}/controllers/core'),
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
     * @method HomeController#action_index
     *
     * @description
     * Index action request
     * @return {*|string}
     */
    action_index: function HomeController_action_index() {
        return this.renderFile('home/index', this.locals);
    }
});


module.exports = HomeController;