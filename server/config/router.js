/**
 * File:
 * User: igorivanovic
 * Date: 1/19/13
 * Time: 3:17 PM
 * @copyright : Igor Ivanovic
 */
var profiler = require('../profiler').init();
/**
 * Initialize controlelr
 * @param name
 * @param app
 */
function initControler(name,app,opts){
   return require('../controllers/'+name).init(app,opts);
}

/**
 * Export application
 * @param app
 */
module.exports = function(app){

    /**
     * Home controller data
     */
    var homeController = initControler('home',app);
    /**
     * Articles controller
     * @type {*}
     */
    var articlesController = initControler('articles',app);
    /**
     * Categories controller
     * @type {*}
     */
    var categoriesController = initControler('categories',app);

    /**
     * Users controller
     * @type {*}
     */
    var usersController = initControler('users',app);
    /**
     * Users controller
     * @type {*}
     */
    var publicController = initControler('public',app);
};