/**
 * Created by Anton on 06/08/2014.
 */
var resultServices = angular.module('resultServices', ['ngResource']);

resultServices.factory('resultService', ['$http', function($http)
{
    resultService = {};
    resultService.resultData = null;

    resultService.authenticate = function(username, password, callback)
    {
        $http(
            {
                url: '/authenticateAdmin',
                method: 'POST',
                data: JSON.stringify({userName: username, password: password}),
                headers: {'Content-Type': 'application/json'}
            }).success(function (data){
                resultService.setUserToken(username, data);
                callback(true);
            }).error(function(data)
            {
                callback(false);
            })
    };

    resultService.setUserToken = function(username, token)
    {
        amplify.store.sessionStorage("resultToken", token);
    };

    resultService.getUserToken = function()
    {
        var token = amplify.store.sessionStorage("resultToken");
        return token;
    };

    resultService.clearUserToken = function()
    {
        amplify.store.sessionStorage("resultToken", null);
    };

    resultService.getResults = function(callback)
    {
        var authToken = resultService.getUserToken();
        if(!authToken)
        {
            callBack(null);
        }
        else
            $http(
                {
                    url: '/results',
                    method: 'GET',
                    headers: {'Content-Type': 'application/json', 'x-user-token' : authToken}
                }).success(function (data){
                    callback(data);
                }).error(function(data)
                {
                    callback(false);
                })
    };

    return resultService;


}]);

