"use strict";
var di = require('mvcjs'),
    Type = di.load('typejs'),
    core = di.load('core'),
    Promise = di.load('promise'),
    AbstractModel = di.load('@{modelsPath}/abstract-model'),
    routerModel = di.load('@{modelsPath}/router'),
    component = di.load('core/component'),
    mongo = component.get('db/mongo'),
    ArticlesModel;

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name ArticlesModel
 *
 * @constructor
 * @description
 * Content Model is used for CRUD to content collection
 */
ArticlesModel = AbstractModel.inherit({
        model: Type.FUNCTION
    },
    {
        _construct: function () {

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
                short_description: {
                    type: String,
                    require: true
                },
                description: {
                    type: String,
                    require: true
                },
                category: {
                    type: Number,
                    default : 0
                },
                files: {
                    type: Array
                }
            }, {
                collection: 'articles'
            });
            this.model = mongo.model('Articles', schema);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method CategoriesModel#save
         *
         * @description
         * Save menu
         */
        update: function (id, data) {
            return new Promise(function (response, reject) {
                return this.model.findOneAndUpdate({id: id}, data).exec(function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    return response(data);
                });
            }.bind(this))
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method ArticlesModel#save
         *
         * @description
         * Save menu
         */
        save: function (data) {
            return this.nextId().then(function (id) {
                return routerModel.save({
                    type: 'article',
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


module.exports = new ArticlesModel;