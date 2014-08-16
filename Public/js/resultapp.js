/**
 * Created by Anton on 24/06/2014.
 */

var surveyApp = angular.module('resultApp', ['ngRoute', 'ngTouch', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'resultsControllers', 'resultServices']);

surveyApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/login', {
            templateUrl: '../partials/resultLogin.html',
            controller: 'resultLoginController'})
            .when('/result', {
                templateUrl: '../partials/results.html',
                controller: 'resultController'
            })
            .otherwise({redirectTo:'/login'});
         }]);
