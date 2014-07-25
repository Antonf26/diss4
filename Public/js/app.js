/**
 * Created by Anton on 24/06/2014.
 */

var surveyApp = angular.module('surveyApp', ['ngRoute', 'surveyControllers', 'surveyAppServices', 'services2', 'ngTouch', 'ngAnimate', 'surveyDirectives']);

surveyApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/login', {
            templateUrl: '../partials/login.html',
            controller: 'loginController'})
            .when('/consent', {
                templateUrl: '../partials/consent.html',
                controller: 'consentController'
            })
            .when('/survey', {
                templateUrl:'../partials/survey.html',
                controller: 'questionController'
            }).
            when('/confirmation', {
                templateUrl: '../partials/confirmation.html',
                controller: 'confirmationController'
            })
            .otherwise({redirectTo:'/login'});
         }]);
