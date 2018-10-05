"use strict";
var di = require('mvcjs'), // mvcjs as node package
    Type = di.load('typejs'),
    Promise = di.load('promise'),
    Controller = di.load('core/controller'),
    crypto = di.load('crypto'),
    error = di.load('error'),
    component = di.load('core/component'),
    config = component.get('params'),
    cache = component.get('storage/memory'),
    CoreController;


/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name CoreController
 *
 * @constructor
 * @description
 * Core controller , most controllers are inherited from core controller
 */
CoreController = Controller.inherit({
    locals: Type.OBJECT,
    translations: Type.OBJECT,
    forceCacheRefresh: Type.BOOLEAN,
    routes: Type.ARRAY
}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#_construct
     *
     * @description
     * On construct set some defaults
     */
    _construct: function CoreController_construct() {

        if (config.has('chiper')) {
            this.forceCacheRefresh = this.getParsedUrl().query.forceCacheRefresh === config.get('cipher');
        } else {
            this.forceCacheRefresh = true;
        }

        this.translations = {};
        this.routes = [];
        this.locals = {
            decrypt: this.decrypt.bind(this),
            encrypt: this.encrypt.bind(this),
            t: this.translate.bind(this),
            createUrl: this.createUrl.bind(this),
            assetsPath: this.assetsPath.bind(this),
            getRoute: this.getRoute.bind(this),
            toBase64: function (value) {
                return new Buffer(value).toString('base64');
            },
            base64toString: function (value) {
                return new Buffer(value, 'base64').toString('utf8');
            },
            controller: this.getControllerName(),
            action: this.getActionName(),
            module: this.getModuleName(),
            env: process.env.NODE_ENV,
            isoLocale: config.has('isoLocale') ? config.get('isoLocale') : 'en_EN',
            scripts: [],
            menu: [],
            breadcrumbs: [],
            robots: {
                index: true,
                follow: true
            },
            metaTitle: config.has('seo_title') ? config.get('seo_title') : '',
            metaDesc: config.has('seo_description') ? config.get('seo_description') : '',
        };
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#setCache
     *
     * @description
     * Set cache
     */
    setCache: function (key, value) {
        cache.set('CLIENT_' + key, value);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#getCache
     *
     * @description
     * Get cache
     */
    getCache: function (key) {
        if (process.env.NODE_ENV !== 'development' && !this.forceCacheRefresh) {
            return cache.get('CLIENT_' + key);
        }
        return false;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#getRoute
     *
     * @description
     * Return route
     */
    getRoute: function CoreController_getRoute(type_id, type) {
        var routes = this.routes.slice(),
            item;

        while (routes.length) {
            item = routes.shift();
            if (item.type_id === type_id && item.type === type) {
                return item.url;
            }
        }

        return '/';
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#md5
     *
     * @description
     * Hash string in to md5
     */
    md5: function CoreController_md5(value) {
        return crypto.createHash('md5').update(value).digest('hex');
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#beforeEach
     *
     * @description
     * Check if is installed
     */
    beforeEach: function CoreController_beforeEach(action) {
        var controller = this.getControllerName(),
            route = controller + '/' + action;
        if (!config.has("installed") && ['install/index', 'error/index'].indexOf(route) === -1) {
            return Promise.resolve(this.redirect(this.createUrl('install/index')));
        }
        return Promise.resolve(true);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#_decode
     *
     * @description
     * Decode string
     */
    decrypt: function CoreController_decrypt(value) {
        var decipher, decrypted;
        if (Type.isNumber(value)) {
            value = value.toString();
        }
        try {
            decipher = crypto.createDecipher('aes-256-ctr', config.get("cipher"));
            decrypted = decipher.update(value, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (e) {
            return false;
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#_encode
     *
     * @description
     * Encode string
     */
    encrypt: function CoreController_encrypt(value) {
        var cipher, crypted;
        if (Type.isNumber(value)) {
            value = value.toString();
        }
        try {
            cipher = crypto.createCipher('aes-256-ctr', config.get("cipher"));
            crypted = cipher.update(value, 'utf8', 'base64');
            crypted += cipher.final('base64');
            return crypted;
        } catch (e) {
            return false;
        }

    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#translate
     *
     * @description
     * This is part of functions which can be executed in template
     * @return {string}
     */
    translate: function CoreController_translate(value) {
        if (this.translations.hasOwnProperty(value)) {
            return this.translations[value];
        }
        return value;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#assetsPath
     *
     * @description
     * Return assets path
     * @return {string}
     */
    assetsPath: function CoreController_assetsPath(path) {
        return '/assets' + path;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method CoreController#setCookie
     *
     * @description
     * Creates an cookie
     */
    setCookie: function CoreController_setCookie(name, value, days) {
        var date;
        if (days) {
            date = new Date();
            date.setTime(date.getTime() + ( days * 24 * 60 * 60 * 1000 ));
        }
        this._super(name, value, date, '/');
    }


});


module.exports = CoreController;


