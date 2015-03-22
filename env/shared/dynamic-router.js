var di = require('mvcjs'),
    RouteRuleInterface = di.load('interface/routeRule'),
    routerModel = di.load('@{modelsPath}/router'),
    Promise = di.load('promise'),
    Router;

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Router
 * @constructor
 * @description
 * Router is used by mvcjs to handle dynamic routing
 */
Router = RouteRuleInterface.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method MenuRoute#parseRequest
     *
     * @description
     * Parse current request, if is found is db and there is route filled then return route
     * otherwise return false
     * @return {object} Promise
     */
    parseRequest: function (method, route) {
        return new Promise(function (resolve) {
            routerModel.findOne({url: route.pathname}, function (err, data) {
                if (!!data) {
                    route.query.route = data;
                    switch (data.type) {
                        case 'article':
                            resolve(['home/article', route.query]);
                            break;
                        case 'category':
                            resolve(['home/category', route.query]);
                            break;
                    }

                } else {
                    resolve(false);
                }
            });
        });
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method MenuRoute#createUrl
     *
     * @description
     * Create dynamic url
     * @return {string|boolean}
     */
    createUrl: function (route, params) {
        if (route === 'home/content') { // match route
            if (params.link) {
                return params.link; // return custom link from params
            }
        }
        return false;
    }
});


module.exports = Router;






