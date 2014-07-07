/**
 * Created by Anton on 24/06/2014.
 */

var surveyControllers = angular.module('surveyControllers', []);

surveyControllers.controller('loginController', [
    '$scope', '$location', 'SurveyResult', 'surveyService',
    function($scope, $location, SurveyResult, surveyService)
	{
        surveyService.getSurveyData($scope.surveyID, function(data){
            $scope.survey = data;
        });
    $scope.handleLogin = function()
    {
        toastr.clear();
        for(var i in $scope.survey.authenticationFields)
        {
            if($scope.survey.authenticationFields[i].isRequired && !$scope.survey.authenticationFields[i].valueEntered)
            {
                toastr.error("Please complete all required fields");
                return;
            }
        }

        SurveyResult.setSurveyId($scope.survey._id);
		SurveyResult.setAuthFields($scope.survey.authenticationFields);
        $location.url('/consent')
    }
}]);


surveyControllers.controller('consentController',
    ['$scope','SurveyResult','$location', 'surveyService',
    function($scope, SurveyResult, $location, surveyService )
	{	
	if (!SurveyResult.getAuthFields())
    {
       $scope.goToLogin();
    }
    surveyService.getSurveyData($scope.surveyID, function(data){
        $scope.survey = data;
    });
    $scope.goToLogin = function(){
        $location.url('/login');
    };
    $scope.goToSurvey = function()
    {
        $scope.allCompleted = true;
        if ($scope.survey.acceptanceCriteria)
        {
            console.log($scope.survey.acceptanceCriteria);
            $scope.survey.acceptanceCriteria.forEach(
            function(crit)
            {
                if(!crit.agreed)
                {
                    $scope.allCompleted = false;
                }

            });
        }
        console.log($scope.allCompleted);
        if ($scope.allCompleted)
        {
            $location.url('/survey');
        }
        else
        {
            toastr.error("You must agree to all the above criteria to proceed");
        }
    };
}]);


surveyControllers.controller('questionController',
    ['$scope', 'SurveyResult', '$location', 'surveyService',
    function($scope, SurveyResult, $location, surveyService){
	
	$scope.goToLogin = function()
	{
		$location.url('/login');
	};
	if (!SurveyResult.getAuthFields())
	{
		$scope.goToLogin();
	}

    surveyService.getSurveyData($scope.surveyID, function(data){
        $scope.survey = data;
    });
		
    $scope.complete = function()
	{
        SurveyResult.setQuestions($scope.survey.questions);
        var savePromise = SurveyResult.save();
        savePromise.success($location.url('/confirmation'));
	}
		
	$scope.getAnswers = function(question)
	{
		return question.useDefaultAnswers ? $scope.survey.defaultAnswers : question.customAnswers;
	}
}]);

surveyControllers.controller('confirmationController', ['$scope', 'surveyService', '$location', 'SurveyResult',
function($scope, surveyService, $location, SurveyResult)
    {
        $scope.goToLogin = function(){
            $location.url('/login');
        };
        if (!SurveyResult.getAuthFields())
        {
            $scope.goToLogin();
        }
        surveyService.getSurveyData($scope.surveyID, function(data){
            $scope.survey = data;
        });
    }
]);


