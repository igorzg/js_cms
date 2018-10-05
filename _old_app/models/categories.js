"use strict";
var di = require('mvcjs'),
    Type = di.load('typejs'),
    AbstractModel = di.load('@{modelsPath}/abstract-model'),
    routerModel = di.load('@{modelsPath}/router'),
    core = di.load('core'),
    component = di.load('core/component'),
    mongo = component.get('db/mongo'),
    CategoriesModel;

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name CategoriesModel
 *
 * @constructor
 * @description
 * Content Model is used for CRUD to content collection
 */
CategoriesModel = AbstractModel.inherit({
        model: Type.FUNCTION
    },
    {
        _construct: function() {

            var schema = mongo.schema({
                id: {
                    type: Number,
                    require: true,
                    unique: true
                },
                created: {
                    type: Date,
                    require: true
                },
                meta_title: {
                    type: String,
                    require: true
                },
                meta_description: {
                    type: String,
                    require: true
                },
                title: {
                    type: String,
                    require: true
                },
                description: {
                    type: String,
                    require: true
                }
            }, {
                collection: 'categories'
            });
            this.model = mongo.model('Categories', schema);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method CategoriesModel#save
         *
         * @description
         * Save menu
         */
        update: function(id, data) {
            return this.model.findOneAndUpdate({id: id}, data).exec();
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method CategoriesModel#save
         *
         * @description
         * Save menu
         */
        save: function(data) {
            return this.nextId().then(function (id) {
                return routerModel.save({
                    type: 'category',
                    type_id: id,
                    url: data.url
                }).then(function () {
                    delete data.url;
                    return this.model.create(core.extend({
                        created: new Date,
                        id: id
                    }, data));
                }.bind(this));
            }.bind(this));

        }
    }
);


module.exports = new CategoriesModel;