"use strict";
var di = require('mvcjs'),
    Type = di.load('typejs'),
    component = di.load('core/component'),
    mongo = component.get('db/mongo'),
    CommentsModel;

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
CommentsModel = Type.create({
        model: Type.FUNCTION
    },
    {
        _construct: function() {

            var schema = mongo.schema({
                body: {
                    type: String,
                    require: true
                },
                date:  {
                    type: Date,
                    require: true
                },
                name:  {
                    type: String,
                    require: true
                },
                email: {
                    type: String,
                    require: true
                },
                type: {
                    type: String,
                    enum: ['category', 'article'],
                    require: true
                }
            }, {
                collection: 'comments'
            });
            this.model = mongo.model('Comments', schema);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method CategoriesModel#find
         *
         * @description
         * Save menu
         */
        findOne: function () {
            return this.model.findOne.apply(this.model, arguments);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method CategoriesModel#find
         *
         * @description
         * Save menu
         */
        find: function () {
            return this.model.find.apply(this.model, arguments);
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
            return this.model.create({
                body: null,
                date:  null,
                name:  null,
                email: null,
                type: null
            }, data);
        }
    }
);


module.exports = new CommentsModel;