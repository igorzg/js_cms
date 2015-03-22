"use strict";
var di = require('mvcjs'),
    Type = di.load('typejs'),
    crypto = di.load('crypto'),
    AbstractModel = di.load('@{modelsPath}/abstract-model'),
    component = di.load('core/component'),
    core = di.load('core'),
    mongo = component.get('db/mongo'),
    UsersModel;

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name UsersModel
 *
 * @constructor
 * @description
 * Content Model is used for CRUD to content collection
 */
UsersModel = AbstractModel.inherit({
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
                username: {
                    type: String,
                    require: true,
                    unique: true
                },
                password: {
                    type: String,
                    require: true
                },
                type: {
                    type: String,
                    require: true,
                    enum: ['admin', 'editor', 'view']
                }
            }, {
                collection: 'users'
            });
            this.model = mongo.model('Users', schema);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method CoreController#getUser
         *
         * @description
         * Return user
         */
        getUserById: function (id) {
            return this.model.findOne({
                id: id
            }).exec();
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method UsersModel#update
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
         * @method CoreController#getUser
         *
         * @description
         * Return user
         */
        getUser: function (username, password) {
            return this.model.findOne({
                username: username,
                password: this.md5(password)
            }).exec();
        },

        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method CoreController#md5
         *
         * @description
         * Hash string in to md5
         */
        md5: function (value) {
            return crypto.createHash('md5').update(value).digest('hex');
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method UsersModel#addUser
         *
         * @description
         * Add user
         */
        addUser: function(username, password, type) {
            return this.nextId().then(function (id) {
                return this.model.create({
                    created: new Date,
                    username: username,
                    password: this.md5(password),
                    type: type,
                    id: id
                });
            }.bind(this));

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
                return this.model.create(core.extend({
                    created: new Date,
                    id: id
                }, data));
            }.bind(this));
        }
    }
);


module.exports = new UsersModel;