/**
 * File:
 * User: igorivanovic
 * Date: 1/19/13
 * Time: 10:35 PM
 * @copyright : Igor Ivanovic
 */
/**
 * Ngview
 */
var admin = angular.module('ngView', [], function($routeProvider, $locationProvider) {

    var homeUrl = '/admin/';
    $routeProvider.
        when(homeUrl + 'error', {
            templateUrl: homeUrl + 'templates/error.html',
            controller: ErrorCtrl
        }).
        when(homeUrl + 'login', {
            templateUrl: homeUrl + 'templates/login.html',
            controller: LoginCtrl
        }).
        when(homeUrl + 'categories/add/:id', {
            templateUrl: homeUrl + 'templates/categories/add.html',
            controller: CategoriesAddCtrl
        }).
        when(homeUrl + 'categories/add', {
            templateUrl: homeUrl + 'templates/categories/add.html',
            controller: CategoriesAddCtrl
        }).
        when(homeUrl + 'categories', {
            templateUrl: homeUrl + 'templates/categories/index.html',
            controller: CategoriesCtrl
        }).

        when(homeUrl + 'articles', {
            templateUrl: homeUrl + 'templates/articles/index.html',
            controller: ArticlesCtrl
        }).
        when(homeUrl + 'articles/add', {
            templateUrl: homeUrl + 'templates/articles/add.html',
            controller: ArticlesAddCtrl
        }).
        when(homeUrl + 'articles/add/:id', {
            templateUrl: homeUrl + 'templates/articles/add.html',
            controller: ArticlesAddCtrl
        }).
        when(homeUrl + 'users', {
            templateUrl: homeUrl + 'templates/users/index.html',
            controller: UsersCtrl
        }).

        otherwise({
            redirectTo: homeUrl ,
            templateUrl: homeUrl + 'templates/main.html',
            controller: AdminCtrl
        });

    $locationProvider.html5Mode(true);
});


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
 * Create router
 * @type {Object}
 */
var Router = {

    port : 10350,
    /**
     * Create server admin url
     * @param $location
     * @param url
     * @return {String}
     */
    serverAdminUrl : function($location,url){

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
    absAdminUrl : function($location,url){
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
    http : function(settings, callback, $http, $location ){

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
    checkSession : function($http, $location, callback){

        var config = {
            method: 'POST',
            url:  Router.serverAdminUrl($location,"checksession")
        };

        var session = CookieHandler.get("sessionid");

        if( session !== null ){
            config.data = {};
            config.data.sessionid = session;
        }
        Router.http(config, callback, $http, $location);
    },
    /**
     * Method wrapper
     * @param $http
     * @param $location
     */
    checkAuthorisedSession : function($http,$location){
        Router.checkSession($http, $location, function(res){
            if( angular.isDefined(res.redirect) && $location.url() !== res.redirect && res.isLoggedIn === false ){
                $location.url(res.redirect);
            }
            if( angular.isDefined(res.isLoggedIn) && res.isLoggedIn === true ){
                window.user = res.user;
            }
        });
    }
}
/**
 * Compiler helper
 * @type {Object}
 */
var Compiler = {
    /**
     * Compile overly
     * @constructor
     */
    compileErrorOverly : function(scope,$compile){

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
    compileConfirmOverly : function(scope,$compile){

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




/**
 * Admin controler
 * @param $scope
 * @param $routeParams
 * @param $http
 * @param $location
 * @constructor
 */
function AdminCtrl($scope,$http,$location){


}

/**
 * Login controller
 * @param $scope
 * @param $location
 * @param $http
 * @constructor
 */
function LoginCtrl($scope,$location,$http, $compile){
    $scope.translations = {
        'Username' : 'Username',
        'Password' : 'Password',
        'Enter your username' : 'Enter your username',
        'Enter your password' : 'Enter your password',
        'Login' : 'Login'
    }



    Router.checkSession($http, $location, function(res){
        if( angular.isDefined(res.redirect) && angular.isDefined(res.isLoggedIn) && res.isLoggedIn === true ){
            window.user = res.user;
            $location.url(res.redirect);
        }
    });


    $scope.login = function(){
        var form = document.getElementById("login"),
            username = form.querySelector('input[name="username"]'),
            password = form.querySelector('input[name="password"]');

        /**
         * Login request
         */
        Router.http({
            url : Router.serverAdminUrl($location,"authenticate/login"),
            data :  ({username : username.value, password : password.value})
        }, function(res) {

            if( angular.isDefined(res.data) ){
                CookieHandler.set("sessionid",res.sessionID,1);
                $location.url("/admin");
            }else{
                $scope.title = "Ups something wrong :)";
                $scope.close_button_title = "Close";
                $scope.errors = res.translations;
                $scope.close = function(){
                    angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
                }
                Compiler.compileErrorOverly($scope,$compile);
            }

        }, $http, $location);

    }


}

/**
 * Error ctrl
 * @param $scope
 * @param $location
 * @param $http
 * @constructor
 */
function ErrorCtrl($scope,$location,$http){
    $scope.translations = {
        'Error: 404' : 'Error: 404',
        'Something went terribly wrong, but most likely it is not your fault.' : 'Something went terribly wrong, but most likely it is not your fault.',
        'Open the home page and try to find the information of interest.' : 'Open the home page and try to find the information of interest.',
        'Press the back button in your broswer and then click another link.' : 'Press the back button in your broswer and then click another link.',
        'Admin' : 'Admin'
    }
}


/***
 * Admin menu scope
 * @param $scope
 * @constructor
 */
function AdminMenuCtrl($scope, $http, $location){

    /**
     * Whathever user click check current session
     */
    Router.checkAuthorisedSession($http, $location);
    /**
     * Menu list
     * @type {Array}
     */
    $scope.menu = [
        {
            url : Router.adminUrl('articles'),
            title : 'Articles',
            current : $location.url() === Router.adminUrl('articles')
        },
        {
            url : Router.adminUrl('categories'),
            title : 'Categories',
            current : $location.url() === Router.adminUrl('categories')
        },
        {
            url : Router.adminUrl('users'),
            title : 'Users',
            current : $location.url() === Router.adminUrl('users')
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
        Router.http({
            url:  Router.serverAdminUrl($location,'deletesession'),
            data : ({sid: CookieHandler.get("sessionid") })
        },  function(res) {

            CookieHandler.clear("sessionid");

            if( angular.isDefined(res.redirect) ){
                $location.url(res.redirect);
            }else{
                $location.url("/admin/login");
            }

        }, $http, $location);

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
             if(val.url === Router.adminUrl(current)){
                 val.current = true;
             }
         });
     }




}





/**
 * Categories
 * @param $scope
 * @constructor
 */
function CategoriesCtrl($scope,$http,$location,$compile){

    $scope.submenu  = [
        {
            url : Router.adminUrl('categories/add'),
            title : 'Add category',
            current : $location.url() === Router.adminUrl('categories/add')
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
            Router.http({
                method: 'GET',
                url:  url
            }, function(res){
                if(res.refresh){
                    window.location.reload();
                }
            }, $http, $location);


        }
        $scope.close = function(){
            angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
        }
        Compiler.compileConfirmOverly($scope,$compile);
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

            n.edit_url = Router.adminUrl('categories/add/'+ n._id);
            n.delete_url = Router.serverAdminUrl($location,'categories/delete/'+ n._id);

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
    Router.http({
        method: 'GET',
        url:  Router.serverAdminUrl($location,"categories/list")
    }, function(res){
        if( res.data && res.data.length > 0 ){
            $scope.categories = filter(res.data);
            angular.element( document.querySelector('table.greed tbody .nodata') ).css("display","none");
        }
    }, $http, $location);
}

/**
 * Add categories
 * @param $scope
 * @constructor
 */
function CategoriesAddCtrl($scope,$http,$location,$compile, $routeParams){


    /***
     * Submenu
     * @type {Array}
     */
    $scope.submenu  = [
        {
            url : Router.adminUrl('categories'),
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
    Router.http({
        method: 'GET',
        url:  Router.serverAdminUrl($location,"categories/list")
    }, function(res){
        $scope.categories = res.data;
    }, $http, $location);


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
        Router.http({
                method: 'GET',
                url:  Router.serverAdminUrl($location,"categories/one"),
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
                    Compiler.compileErrorOverly($scope,$compile);
                }

            }, $http, $location);

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
            Router.http({
                url:  Router.serverAdminUrl($location,"categories/save"),
                data: ({title : title.value, short_description : short_description.value, tags: tags.value, parent_category: selected, id: id.value })
            }, function(res) {

                if( angular.isDefined( res.error ) && res.error === false ){
                    $location.url(Router.adminUrl('categories'));
                }else{
                    $scope.title = "Ups something wrong :)";
                    $scope.close_button_title = "Close";
                    $scope.errors = res.translations;
                    $scope.close = function(){
                        angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
                    }
                    Compiler.compileErrorOverly($scope,$compile);
                }

            }, $http, $location);

    }

}


/**
 * Articles
 * @param $scope
 * @constructor
 */
function ArticlesCtrl($scope,$http, $location, $compile){


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

            n.edit_url = Router.adminUrl('articles/add/'+ n._id);
            n.delete_url = Router.serverAdminUrl($location,'articles/delete/'+ n._id);

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
    Router.http({
        method: 'GET',
        url:  Router.serverAdminUrl($location,"articles/list")
    }, function(res){
        if( res.data && res.data.length > 0 ){
            $scope.articles = filter(res.data);
            angular.element( document.querySelector('table.greed tbody .nodata') ).css("display","none");
        }
    }, $http, $location);

    /**
     * Submenu for articles
     * @type {Array}
     */
    $scope.submenu  = [
        {
            url : Router.adminUrl('articles/add'),
            title : 'Add article',
            current : $location.url() === Router.adminUrl('articles/add')
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
            Router.http({
                method: 'GET',
                url:  url
            }, function(res){
                if(res.refresh){
                    window.location.reload();
                }
            }, $http, $location);


        }
        $scope.close = function(){
            angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
        }
        Compiler.compileConfirmOverly($scope,$compile);
    }
}

/***
 * Add add article
 * @param $scope
 * @param $location
 * @param $http
 * @constructor
 */
function ArticlesAddCtrl($scope,$location, $http, $routeParams, $compile){

    /***
     * Submenu
     * @type {Array}
     */
    $scope.submenu  = [
        {
            url : Router.adminUrl('articles'),
            title : 'Articles',
            current : $location.url() === Router.adminUrl('articles/add')
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
        Router.http({
            method: 'GET',
            url:  Router.serverAdminUrl($location,"articles/one"),
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
                Compiler.compileErrorOverly($scope,$compile);
            }

        }, $http, $location);

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

        Compiler.compileErrorOverly($scope,$compile);
    }

    /**

    **/

    /**
     * List categories
     */
    Router.http({
        method: 'GET',
        url:  Router.serverAdminUrl($location,"categories/list")
    }, function(res){
        $scope.categories = res.data;
    }, $http, $location);


    /**
     * Action url
     * @type {String}
     */
    $scope.action_url = Router.serverAdminUrl($location,"articles/save");
    /**
     * Redirect after save
     * @type {String}
     */
    $scope.redirect = Router.absAdminUrl($location,"articles");


}




/**
 * Users
 * @param $scope
 * @constructor
 */
function UsersCtrl($scope,$http, $location){

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

            n.edit_url = Router.adminUrl('users/add/'+ n._id);
            n.delete_url = Router.serverAdminUrl($location,'users/delete/'+ n._id);

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
    Router.http({
        method: 'GET',
        url:  Router.serverAdminUrl($location,"users/list")
    }, function(res){
        if( res && res.data && res.data.length > 0 ){
            $scope.users = filter(res.data);
            angular.element( document.querySelector('table.greed tbody .nodata') ).css("display","none");
        }
    }, $http, $location);






}





/***
 * Articles Submenu
 * @param $scope
 * @param $http
 * @param $location
 * @constructor
 */
function AdminSubmenuCtl($scope,$location){
    $scope.menu = $scope.$parent.submenu;
}