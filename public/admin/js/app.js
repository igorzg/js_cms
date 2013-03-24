/**
 * File:
 * User: igorivanovic
 * Date: 1/19/13
 * Time: 10:35 PM
 * @copyright : Igor Ivanovic
 */


/**
 * Handle cookies
 * @type {Object}
 */
var CookieHandler = {
    /**
     * CreateCookie
     * @param name
     * @param value
     * @param days
     */
    set : function( name, value, days ){
        if (days) {
            var date = new Date();
            date.setTime( date.getTime() + ( days*24*60*60*1000 ) );
            var expires = "; expires="+date.toGMTString();
        }else{
            var expires = "";
        }
        document.cookie = name+"="+value+expires+"; path=/";
    },
    /**
     * ReadCookie
     * @param name
     * @return {*}
     */
    get : function(name) {
        var cn = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(cn) == 0) return c.substring(cn.length,c.length);
        }
        return null;
    },
    /**
     * Earse cookie
     * @param name
     */
    clear : function( name ) {
        this.set(name,"",-1);
    }
};



/**
 * Ngview
 */
var ngModule = angular.module('SimpleCMS', [], function($routeProvider, $locationProvider) {

    var homeUrl = '/admin/';
    $routeProvider.
        when(homeUrl + 'error', {
            templateUrl: homeUrl + 'templates/error.html',
            controller: 'ErrorCtrl'
        }).
        when(homeUrl + 'login', {
            templateUrl: homeUrl + 'templates/login.html',
            controller: 'LoginCtrl'
        }).
        when(homeUrl + 'categories/add/:id', {
            templateUrl: homeUrl + 'templates/categories/add.html',
            controller: 'CategoriesAddCtrl'
        }).
        when(homeUrl + 'categories/add', {
            templateUrl: homeUrl + 'templates/categories/add.html',
            controller: 'CategoriesAddCtrl'
        }).
        when(homeUrl + 'categories', {
            templateUrl: homeUrl + 'templates/categories/index.html',
            controller: 'CategoriesCtrl'
        }).

        when(homeUrl + 'articles', {
            templateUrl: homeUrl + 'templates/articles/index.html',
            controller: 'ArticlesCtrl'
        }).
        when(homeUrl + 'articles/add', {
            templateUrl: homeUrl + 'templates/articles/add.html',
            controller: 'ArticlesAddCtrl'
        }).
        when(homeUrl + 'articles/add/:id', {
            templateUrl: homeUrl + 'templates/articles/add.html',
            controller: 'ArticlesAddCtrl'
        }).
        when(homeUrl + 'users', {
            templateUrl: homeUrl + 'templates/users/index.html',
            controller: 'UsersCtrl'
        }).

        otherwise({
            redirectTo: homeUrl ,
            templateUrl: homeUrl + 'templates/main.html',
            controller: 'AdminCtrl'
        });

    $locationProvider.html5Mode(true);
});


/**
 * File:
 * User: igorivanovic
 * Date: 3/11/13
 * Time: 8:06 PM
 * @copyright : Igor Ivanovic
 */
ngModule.factory('routerFactory', ['$http','$location', function($http,$location) {



    /**
     * Return public data
     */
    return {

        port : 10350,
        /**
         * Redirect
         * @param url
         */
        url : function(url){
            $location.url(url);
        },
        /**
         * Create server admin url
         * @param $location
         * @param url
         * @return {String}
         */
        serverAdminUrl : function(url){

            var str = "";
            if( angular.isString(url) ){
                str += url;
            }
            return $location.$$protocol + "://" + $location.$$host + ":"+this.port+"/admin/" + str;
        },
        /**
         * Create Admin url
         * @param $location
         * @param url
         * @return {String}
         */
        absAdminUrl : function(url){
            var str = "";
            if( angular.isString(url) ){
                str += url;
            }
            return $location.$$protocol + "://" + $location.$$host + "/admin/" + str;
        },
        /**
         * Create Admin url
         * @param $location
         * @param url
         * @return {String}
         */
        adminUrl : function(url){
            var str = "";
            if( angular.isString(url) ){
                str += url;
            }
            return "/admin/" + str;
        },
        /**
         * Post data
         * @param $http
         * @param $location
         * @param callback
         */
        http : function(settings, callback ){

            var config = {
                method: 'POST',
                url:  null,
                dataType: "json",
                withCredentials : true,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            config = angular.extend(config,settings);

            if( config.url !== null ){
                $http(config)
                    .success(callback)
                    .error(function() {
                        if( $location.$$url !== "/admin/error" ){
                            $location.url(Router.adminUrl("error"));
                        }
                    });
            }else{
                throw new Error("Url must be entered");
            }


        },
        /**
         * Checks session
         * @param $http
         * @param callback
         */
        checkSession : function( callback ){
            var self = this;
            var config = {
                method: 'POST',
                url:  self.serverAdminUrl("checksession")
            };

            var session = CookieHandler.get("sessionid");

            if( session !== null ){
                config.data = {};
                config.data.sessionid = session;
            }
            this.http(config, callback);
        },
        /**
         * Method wrapper
         * @param $http
         * @param $location
         */
        checkAuthorisedSession : function(){
            this.checkSession(function(res){
                if( angular.isDefined(res.redirect) && $location.url() !== res.redirect && res.isLoggedIn === false ){
                    $location.url(res.redirect);
                }
                if( angular.isDefined(res.isLoggedIn) && res.isLoggedIn === true ){
                    window.user = res.user;
                }
            });
        }
    }
}]);


/**
 * File:
 * User: igorivanovic
 * Date: 3/11/13
 * Time: 8:06 PM
 * @copyright : Igor Ivanovic
 */
ngModule.factory('compileFactory', ['$http','$compile', function($http, $compile) {



    /**
     * Return public data
     */
    return {

        /**
         * Compile overly
         * @constructor
         */
        compileErrorOverly : function(scope){

            var templateHTML = '<div id="overlay_bg" ng-click="close()"></div>';
            templateHTML += '<div id="overlay">';
            templateHTML += '<div class="title">{{title}}</div>';
            templateHTML += '<ul>';
            templateHTML += '<li ng-repeat="item in errors">{{item}}</li>';
            templateHTML += '</ul>';
            templateHTML += '<button class="button blackglossyCSSButtonbutton" ng-click="close()">{{close_button_title}}</button>';
            templateHTML += '</div>';

            $compile(angular.element(templateHTML))(scope, function(clonedElement, scope) {
                angular.element(document.querySelector("#overlay_wrapper")).addClass("show").html("").append(clonedElement);
            });
        },
        /**
         * Confirm Overly
         * @param scope
         * @param $compile
         */
        compileConfirmOverly : function(scope){

            var templateHTML = '<div id="overlay_bg" ng-click="close()"></div>';
            templateHTML += '<div id="overlay">';
            templateHTML += '<div class="title">{{title}}</div>';
            templateHTML += '<button class="button blackglossyCSSButtonbutton" ng-click="ok_confirm_response($event)" style="margin-right: 15px">{{ok_button_title}}</button>';
            templateHTML += '<button class="button blackglossyCSSButtonbutton" ng-click="close()">{{close_button_title}}</button>';
            templateHTML += '</div>';

            $compile(angular.element(templateHTML))(scope, function(clonedElement, scope) {
                angular.element(document.querySelector("#overlay_wrapper")).addClass("show").html("").append(clonedElement);
            });
        }
    }
}]);





/**
 * Admin controler
 * @param $scope
 * @param $routeParams
 * @param $http
 * @param $location
 * @constructor
 */
ngModule.controller(
    'AdminCtrl',
    function ($scope,$http,$location){


    }
);
/**
 * Login controller
 * @param $scope
 * @param $location
 * @param $http
 * @constructor
 */
ngModule.controller(
    'LoginCtrl',
    function ($scope, routerFactory, compileFactory){
        $scope.translations = {
            'Username' : 'Username',
            'Password' : 'Password',
            'Enter your username' : 'Enter your username',
            'Enter your password' : 'Enter your password',
            'Login' : 'Login'
        }



        routerFactory.checkSession(function(res){
            if( angular.isDefined(res.redirect) && angular.isDefined(res.isLoggedIn) && res.isLoggedIn === true ){
                window.user = res.user;
                routerFactory.url(res.redirect);
            }
        });


        $scope.login = function(){
            var form = document.getElementById("login"),
                username = form.querySelector('input[name="username"]'),
                password = form.querySelector('input[name="password"]');

            /**
             * Login request
             */
            routerFactory.http({
                url : routerFactory.serverAdminUrl("authenticate/login"),
                data :  ({username : username.value, password : password.value})
            }, function(res) {

                if( angular.isDefined(res.data) ){
                    CookieHandler.set("sessionid",res.sessionID,1);
                    routerFactory.url("/admin");
                }else{
                    $scope.title = "Ups something wrong :)";
                    $scope.close_button_title = "Close";
                    $scope.errors = res.translations;
                    $scope.close = function(){
                        angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
                    }
                    compileFactory.compileErrorOverly();
                }

            });

        }


    }
);

/**
 * Error ctrl
 * @param $scope
 * @param $location
 * @param $http
 * @constructor
 */
ngModule.controller(
    'ErrorCtrl',
    function ErrorCtrl($scope){
        $scope.translations = {
            'Error: 404' : 'Error: 404',
            'Something went terribly wrong, but most likely it is not your fault.' : 'Something went terribly wrong, but most likely it is not your fault.',
            'Open the home page and try to find the information of interest.' : 'Open the home page and try to find the information of interest.',
            'Press the back button in your broswer and then click another link.' : 'Press the back button in your broswer and then click another link.',
            'Admin' : 'Admin'
        }
    }
);

/***
 * Admin menu scope
 * @param $scope
 * @constructor
 */
ngModule.controller(
    'AdminMenuCtrl',
    function ($scope,  routerFactory, compileFactory, $location){

        /**
         * Whathever user click check current session
         */
        routerFactory.checkAuthorisedSession();
        /**
         * Menu list
         * @type {Array}
         */
        $scope.menu = [
            {
                url : routerFactory.adminUrl('articles'),
                title : 'Articles',
                current : $location.url() === routerFactory.adminUrl('articles')
            },
            {
                url : routerFactory.adminUrl('categories'),
                title : 'Categories',
                current : $location.url() === routerFactory.adminUrl('categories')
            },
            {
                url : routerFactory.adminUrl('users'),
                title : 'Users',
                current : $location.url() === routerFactory.adminUrl('users')
            }
        ];

        /**
         * Logout app
         * @param $event
         */
        $scope.logout = function($event){
            $event.preventDefault();
            /**
             * Send request
             */
            routerFactory.http({
                url:  routerFactory.serverAdminUrl('deletesession'),
                data : ({sid: CookieHandler.get("sessionid") })
            },  function(res) {

                CookieHandler.clear("sessionid");

                if( angular.isDefined(res.redirect) ){
                    $location.url(res.redirect);
                }else{
                    $location.url("/admin/login");
                }

            });

        }

        /**
         * Check
         * @type {String}
         */
        var current = angular.isDefined( $scope.$parent.$parent.currentMenu ) ? $scope.$parent.$parent.currentMenu : undefined;

        /**
         * Sets current menu
         * @param name
         */
         if( current !== undefined ){
             angular.forEach($scope.menu,function(val){
                 if(val.url === routerFactory.adminUrl(current)){
                     val.current = true;
                 }
             });
         }




    }
);




/**
 * Categories
 * @param $scope
 * @constructor
 */
ngModule.controller(
    'CategoriesCtrl',
    function ($scope, routerFactory, compileFactory, $location){

        $scope.submenu  = [
            {
                url : routerFactory.adminUrl('categories/add'),
                title : 'Add category',
                current : $location.url() === routerFactory.adminUrl('categories/add')
            }
        ];

        /**
         * Translations
         * @type {Object}
         */
        $scope.translations = {
            'NUM' : 'NUM',
            'ID' : 'ID',
            'Title' : 'Title',
            'Short description' : 'Short description',
            'Url': 'Url',
            'Parent category' : 'Parent category',
            'Created' : 'Created',
            'Edit' : 'Edit',
            'Delete' : 'Delete',
            'No records to display' : 'No records to display'
        }


        /***
         * Confirm Delition
         * @param data
         * @return {Array}
         */
        $scope.confirmDelete = function($event){

            if( $event.preventDefault ){
                $event.preventDefault();
            }else{
                $event.returnValue = false;
            }

            $scope.title = "Are you sure that you want to delete record ??";
            $scope.ok_button_title = "Ok";
            $scope.close_button_title = "Close";
            $scope.ok_confirm_response = function(ev){


                if( ev.preventDefault ){
                    ev.preventDefault();
                }else{
                    ev.returnValue = false;
                }

                /**
                 * Url
                 * @type {*}
                 */
                var url = angular.element($event.target).attr("data-deleteurl");
                /**
                 * Router
                 */
                routerFactory.http({
                    method: 'GET',
                    url:  url
                }, function(res){
                    if(res.refresh){
                        window.location.reload();
                    }
                });


            }
            $scope.close = function(){
                angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
            }
            compileFactory.compileConfirmOverly();
        }


        /**
         * Categories
         * @type {null}
         */
        $scope.categories = null;


        /**
         * Watch categories
         */
        $scope.$watch("categories", function(n,o){
            angular.forEach(n,function(val){
                if( angular.isDefined(val.parent_category) ){
                    val.parent = {};
                    angular.forEach(n,function(pval){
                        if(val.parent_category === pval._id){
                            val.parent = pval;
                        }
                    });
                }
            });
        });




        /**
         * Filter and compile data
         * @param data
         * @return {Array}
         */
        var filter = function(data){

            var compileRow = function(row){
                var n = {}, i,date;
                for(i in row){
                    if(row.hasOwnProperty(i)){
                        n[i] = row[i];
                        if( i === "created" ){
                            n.date = moment(parseInt(row[i])).format("DD-MM-YYYY HH:mm:ss");
                        }
                    }
                }

                n.edit_url = routerFactory.adminUrl('categories/add/'+ n._id);
                n.delete_url = routerFactory.serverAdminUrl('categories/delete/'+ n._id);

                return n;
            }

            if( angular.isArray(data) ){
                var len = data.length, i, n = [];
                for(i = 0; i < len; ++i){
                    n.push(compileRow(data[i]));
                }
                return n;
            }

            return [];
        }


        /**
         * List all categorys
         * @type {Object}
         */
        routerFactory.http({
            method: 'GET',
            url:  routerFactory.serverAdminUrl("categories/list")
        }, function(res){
            if( res.data && res.data.length > 0 ){
                $scope.categories = filter(res.data);
                angular.element( document.querySelector('table.greed tbody .nodata') ).css("display","none");
            }
        });
    }
);

/**
 * Add categories
 * @param $scope
 * @constructor
 */
ngModule.controller(
    'CategoriesAddCtrl',
    function ($scope,  routerFactory, compileFactory, $routeParams, $location){


        /***
         * Submenu
         * @type {Array}
         */
        $scope.submenu  = [
            {
                url : routerFactory.adminUrl('categories'),
                title : 'Categories',
                current : false
            }
        ];

        $scope.edit = {};

        /**
         * Translations
         * @type {Object}
         */

        $scope.currentMenu = "categories";

        /**
         * Translations
         * @type {Object}
         */
        $scope.translations = {
            'Title' : 'Title',
            'Short description' : 'Short description',
            'Description' : 'Description',
            'Submit' : 'Submit',
            'Tags' : 'Tags',
            'Image' : 'Image',
            'Choose file' : 'Choose file',
            'Select category' : 'Select category'
        }

        /**
         * Categories
         * @type {null}
         */
        $scope.categories = [];


        /**
         * Categories
         */
        routerFactory.http({
            method: 'GET',
            url:  routerFactory.serverAdminUrl("categories/list")
        }, function(res){
            $scope.categories = res.data;
        });


        /**
         * Routeparam EDIT
         */
        if( angular.isDefined($routeParams.id) && $routeParams.id !== null ){
            $scope.edit._id = $routeParams.id;

            /**
             * It cannot be subcategory of itself
             */
            $scope.$watch("categories", function(cn){
                angular.forEach(cn,function(val, index){
                    if( val._id === $routeParams.id ){
                        $scope.categories.splice(index,1);
                    }
                });
            });


            /**
             * Get one category
             */
            routerFactory.http({
                    method: 'GET',
                    url:  routerFactory.serverAdminUrl("categories/one"),
                    params: ({id : $routeParams.id})
                }, function(res){

                    if( angular.isDefined( res.error ) && res.error === false ){
                        $scope.edit = res.data;
                    }else{
                        $scope.title = "Ups something wrong :)";
                        $scope.close_button_title = "Close";
                        $scope.errors = [];
                        $scope.close = function(){
                            angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
                        }
                        compileFactory.compileErrorOverly();
                    }

                });

            /**
             * On edit select selected id
             */
            $scope.$watch("edit", function(n){
                angular.forEach($scope.categories,function(val){
                    if(val._id === Number(n.parent_category)){
                        val.selected = "selected";
                    }else{
                        val.selected = null;
                    }

                });
                $scope.$watch("categories", function(cn){
                    angular.forEach(cn,function(cnv){
                        if(cnv._id === Number(n.parent_category)){
                            cnv.selected = "selected";
                        }else{
                            cnv.selected = null;
                        }
                    });
                });
            });


        }






        /**
         * Save category
         */
        $scope.save = function(){
            var form = document.getElementById("add_category"),
                title = form.querySelector('input[name="title"]'),
                short_description = form.querySelector('textarea[name="short_description"]'),
                tags = form.querySelector('textarea[name="tags"]'),
                parent_category = form.querySelector('[name="parent_category"]'),
                id = form.querySelector('input[name="id"]');

                var selected = parent_category.value;

                if( selected === "Select" || selected === ""){
                    selected = null;
                }


                /**
                 * Router
                 */
                routerFactory.http({
                    url:  routerFactory.serverAdminUrl("categories/save"),
                    data: ({title : title.value, short_description : short_description.value, tags: tags.value, parent_category: selected, id: id.value })
                }, function(res) {

                    if( angular.isDefined( res.error ) && res.error === false ){
                        $location.url(routerFactory.adminUrl('categories'));
                    }else{
                        $scope.title = "Ups something wrong :)";
                        $scope.close_button_title = "Close";
                        $scope.errors = res.translations;
                        $scope.close = function(){
                            angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
                        }
                        compileFactory.compileErrorOverly();
                    }

                });

        }

    }
);


/**
 * Articles
 * @param $scope
 * @constructor
 */
ngModule.controller(
    'ArticlesCtrl',
    function ($scope, routerFactory, compileFactory, $location){


        $scope.articles = [];

        /**
         * Translations
         * @type {Object}
         */
        $scope.translations = {
            'NUM' : 'NUM',
            'ID' : 'ID',
            'Title' : 'Title',
            'Short description' : 'Short description',
            'Url': 'Url',
            'Category' : 'Category',
            'Created' : 'Created',
            'Edit' : 'Edit',
            'Delete' : 'Delete',
            'No records to display' : 'No records to display'
        }


        /**
         * Filter and compile data
         * @param data
         * @return {Array}
         */
        var filter = function(data){

            var compileRow = function(row){
                var n = {}, i,date;
                for(i in row){
                    if(row.hasOwnProperty(i)){
                        n[i] = row[i];
                        if( i === "created" ){
                            n.date = moment(parseInt(row[i])).format("DD-MM-YYYY HH:mm:ss");
                        }
                    }
                }

                n.edit_url = routerFactory.adminUrl('articles/add/'+ n._id);
                n.delete_url = routerFactory.serverAdminUrl('articles/delete/'+ n._id);

                return n;
            }

            if( angular.isArray(data) ){
                var len = data.length, i, n = [];
                for(i = 0; i < len; ++i){
                    n.push(compileRow(data[i]));
                }
                return n;
            }

            return [];
        }


        /**
         * List all categorys
         * @type {Object}
         */
        routerFactory.http({
            method: 'GET',
            url:  routerFactory.serverAdminUrl("articles/list")
        }, function(res){
            if( res.data && res.data.length > 0 ){
                $scope.articles = filter(res.data);
                angular.element( document.querySelector('table.greed tbody .nodata') ).css("display","none");
            }
        });

        /**
         * Submenu for articles
         * @type {Array}
         */
        $scope.submenu  = [
            {
                url : routerFactory.adminUrl('articles/add'),
                title : 'Add article',
                current : $location.url() === routerFactory.adminUrl('articles/add')
            }
        ]



        /***
         * Confirm Delition
         * @param data
         * @return {Array}
         */
        $scope.confirmDelete = function($event){

            if( $event.preventDefault ){
                $event.preventDefault();
            }else{
                $event.returnValue = false;
            }

            $scope.title = "Are you sure that you want to delete record ??";
            $scope.ok_button_title = "Ok";
            $scope.close_button_title = "Close";
            $scope.ok_confirm_response = function(ev){


                if( ev.preventDefault ){
                    ev.preventDefault();
                }else{
                    ev.returnValue = false;
                }

                /**
                 * Url
                 * @type {*}
                 */
                var url = angular.element($event.target).attr("data-deleteurl");
                /**
                 * Router
                 */
                routerFactory.http({
                    method: 'GET',
                    url:  url
                }, function(res){
                    if(res.refresh){
                        window.location.reload();
                    }
                });


            }
            $scope.close = function(){
                angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
            }
            compileFactory.compileConfirmOverly();
        }
    }
);

/***
 * Add add article
 * @param $scope
 * @param $location
 * @param $http
 * @constructor
 */
ngModule.controller(
    'ArticlesAddCtrl',
    function ($scope,$location,  routerFactory, compileFactory, $routeParams){

        /***
         * Submenu
         * @type {Array}
         */
        $scope.submenu  = [
            {
                url : routerFactory.adminUrl('articles'),
                title : 'Articles',
                current : $location.url() === routerFactory.adminUrl('articles/add')
            }
        ];

        /***
         * Add class to current menu
         * @type {String}
         */
        $scope.currentMenu = "articles";

        /**
         * Set to null
         * @type {Object}
         */
        $scope.edit = {};

        /**
         * Translations
         * @type {Object}
         */
        $scope.translations = {
            'Title' : 'Title',
            'Short description' : 'Short description',
            'Description' : 'Description',
            'Submit' : 'Submit',
            'Tags' : 'Tags',
            'Image' : 'Image',
            'Choose file' : 'Choose file',
            'Select category' : 'Select category',
            'You tube' : 'You tube',
            'Select' : 'Select'
        }



        /**
         * Categories
         * @type {null}
         */
        $scope.categories = null;

        /**
         * Routeparam EDIT
         */
        if( angular.isDefined($routeParams.id) && $routeParams.id !== null ){
            $scope.edit._id = $routeParams.id;


            /**
             * Get one category
             */
            routerFactory.http({
                method: 'GET',
                url:  routerFactory.serverAdminUrl("articles/one"),
                params: ({id : $routeParams.id})
            }, function(res){

                if( angular.isDefined( res.error ) && res.error === false ){
                    $scope.edit = res.data;
                }else{
                    $scope.title = "Ups something wrong :)";
                    $scope.close_button_title = "Close";
                    $scope.errors = [];
                    $scope.close = function(){
                        angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
                    }
                    compileFactory.compileErrorOverly();
                }

            });

            /**
             * Watch
             */
            $scope.$watch("edit", function(n){
                angular.forEach($scope.categories,function(val){
                    if(n &&  n.category && val._id === parseInt(n.category)){
                        val.selected = "selected";
                    }else{
                        val.selected = null;
                    }

                });
                $scope.$watch("categories", function(cn){
                    angular.forEach(cn,function(cnv){
                        if(n && n.category && cnv._id === parseInt(n.category)){
                            cnv.selected = "selected";
                        }else{
                            cnv.selected = null;
                        }
                    });
                });
            });


        }

        /**
         * Errors
         */
        if( angular.isDefined($routeParams.errors) ){
            var parsed = JSON.parse($routeParams.errors);
            $scope.title = "Ups something wrong :)";
            $scope.close_button_title = "Close";
            $scope.errors = parsed.translations;
            $scope.close = function(){
                angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
            }

            compileFactory.compileErrorOverly();
        }

        /**

        **/

        /**
         * List categories
         */
        routerFactory.http({
            method: 'GET',
            url:  routerFactory.serverAdminUrl("categories/list")
        }, function(res){
            $scope.categories = res.data;
        });


        /**
         * Action url
         * @type {String}
         */
        $scope.action_url = routerFactory.serverAdminUrl("articles/save");
        /**
         * Redirect after save
         * @type {String}
         */
        $scope.redirect = routerFactory.absAdminUrl("articles");


    }
);




/**
 * Users
 * @param $scope
 * @constructor
 */
ngModule.controller(
    'UsersCtrl',
    function ($scope,routerFactory){

        /**
         * Translations
         * @type {Object}
         */
        $scope.translations = {
            'NUM' : 'NUM',
            'ID' : 'ID',
            'Name' : 'Name',
            'Surname' : 'Surname',
            'Username' : 'Username',
            'Email' : 'Email',
            'Created' : 'Created',
            'Edit' : 'Edit',
            'Delete' : 'Delete',
            'No records to display' : 'No records to display'
        }

        /**
         * Initialize
         * @type {null}
         */
        $scope.users = null;

        /**
         * Filter and compile data
         * @param data
         * @return {Array}
         */
        var filter = function(data){

            var compileRow = function(row){
                var n = {}, i,date;
                for(i in row){
                    if(row.hasOwnProperty(i)){
                        n[i] = row[i];
                        if( i === "created" ){
                            n.date = moment( parseInt(row[i]) ).format("DD-MM-YYYY HH:mm:ss");
                        }
                    }
                }

                n.edit_url = routerFactory.adminUrl('users/add/'+ n._id);
                n.delete_url = routerFactory.serverAdminUrl('users/delete/'+ n._id);

                return n;
            }

            if( angular.isArray(data) ){
                var len = data.length, i, n = [];
                for(i = 0; i < len; ++i){
                    n.push(compileRow(data[i]));
                }
                return n;
            }

            return [];
        }


        /**
         * Router
         */
        routerFactory.http({
            method: 'GET',
            url:  routerFactory.serverAdminUrl("users/list")
        }, function(res){
            if( res && res.data && res.data.length > 0 ){
                $scope.users = filter(res.data);
                angular.element( document.querySelector('table.greed tbody .nodata') ).css("display","none");
            }
        });






    }
);




/***
 * Articles Submenu
 * @param $scope
 * @param $http
 * @param $location
 * @constructor
 */
ngModule.controller(
    'AdminSubmenuCtl',
    function ($scope){
        $scope.menu = $scope.$parent.submenu;
    }
);