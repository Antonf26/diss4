/**
 * Created by Anton on 24/06/2014.
 */

var surveyControllers = angular.module('surveyControllers', []);

surveyControllers.controller('loginController', [
    '$scope', '$location', 'SurveyResult', 'surveyService',
    function($scope, $location, SurveyResult, surveyService)
	{

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
    };
    surveyService.getSurveyData($scope.surveyID, function(data){
            $scope.survey = data;
            if(!$scope.survey.authenticationFields || $scope.survey.authenticationFields.length == 0)
            {
                $scope.handleLogin();
            }
        });
}]);


surveyControllers.controller('consentController',
    ['$scope','SurveyResult','$location', 'surveyService',
    function($scope, SurveyResult, $location, surveyService )
	{
    $scope.goToLogin = function()
    {
        $location.url('/login');
    };
    $scope.goToSurvey = function()
    {
        $scope.allCompleted = true;
        if ($scope.survey.acceptanceCriteria && $scope.survey.acceptanceCriteria.length == 0)
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
        if ($scope.allCompleted)
        {
            $location.url('/survey');
        }
        else
        {
            toastr.error("You must agree to all the above criteria to proceed");
        }
    };
   surveyService.getSurveyData($scope.surveyID, function(data){
            $scope.survey = data;
            if (!SurveyResult.getAuthFields() && $scope.survey.authFields && $scope.survey.authFields.length == 0)
               {
                   $scope.goToLogin();
               }
           else if(!$scope.survey.acceptanceCriteria || $scope.survey.acceptanceCriteria.length == 0)
                {
                    $scope.goToSurvey();
                }
   });
}]);


surveyControllers.controller('questionController',
    ['$scope', 'SurveyResult', '$location', 'surveyService',
    function($scope, SurveyResult, $location, surveyService){
	
	$scope.goToLogin = function()
	{
		$location.url('/login');
	};


    surveyService.getSurveyData($scope.surveyID, function(data){
        $scope.survey = data;
        if (!SurveyResult.getAuthFields() && $scope.survey.authFields && $scope.survey.authFields.length == 0)
        {
             $scope.goToLogin();
        }
    });
		
    $scope.complete = function()
	{
        SurveyResult.setQuestions($scope.survey.questions);
        var savePromise = SurveyResult.save();
        savePromise.success($location.url('/confirmation'));
	}
		
	$scope.getAnswers = function(question)
	{
		console.log("getAnswers called");
        return question.useDefaultAnswers ? $scope.survey.defaultAnswers : question.customAnswers;
	}
}]);

surveyControllers.controller('confirmationController', ['$scope', 'surveyService', '$location', 'SurveyResult',
function($scope, surveyService, $location, SurveyResult)
    {
        $scope.goToLogin = function(){
            $location.url('/login');
        };
        surveyService.getSurveyData($scope.surveyID, function(data){
            $scope.survey = data;
            if (!SurveyResult.getAuthFields() && $scope.survey.authFields && $scope.survey.authFields.length == 0)
            {
                $scope.goToLogin();
            }
        });
    }
]);


