"use strict";
var di = require('mvcjs'),
    Type = di.load('typejs'),
    component = di.load('core/component'),
    mongo = component.get('db/mongo'),
    LoggerModel;

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name LoggerModel
 *
 * @constructor
 * @description
 * Logger Model is used for CRUD to logger collection
 */
LoggerModel = Type.create({
        model: Type.FUNCTION
    },
    {
        _construct: function() {
            var schema = mongo.schema({
                created: Date,
                log: mongo.types.Mixed
            }, {
                collection: 'logs'
            });
            this.model = mongo.model('Logger', schema);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method LoggerModel#save
         *
         * @description
         * Save log
         */
        save: function(log) {
            return this.model.create({log: log, created: new Date});
        }
    }
);


module.exports = new LoggerModel;