/**
 * Created by Anton on 06/08/2014.
 */

var resultsControllers = angular.module('resultsControllers', []);

resultsControllers.controller('resultLoginController', ['resultService', '$scope', '$location', function(resultService, $scope, $location){
    $scope.userName = '';
    $scope.password = '';

    $scope.handleLogin = function(){
        resultService.authenticate($scope.userName, $scope.password, function(success)
        {
            if(success)
            {
                $location.url('/result')
            }
            else
            {
                //failed to login
            }
        })
    }
}]);




resultsControllers.controller('resultController', ['resultService', '$scope', '$location', function(resultService, $scope, $location)
{
    resultService.getResults(function(data){
        $scope.Results = JSON.stringify(data);
    });
}]);
