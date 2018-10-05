/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name router.js
 * @function
 * @description
 * Is used to do route configuration at bootstrap
 */
module.exports = function (componet, di) {

    var router = componet.get('core/router');

    router.add([
        {
            pattern: '/install',
            route: 'install/index',
            method: ['GET', 'POST']
        },
        {
            pattern: '/admin',
            route: 'admin/home/index'
        },
        {
            pattern: '/contact',
            route: 'contact/index',
            method: ['GET', 'POST']
        },
        {
            pattern: '/captcha',
            route: 'contact/captcha'
        },
        {
            pattern: '/search',
            route: 'search/index'
        },
        {
            pattern: 'admin/<controller>/list/page/<page:(\\d+)>',
            route: 'admin/<controller>/list',
            method: ['GET', 'POST']
        },
        {
            pattern: 'admin/<controller>/<action>',
            route: 'admin/<controller>/<action>',
            method: ['GET', 'POST']
        },
        {
            dynamic: true,
            constructor: di.load('@{envShared}/dynamic-router')
        },
        {
            pattern: '/',
            route: 'home/index'
        }
    ]);

};