/**
 * File:
 * User: igorivanovic
 * Date: 1/8/13
 * Time: 7:52 PM
 * @copyright : Igor Ivanovic
 */
angular.module('ngView', [], function($routeProvider, $locationProvider) {

    var homeUrl = '/';

    $routeProvider.
        when(homeUrl + 'serach', {
            templateUrl: '/templates/main.html',
            controller: SearchCtrl
        }).
        when(homeUrl + 'error', {
            templateUrl: '/templates/error.html',
            controller: ErrorCtrl
        }).
        when(homeUrl + 'contact', {
            templateUrl: '/templates/contact.html',
            controller: ContactCtrl
        }).
        otherwise({
            path: homeUrl ,
            templateUrl: '/templates/main.html',
            controller: MainListCtrl
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
    serverUrl : function($location,url){

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
    absUrl : function($location,url){
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
    http : function(settings, callback, $http, $location ){

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
                        $location.url(Router.url("error"));
                    }
                });
        }else{
            throw new Error("Url must be entered");
        }



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
    compileOverly : function(scope,$compile){

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
    },
    /**
     * Compile template
     * @param template
     * @param scope
     * @param $http
     * @param $compile
     */
    template : function(template,scope,$http,$compile){
        $http.get(template).success(function(data){
            $compile(angular.element(data))(scope, function(clonedElement) {
                angular.element(document.querySelector("#compiled_data")).html("").append(clonedElement);
            });
            angular.element( document.getElementById("loading") ).css({
                "display" : "none"
            });
        });
    }
}


/**
 * Build Article
 * @param data
 * @return {*}
 */
var buildArticle = function(data){
    if( !data.images ){
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
            c = buildArticle(c);
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



/***
 * All views MainCntl
 * @param $scope
 * @param $route
 * @param $routeParams
 * @param $location
 * @constructor
 */
function MainCntl($scope, $route, $routeParams, $http, $location ) {


    $scope.pageTitle = "Software developer enthusiast - Igor Ivanovic";
    $scope.pageDescription = "I'm able to envision a future that no one else sees and invent things that haven’t been imagined :) ";

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

    Router.http({
        url : Router.serverUrl($location,'categories')
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

    }, $http, $location);


    $scope.sidebar = {
        url : "/templates/sidebar.html"
    }
}


/**
 * Main list ctrl
 * @param $scope
 * @param $routeParams
 * @constructor
 */
function SearchCtrl( $scope, $http, $location, $compile, $rootScope, $routeParams ){


    Router.http({
        method : 'GET',
        url : Router.serverUrl($location,'search'),
        params : {q : $routeParams.q }
    },function(res){


        if( res.data !== null ){
            var rebuilded = rebuild(res.data), scope = $rootScope.$new();
            scope.articles = rebuilded;
            scope.viewMore = "View more";
            Compiler.template( "/templates/list.html", scope, $http, $compile );
        }




        if( (res.data && res.data.length === 0) || res.data === null ){
            angular.element( document.getElementById("nodata") ).css({
                "display" : "block"
            });
        }

    }, $http, $location);

}


/**
 * Main list ctrl
 * @param $scope
 * @param $routeParams
 * @constructor
 */
function MainListCtrl( $scope, $http, $location, $compile, $rootScope ){


    Router.http({
        url : Router.serverUrl($location,'resolve'),
        params : {url : $location.$$url }
    },function(res){

        if( res.listAll && res.listAll === true ){

            var rebuilded = rebuild(res.data), scope = $rootScope.$new();
            scope.articles = rebuilded;
            scope.viewMore = "View more";

            if( res.category && res.category !== null ){
                $scope.$parent.pageDescription  = strip_tags( res.category.short_description );
                $scope.$parent.pageTitle  = strip_tags( res.category.title );
            }


            Compiler.template( "/templates/list.html", scope, $http, $compile );

        }else{
            var scope = $rootScope.$new();
            scope = angular.extend(scope,buildArticle(res.data));

            if( angular.isDefined(scope.youtube) && scope.youtube.length > 5 ){
                scope.youtube = "http://www.youtube.com/embed/" + scope.youtube;
                scope.haveYoutube = true;
            }else{
                scope.haveYoutube = false;
            }

            if( res.data !== null ){
                $scope.$parent.pageDescription  = strip_tags( scope.short_description );
                $scope.$parent.pageTitle  = strip_tags( scope.title );
            }


            Compiler.template( "/templates/article.html", scope, $http, $compile );


        }



        if( res.data && res.data.length === 0 ){
            angular.element( document.getElementById("nodata") ).css({
                "display" : "block"
            });
        }

    }, $http, $location);

}

/**
 * Main side bar
 * @param $scope
 * @param $routeParams
 * @constructor
 */
function MainSideBar($scope, $location){
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

/**
 * Contact me
 * @param $scope
 * @param $location
 * @param $http
 * @param $compile
 * @constructor
 */
function ContactCtrl($scope, $location, $http, $compile, $rootScope){


    var form = document.getElementById("contact_me"),
        name = form.querySelector('[name="name"]'),
        email = form.querySelector('[name="email"]'),
        subject = form.querySelector('[name="subject"]'),
        message = form.querySelector('[name="message"]');

    Router.http({
        url : Router.serverUrl($location,'token')
    }, function(req){
        if(req.token){
            angular.element(form.querySelector('[name="token"]')).val(req.token);
        }
    }, $http, $location);

    $scope.send = function(){


        Router.http({
            method : 'POST',
            url : Router.serverUrl($location,'email'),
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
                Compiler.compileOverly(scope,$compile);
            }else{
                scope.close = function(){
                    angular.element(document.querySelector("#overlay_wrapper")).removeClass("show");
                    $location.url("/");
                }
                Compiler.compileOverly(scope,$compile);
            }
        }, $http, $location);
    }

}
/**
 * Scope translations
 * @param $scope
 * @constructor
 */
function ErrorCtrl($scope){
    $scope.translations = {
        'Error: 404' : 'Error: 404',
        'Something went terribly wrong, but most likely it is not your fault.' : 'Something went terribly wrong, but most likely it is not your fault.',
        'Open the home page and try to find the information of interest.' : 'Open the home page and try to find the information of interest.',
        'Press the back button in your broswer and then click another link.' : 'Press the back button in your broswer and then click another link.',
        'Home' : 'Home'
    }
}