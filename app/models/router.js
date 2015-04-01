"use strict";
var di = require('mvcjs'),
    Type = di.load('typejs'),
    core = di.load('core'),
    Promise = di.load('promise'),
    AbstractModel = di.load('@{modelsPath}/abstract-model'),
    component = di.load('core/component'),
    mongo = component.get('db/mongo'),
    RouterModel;

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name RouterModel
 *
 * @constructor
 * @description
 * RouterModel is used for CRUD to content collection
 */
RouterModel = AbstractModel.inherit({
        model: Type.FUNCTION
    },
    {
        _construct: function() {

            var schema = mongo.schema({
                created: {
                    type: Date,
                    require: true
                },
                id: {
                    type: Number,
                    require: true,
                    unique: true
                },
                url: {
                    type: String,
                    require: true,
                    unique: true
                },
                type_id: {
                    type: Number,
                    require: true
                },
                type: {
                    type: String,
                    require: true,
                    enum: ['category', 'article']
                },
                index: {
                    type: Boolean,
                    default: true
                },
                follow: {
                    type: Boolean,
                    default: true
                }
            }, {
                collection: 'router'
            });
            this.model = mongo.model('Router', schema);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method RouterModel#removeById
         *
         * @description
         * Remove doc by id
         */
        removeByTypeId: function (id, type) {
            return new Promise(function (response, reject) {
                return this.model.remove({type_id: id, type: type}, function (err, data) {
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
         * @method RouterModel#update
         *
         * @description
         * Update route by id
         */
        update: function(id, data) {
            return this.model.findOneAndUpdate({id: id}, data).exec();
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method RouterModel#save
         *
         * @description
         * Save menu
         */
        save: function(data) {
            return this.nextId().then(function (id) {
                return this.model.create(core.extend({
                    created: new Date,
                    type: null,
                    type_id: null,
                    url: null,
                    id: id
                }, data));
            }.bind(this));

        }
    }
);


module.exports = new RouterModel;