"use strict";
var di = require('mvcjs'),
    Type = di.load('typejs'),
    core = di.load('core'),
    component = di.load('core/component'),
    mongo = component.get('db/mongo'),
    AbstractModel;

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name AbstractModel
 *
 * @constructor
 * @description
 * Abstract model
 */
AbstractModel = Type.create({},
    {
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method AbstractModel#nextId
         *
         * @description
         * Return next id
         */
        nextId: function () {
            return new Promise(function (response, reject) {
                this.model.findOne().sort({id: -1}).exec(function (err, data) {
                    if (!!err) {
                        return reject(err);
                    }
                    if (data && data.id) {
                        return response(data.id + 1);
                    }
                    return response(1);
                });
            }.bind(this))
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method AbstractModel#removeById
         *
         * @description
         * Remove doc by id
         */
        removeById: function (id) {
            return new Promise(function (response, reject) {
                return this.model.findOneAndRemove({id: id}, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    return response(data);
                });
            }.bind(this));
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method AbstractModel#findById
         *
         * @description
         * Get doc by id
         */
        findById: function (id) {
            return new Promise(function (response, reject) {
                return this.findOne({id: id}, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    return response(data);
                });
            }.bind(this));
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method ArticlesModel#count
         *
         * @description
         * count
         */
        count: function (a, b, c) {
            return this.model.count.apply(this.model, arguments);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method ArticlesModel#findOne
         *
         * @description
         * Find one
         */
        findOne: function (a, b, c) {
            return this.model.findOne.apply(this.model, arguments);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method ArticlesModel#find
         *
         * @description
         * Find
         */
        find: function () {
            return this.model.find.apply(this.model, arguments);
        }
    }
);


module.exports = AbstractModel;