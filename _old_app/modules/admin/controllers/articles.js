"use strict";
var di = require('mvcjs'), // mvcjs as node package
    CoreController = di.load('@{module_admin}/controllers/core'),
    articlesModel = di.load('@{modelsPath}/articles'),
    categoriesModel = di.load('@{modelsPath}/categories'),
    routerModel = di.load('@{modelsPath}/router'),
    Promise = di.load('promise'),
    fs = di.load('fs'),
    Type = di.load('typejs'),
    ArticlesController;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name ArticlesController
 *
 * @constructor
 * @description
 * Handle articles
 */
ArticlesController = CoreController.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ArticlesController#_saveFiles
     *
     * @description
     * Save files
     * @return {*|string}
     */
    _saveFiles: function saveFiles(files) {
        var promises = [];

        if (Type.isArray(files)) {
            files.forEach(function (file) {
                promises.push(filePromise.call(this, file));
            }.bind(this));
        } else if (Type.isObject(files)) {
            promises.push(filePromise.call(this, files));
        }

        return Promise.all(promises).catch(function () {
            return false;
        });
        /**
         * File promise
         * @param file
         * @returns {Promise}
         */
        function filePromise(file) {

            var path, fileName, filesPath = '/files';

            if (!file.value || !file.fileName) {
                return Promise.reject(false);
            }

            fileName = this.md5(file.fileName + (new Date).getTime() + Math.random());

            switch (file.contentType) {
                case 'image/png':
                    fileName += '.png';
                    break;
                case 'image/gif':
                    fileName += '.gif';
                    break;
                case 'image/jpeg':
                    fileName += '.jpg';
                    break;
            }

            path = di.normalizePath('@{basePath}/storage' + filesPath);


            if (!isDir(path)) {
                mkdir(path);
            }

            return new Promise(function (resolve, reject) {
                fs.writeFile(path + '/' + fileName, file.value, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(filesPath + '/' + fileName);
                });
            });
        }


        /**
         * Is directory
         * @param path
         * @returns {boolean}
         */
        function isDir(path) {
            try {
                return fs.statSync(path).isDirectory();
            } catch (e) {
                return false;
            }

        }

        /**
         * Create directory
         * @param path
         */
        function mkdir(path) {
            if (!isDir(path)) {
                fs.mkdirSync(path);
            }
        }
    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ArticlesController#before_ad_get
     *
     * @description
     * Post handler for add action
     * @return {*|string}
     */
    _before_add_post: function ArticlesController_before_add_post(params) {

        var body = this.getParsedBody(), promise, data, category = {}, cat_id;


        this.locals.categories.forEach(function (item) {
            if (body && body.category && item.id === parseInt(body.category.value)) {
                category = item;
            }
        });


        if (!body.meta_title || !body.meta_title.value) {
            this.locals.errors.push(this.translate('You must define meta title'));
        }

        if (!body.meta_description || !body.meta_description.value) {
            this.locals.errors.push(this.translate('You must define meta description'));
        }

        if (!body.title || !body.title.value) {
            this.locals.errors.push(this.translate('You must define title'));
        }

        if (!body.short_description || !body.short_description.value) {
            this.locals.errors.push(this.translate('You must define short description'));
        }

        if (!body.description || !body.description.value) {
            this.locals.errors.push(this.translate('You must define description'));
        }
        /*
         if (!body.category || !body.category.value) {
         this.locals.errors.push(this.translate('You must select category'));
         }
         */


        if (Type.isArray(body.files) && body.files.length > 0) {
            body.files.forEach(function (file) {
                if (file.contentType.indexOf('image/') === -1) {
                    this.locals.errors.push(this.translate('Only images are allowed'));
                }
            }.bind(this));
        } else if (Type.isObject(body.files) && body.files.fileName) {
            if (body.files.contentType.indexOf('image/') === -1) {
                this.locals.errors.push(this.translate('Only images are allowed to be uploaded'));
            }
        }

        cat_id = parseInt(body.category.value);

        data = {
            url: '/' + this.normalizeUrl(category.title) + '/' + this.normalizeUrl(body.title.value),
            meta_title: body.meta_title.value,
            meta_description: body.meta_description.value,
            title: body.title.value,
            short_description: body.short_description.value,
            description: body.description.value,
            category: isNaN(cat_id) ? 0 : cat_id
        };

        this.locals.post = data;

        if (this.locals.errors.length > 0) {
            return true;
        }

        if (!!params.id) {
            promise = articlesModel.update(params.id, data);
        } else {
            promise = articlesModel.save(data);
        }


        return promise.then(function (article) {
            return this._saveFiles(body.files)
                .then(function (paths) {
                    if (!!paths && Type.isArray(paths)) {
                        if (Type.isArray(article.files)) {
                            paths = paths.concat(article.files);
                        }
                        return articlesModel.update(article.id, {
                            files: paths
                        });
                    }
                })
                .then(function () {
                    return this.redirect(this.createUrl('admin/articles/list', {page: params.page}), true);
                }.bind(this));
        }.bind(this))
            .catch(function (error) {
                if (error.stack.indexOf('insertDocument') > -1) {
                    this.locals.errors.push(this.translate('Record exists'));
                }
                console.error(error.stack);
            }.bind(this));
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ArticlesController#before_add
     *
     * @description
     * Before list get all data or handle post request
     * @return {*|string}
     */
    before_add: function ArticlesController_before_add(params) {

        this.locals.categories = [];
        // find categories
        return categoriesModel.find().exec().then(function (categories) {

            this.locals.categories = categories;

            if (this.getMethod() === 'POST') {
                return this._before_add_post(params);
            } else if (!!params.id) {
                return articlesModel.findById(params.id)
                    .then(function (data) {
                        this.locals.post = data;
                    }.bind(this));
            }
        }.bind(this));
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ArticlesController#action_index
     *
     * @description
     * Index action request
     * @return {*|string}
     */
    action_add: function ArticlesController_action_add(params) {

        this.locals.params = params;
        this.locals.submenu.push({
            href: this.createUrl('admin/articles/list', {page: params.page}),
            label: this.translate('List')
        });

        return this.renderFile('articles/add', this.locals);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ArticlesController#action_delete
     *
     * @description
     * Delete article by id and remove all files related to it
     * @return {*|string}
     */
    action_delete: function (params) {
        return articlesModel.removeById(params.id).then(function (data) {
            var promises = [];
            if (data && data.files) {
                data.files.forEach(function (file) {
                    promises.push(new Promise(function (resolve, reject) {
                        var unlink = di.normalizePath('@{basePath}/storage/' + file);
                        fs.unlink(unlink, function (err) {
                            if (err) {
                                return reject(err);
                            }
                            return resolve(unlink);
                        });
                    }));
                });
            }
            return Promise.all(promises).then(function () {
                return routerModel.removeByTypeId(params.id, 'article');
            }.bind(this));
        }.bind(this))
            .then(function () {
                return this.redirect(this.createUrl('admin/articles/list', {page: params.page}), true);
            }.bind(this))
            .catch(function () {
                return this.redirect(this.createUrl('admin/articles/list', {page: params.page}), true);
            }.bind(this));
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ArticlesController#action_delete
     *
     * @description
     * Delete article by id and remove all files related to it
     * @return {*|string}
     */
    action_deleteimage: function (params) {

        var iPromise = new Promise(function (resolve, reject) {
            articlesModel.findOne({id: params.id}).exec(function (err, data) {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            })
        });

        return iPromise.then(function (data) {
            var file = new Buffer(params.file, 'base64').toString('utf8');
            return new Promise(function (resolve, reject) {
                var unlink = di.normalizePath('@{basePath}/storage/' + file);
                fs.unlink(unlink, function (err) {
                    if (err && err.errno !== -2) {
                        return reject(err);
                    }
                    return resolve({
                        file: file,
                        article: data
                    });
                });
            });
        }.bind(this))
            .then(function (data) {
                data.article.files.splice(data.article.files.indexOf(data.file), 1);
                return articlesModel.update(params.id, {
                    files: data.article.files
                });
            })
            .then(function () {
                return this.redirect(this.createUrl('admin/articles/add', {id: params.id, page: params.page}), true);
            }.bind(this))
            .catch(function () {
                return this.redirect(this.createUrl('admin/articles/add', {id: params.id, page: params.page}), true);
            }.bind(this));
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ArticlesController#before_list
     *
     * @description
     * Before list get all data
     * @return {*|string}
     */
    before_list: function (params) {
        var limit = parseInt(params.limit) || 10,
            page = parseInt(params.page) || 1,
            skip = 0,
            p;

        if (params.page === '1') {
            return this.redirect(this.createUrl('admin/articles/list'), true);
        }

        if (page > 1) {
            skip = limit * (page - 1);
        }

        p = {
            limit: limit,
            page: page,
            skip: skip,
            count: 0,
            maxPages: 0,
            pages: [],
            next: null,
            prev: null
        };

        return Promise.all([
            articlesModel.find().sort({id: -1}).limit(limit).skip(skip).exec(),
            articlesModel.count().exec()
        ]).then(function (models) {
            var data = models.shift(), i;
            p.count = models.shift();
            p.maxPages = Math.ceil(p.count / limit);

            if (page > p.maxPages && p.maxPages > 0) {
                return this.redirect(this.createUrl('admin/articles/list', {page: p.maxPages}), true);
            }

            if (p.page < p.maxPages) {
                p.next = this.createUrl('admin/articles/list', {page: p.page + 1});
            }

            if (p.page > 1) {
                p.prev = this.createUrl('admin/articles/list', {page: p.page - 1});
            }

            i = 1;
            while (i <= p.maxPages) {
                p.pages.push({
                    href: this.createUrl('admin/articles/list', {page: i}),
                    active: i === page,
                    label: i
                });
                ++i;
            }

            this.locals.pagination = p;

            return data;
        }.bind(this));
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ArticlesController#action_index
     *
     * @description
     * Index action request
     * @return {*|string}
     */
    action_list: function ArticlesController_action_list(params, data) {

        this.locals.submenu.push({
            href: this.createUrl('admin/articles/add'),
            label: this.translate('Add')
        });
        this.locals.data = data;

        return this.renderFile('articles/list', this.locals);
    }
});


module.exports = ArticlesController;
