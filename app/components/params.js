"use strict";
var di = require('mvcjs'),
    Type = di.load('typejs'),
    fs = di.load('fs'),
    core = di.load('core'),
    error = di.load('error'),
    component = di.load('core/component'),
    logger = component.get('core/logger'),
    Params;

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Params
 *
 * @constructor
 * @description
 * Is responsible to handle params
 */
Params = Type.create({
        config: Type.OBJECT,
        data: Type.OBJECT
    },
    {
        _construct: function Params_construct(config) {
            this.data = {};
            this.config = core.extend({
                path: "@{envPath}/params.json"
            }, config);
            // load file
            this.load();
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Params#load
         *
         * @description
         * Try to load file
         */
        load: function Params_load() {
            try {
                this.data = JSON.parse(di.readFileSync(this.config.path));
            } catch (e) {
                logger.print('Params not provided, running install process');
            }
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Params#save
         *
         * @description
         * Save to file
         */
        save: function () {
            fs.writeFileSync(di.normalizePath(this.config.path), JSON.stringify(this.data, null, 2));
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Params#set
         *
         * @description
         * Extend chef config
         */
        set: function (key, value) {
            if (!this.has(key)) {
                this.data[key] = value;
            } else {
                throw new error.HttpError(500, {key: key, value: value}, "Params.set: " + key + " already exists");
            }
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Params#has
         *
         * @description
         * Has a chef config property
         * @return {object}
         */
        has: function (key) {
            return this.data.hasOwnProperty(key);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Params#get
         *
         * @description
         * Get an member of chef config
         * @return {object}
         */
        get: function (key) {
            if (this.has(key)) {
                return this.data[key];
            } else {
                throw new error.HttpError(500, {key: key}, "Params.get: " + key + " don't exist in config object");
            }
        }
    }
);


module.exports = Params;