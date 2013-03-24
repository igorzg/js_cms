/**
 * Set base
 */
(function(){
    var base = document.createElement("base");
    base.setAttribute("href", location.protocol+"//"+location.hostname);
    var head = document.getElementsByTagName("head")[0];
    head.insertBefore(base,head.firstChild);
}());


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
 * Build Article
 * @param data
 * @return {*}
 */
var buildArticle = function(data){
    if(data === null){
        return {};
    }

    if( data.images === undefined ){
        data.images = [];
    }
    if( data.image && data.image.length > 0 ){
        data.images.push({
            src : "/static/images/" + data._id + "/" + data.image,
            title : data.title
        });
    }
    data.hasImagesClass = data.images.length === 0 ?  "hide" : "";
    return data;
}

/**
 * Rebuild data
 * @param data
 * @return {*}
 */
var rebuild = function(data){

    if( data ){
        var i, c,len = data.length;
        for(i = 0; i < len; ++i){
            c = data[i];
            if( c ){
                c = buildArticle(c);
            }

        }
        return data;
    }
    return null;
}


var strip_tags = function(input, allowed) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}

/**
 * File:
 * User: igorivanovic
 * Date: 1/8/13
 * Time: 7:52 PM
 * @copyright : Igor Ivanovic
 */
var ngModule = angular.module('SimpleCMS', [], function($routeProvider, $locationProvider) {

    var homeUrl = '/';

    $routeProvider.
        when(homeUrl + 'serach', {
            templateUrl: '/templates/main.html',
            controller: 'SearchCtrl'
        }).
        when(homeUrl + 'error', {
            templateUrl: '/templates/error.html',
            controller: 'ErrorCtrl'
        }).
        when(homeUrl + 'contact', {
            templateUrl: '/templates/contact.html',
            controller: 'ContactCtrl'
        }).
        otherwise({
            path: homeUrl ,
            templateUrl: '/templates/main.html',
            controller: 'MainListCtrl'
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

        /**
         * Port
         */
        port : 10350,
        /**
         * Create server admin url
         * @param $location
         * @param url
         * @return {String}
         */
        serverUrl : function(url){

            var str = "";
            if( angular.isString(url) ){
                str += url;
            }
            return $location.$$protocol + "://" + $location.$$host + ":"+this.port+"/" + str;
        },
        /**
         * Create Admin url
         * @param $location
         * @param url
         * @return {String}
         */
        absUrl : function(url){
            var str = "";
            if( angular.isString(url) ){
                str += url;
            }
            return $location.$$protocol + "://" + $location.$$host + "/" + str;
        },
        /**
         * Create Admin url
         * @param $location
         * @param url
         * @return {String}
         */
        url : function(url){
            var str = "";
            if( angular.isString(url) ){
                str += url;
            }
            return "/" + str;
        },
        /**
         * Post data
         * @param $http
         * @param $location
         * @param callback
         */
        http : function(settings, callback){
            var self = this;
            var config = {
                method: 'GET',
                url:  null,
                dataType: "json",
                withCredentials : true,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            };

            config = angular.extend(config,settings);



            if( config.url !== null ){
                $http(config)
                    .success(callback)
                    .error(function() {
                        if( $location.$$url !== "/error" ){
                            $location.url(self.url("error"));
                        }
                    });
            }else{
                throw new Error("Url must be entered");
            }



        },
        /**
         * Creating snapshot
         * SEO handling
         */
        snapshot : function(){
            var self = this;
            var html = angular.element(document.documentElement).html();
            var name = location.pathname;
            self.http({
                method : "POST",
                url : self.serverUrl("snapshot"),
                data:  {html : "<!DOCTYPE html>"+html, name : name}
            }, function(data){
                $http.get(data.snapshot + "#!");
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
ngModule.factory('compileFactory', ['$http','$compile','$location','routerFactory', function($http, $compile,$location, routerFactory) {



    /**
     * Return public data
     */
    return {

        /**
         * Set error controller
         * @param controllerName
         */
        compileOverly : function(scope) {
            var templateHTML = '<div id="overlay_bg" ng-click="close()"></div>';
            templateHTML += '<div id="overlay">';
            templateHTML += '<div class="title">{{title}}</div>';
            templateHTML += '<ul>';
            templateHTML += '<li ng-repeat="item in messages">{{item}}</li>';
            templateHTML += '</ul>';
            templateHTML += '<button class="button blackglossyCSSButtonbutton" ng-click="close()">{{close_button_title}}</button>';
            templateHTML += '</div>';

            $compile(angular.element(templateHTML))(scope, function(clonedElement, scope) {
                angular.element(document.querySelector("#overlay_wrapper")).addClass("show").html("").append(clonedElement);
            });
        },

        /**
         * Set error controller
         * @param controllerName
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
        },

        /**
         * Inject string tample
         * @param template
         */
        template : function(template,scope){
            $http.get(template).success(function(data){
                $compile(angular.element(data))(scope, function(clonedElement) {
                    angular.element(document.querySelector("#compiled_data")).html("").append(clonedElement);
                    setTimeout(function(){
                        routerFactory.snapshot();
                    },0);
                });
                angular.element( document.getElementById("loading") ).css({
                    "display" : "none"
                });
            });
        }
    }
}]);






/***
 * All views MainCntl
 * @param $scope
 * @param $route
 * @param $routeParams
 * @param $location
 * @constructor
 */


ngModule.controller(
    'MainCntl',
    function ($scope, routerFactory) {



        $scope.$me = {
            about : [
                "This is my personal wall :)",
                "What i do know?",
                "Javascript, PHP, MYSQL, MongoDB, HTML 5, Node",
                "How i developed this ?",
                "Angular.js, MongoDb, Node.js"
            ],
            headText : 'Software engineer at',
            company : "Nivas",
            url : "http://www.nivas.hr",
            image : {
                url : "/css/images/me.jpg",
                width : 150,
                height : 150
            },
            copy : {
                text : "Copyright: Igor Ivanovic, " + new Date().getFullYear()
            }
        };



        $scope.$menu = [];

        routerFactory.http({
            url : routerFactory.serverUrl('categories')
        },function(res){

            var len, i, current, n = [ {
                url : '/',
                title : 'Home'
            }];

            if(res.data !== null){

                len = res.data.length;

                for(i = 0; i < len; ++i){
                    current = res.data[i];
                    n.push({
                        url : current.url,
                        title : current.title
                    });
                }

            }

            /**
             * Github
             */
            n.push({
                url : 'https://github.com/igorzg/js_cms',
                title : 'Github',
                blank : true
            });

            /**
             * Contact must be last
             */
            n.push({
                url : '/contact',
                title : 'Contact'
            });

            $scope.$menu = n;

        });


        $scope.sidebar = {
            url : "/templates/sidebar.html"
        }
    }
);


/**
 * Main list ctrl
 * @param $scope
 * @param $routeParams
 * @constructor
 */
ngModule.controller(
    'SearchCtrl',
    function( $scope,  $rootScope, $routeParams, routerFactory, compileFactory){


        var desc = document.querySelector('meta[name=description]');
        angular.element(desc).attr('content', 'This cms is written in javascript. It use mongodb for database, nodejs (express) for server processing and angularjs for dom manipulation.' );
        document.title = 'Software technology enthusiast - Igor Ivanovic';

        routerFactory.http({
            method : 'GET',
            url : routerFactory.serverUrl('search'),
            params : {q : $routeParams.q }
        },function(res){


            if( res.data !== null ){
                var rebuilded = rebuild(res.data), scope = $rootScope.$new();
                scope.articles = rebuilded;
                scope.viewMore = "View more";
                compileFactory.template( "/templates/list.html", scope );
            }


            if( (res.data && res.data.length === 0) || res.data === null ){
                angular.element( document.getElementById("nodata") ).css({
                    "display" : "block"
                });
            }

        });

    }
);

/**
 * Main list ctrl
 * @param $scope
 * @param $routeParams
 * @constructor
 */
ngModule.controller(
    'MainListCtrl',
    function( $scope,   $rootScope, compileFactory, routerFactory, $location ){

           var title = 'Software technology enthusiast - Igor Ivanovic';
           var mainTtitle = function(){
               var desc = document.querySelector('meta[name=description]');
               angular.element(desc).attr('content', 'This cms is written in javascript. It use mongodb for database, nodejs (express) for server processing and angularjs for dom manipulation.' );
               document.title = title;
           }

        routerFactory.http({
                url : routerFactory.serverUrl('resolve'),
                params : {url : $location.$$url }
            },function(res){

                if( res.listAll && res.listAll === true ){

                    var rebuilded = rebuild(res.data), scope = $rootScope.$new();
                    scope.articles = rebuilded;
                    scope.viewMore = "View more";

                    if( res.category && res.category !== null ){

                        var desc = document.querySelector('meta[name=description]');
                        angular.element(desc).attr('content', strip_tags( res.category.short_description ) );
                        document.title = strip_tags(  res.category.title )  + ' - ' + title;
                    }else{
                        mainTtitle();
                    }


                    compileFactory.template( "/templates/list.html", scope );

                }else{
                    var scope = $rootScope.$new();
                    scope = angular.extend(scope,buildArticle(res.data));

                    if( angular.isDefined(scope.youtube) && scope.youtube.length > 5 ){
                        scope.youtube = "https://www.youtube.com/embed/" + scope.youtube;
                        scope.haveYoutube = true;
                    }else{
                        scope.haveYoutube = false;
                    }

                    if( res.data !== null ){
                        var desc = document.querySelector('meta[name=description]');
                        angular.element(desc).attr('content', strip_tags( scope.short_description ) );
                        document.title = strip_tags( scope.title )  + ' - ' + title;
                    }else{
                        mainTtitle();
                    }



                    compileFactory.template( "/templates/article.html", scope );


                }




                if( res.data && res.data.length === 0 ){
                    angular.element( document.getElementById("nodata") ).css({
                        "display" : "block"
                    });
                }

            });

    }
);
/**
 * Main side bar
 * @param $scope
 * @param $routeParams
 * @constructor
 */
ngModule.controller(
    'MainSideBar',
    function ($scope){
        $scope.translations = {
            title : "Search",
            placeholder : "Angular Js"
        }
        $scope.social = {
            title : "Networks",
            data : [
                {
                    text : "Twitter",
                    src : "/css/images/social.png",
                    url : "https://twitter.com/igorzg1987",
                    x : 0,
                    y : 0,
                    w : 50,
                    h : 50
                },
                {
                    text : "Facebook",
                    url : "http://www.facebook.com/igorzg",
                    src : "/css/images/social.png",
                    x : -50,
                    y : 0,
                    w : 50,
                    h : 50
                },
                {
                    text : "Linkedin",
                    url : "http://www.linkedin.com/in/igorivanoviczg",
                    src : "/css/images/social.png",
                    x : -150,
                    y : 0,
                    w : 50,
                    h : 50
                },
                {
                    text : "Google +",
                    url : "https://plus.google.com/108595989864480449672",
                    src : "/css/images/social.png",
                    x : -100,
                    y : 0,
                    w : 50,
                    h : 50
                }

            ]
        }

        /**
         * Search
         * @param event
         */
        $scope.search = function(event){
            var parent = angular.element(event.target).parent()[0];
            parent.submit();
        }

        /**
         * Return query variable
         * @param variable
         * @return {*}
         */
        function getQuery(variable) {
            var query = window.location.search.substring(1);
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) == variable) {
                    return decodeURIComponent(pair[1]);
                }
            }

            return null;
        }


        $scope.query = getQuery("q");

    }
);
/**
 * Contact me
 * @param $scope
 * @param $location
 * @param $http
 * @param $compile
 * @constructor
 */
ngModule.controller(
    'ContactCtrl',
    function ($scope, $rootScope,  compileFactory, routerFactory){


        var desc = document.querySelector('meta[name=description]');
        angular.element(desc).attr('content', 'This cms is written in javascript. It use mongodb for database, nodejs (express) for server processing and angularjs for dom manipulation.' );
        document.title = 'Software technology enthusiast - Igor Ivanovic';


        var form = document.getElementById("contact_me"),
            name = form.querySelector('[name="name"]'),
            email = form.querySelector('[name="email"]'),
            subject = form.querySelector('[name="subject"]'),
            message = form.querySelector('[name="message"]');

        routerFactory.http({
            url : routerFactory.serverUrl('token')
        }, function(req){
            if(req.token){
                angular.element(form.querySelector('[name="token"]')).val(req.token);
            }
        });

        $scope.send = function(){


            routerFactory.http({
                method : 'POST',
                url : routerFactory.serverUrl('email'),
                data : ({
                    message : message.value,
                    subject : subject.value,
                    email : email.value,
                    name : name.value,
                    token : form.querySelector('[name="token"]').value
                })
            },function(res){
                var scope = $rootScope.$new();
                scope = angular.extend(scope,res);

                if(scope.error){
                    scope.close = function(){
                        angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
                    }
                    compileFactory.compileOverly(scope);
                }else{
                    scope.close = function(){
                        angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
                        $location.url("/");
                    }
                    compileFactory.compileOverly(scope);
                }
            });
        }

        setTimeout(function(){
            routerFactory.snapshot();
        },0);

    }
);
/**
 * Scope translations
 * @param $scope
 * @constructor
 */
ngModule.controller(
    'ErrorCtrl',
    function($scope){

        var desc = document.querySelector('meta[name=description]');
        angular.element(desc).attr('content', 'This cms is written in javascript. It use mongodb for database, nodejs (express) for server processing and angularjs for dom manipulation.' );
        document.title = 'Software technology enthusiast - Igor Ivanovic';


        $scope.translations = {
            'Error: 404' : 'Error: 404',
            'Something went terribly wrong, but most likely it is not your fault.' : 'Something went terribly wrong, but most likely it is not your fault.',
            'Open the home page and try to find the information of interest.' : 'Open the home page and try to find the information of interest.',
            'Press the back button in your broswer and then click another link.' : 'Press the back button in your broswer and then click another link.',
            'Home' : 'Home'
        }

        setTimeout(function(){
            routerFactory.snapshot();
        },0);
    }
);