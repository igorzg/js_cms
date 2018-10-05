/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name config.js
 * @function
 * @description
 * Is used to do configuration at bootstrap
 */
module.exports = function (componet, di, bootstrap) {
    "use strict";
    var viewLoader,
        logger = componet.get('core/logger'),
        loggerModel = di.load('@{modelsPath}/logger');

    // bind logger hook
    logger.addHook(loggerModel.save.bind(loggerModel));

    di.load('@{envShared}/router')(componet, di);
};