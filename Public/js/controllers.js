/**
 * Created by Anton on 24/06/2014.
 */

var surveyControllers = angular.module('surveyControllers', []);

surveyControllers.controller('redirectController', [
    '$scope', '$location', 'SurveyResult', 'surveyService',
    function($scope, $location, SurveyResult, surveyService)
    {
        var redirect = function(surveyData)
        {
            if (surveyData.authenticationFields && surveyData.authenticationFields.length > 0)
            {
                $location.url('/login');
                return;
            }
            if (surveyData.acceptanceCriteria && surveyData.acceptanceCriteria.length > 0)
            {
                $location.url('/consent');
                return;
            }
            $location.url('/survey');
        };


        surveyService.getSurveyData($scope.surveyID, redirect);
    }
]);

surveyControllers.controller('loginController', [
    '$scope', '$location', 'SurveyResult', 'surveyService',
    function($scope, $location, SurveyResult, surveyService)
	{



    $scope.handleLogin = function()
    {
        toastr.clear();
        var hasIncomplete = false;
        for(var i in $scope.survey.authenticationFields)
        {
            if($scope.survey.authenticationFields[i].isRequired && !$scope.survey.authenticationFields[i].valueEntered)
            {
                $scope.survey.authenticationFields[i]['error']=true;
                hasIncomplete = true;
            }
            else
            {
                $scope.survey.authenticationFields[i]['error']=false;
            }
        }
        if(hasIncomplete)
        {
            toastr.error("Please complete all required fields");
            return;
        }


        SurveyResult.setSurveyId($scope.survey._id);
        $scope.showError= false;
        surveyService.authenticate($scope.surveyID, $scope.survey.authenticationFields, function(successful, authFields) {
            if (successful)
            {
                SurveyResult.setAuthFields(authFields);
                $location.url('/consent')
            }
            else
            {
                $scope.showError = true;
            }
        });
    };
    surveyService.getSurveyData($scope.surveyID, function(data)
    {
        $scope.survey = data;
        if(!$scope.survey.authenticationFields || $scope.survey.authenticationFields.length == 0) //if there are no authentication fields defined
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
    SurveyResult.hasAuthenticated($scope.surveyID, function(authenticated)
    {
        if (!authenticated)
        {
           // $scope.goToLogin();
        }
    });
    $scope.goToSurvey = function()
    {
        $scope.allCompleted = true;
        if ($scope.survey.acceptanceCriteria && $scope.survey.acceptanceCriteria.length > 0)
        {
            console.log($scope.survey.acceptanceCriteria);
            $scope.survey.acceptanceCriteria.forEach(
            function(crit)
            {
                if(!crit.agreed)
                {
                    $scope.allCompleted = false;
                    crit['error'] = true;
                }

            });
        }
        if ($scope.allCompleted)
        {
            $location.url('/survey');
        }
        else
        {
            toastr.error("You must agree to all the below criteria to proceed");
        }
    };
   surveyService.getSurveyData($scope.surveyID, function(data){
            $scope.survey = data;
            if($scope.survey.requiresAuthentication)
            {
                $scope.goToLogin();
            }
           if(!$scope.survey.acceptanceCriteria || $scope.survey.acceptanceCriteria.length == 0)
                {
                    $scope.goToSurvey();
                }
   });
}]);


surveyControllers.controller('questionController',
    ['$scope', 'SurveyResult', '$location', 'surveyService', '$timeout',
    function($scope, SurveyResult, $location, surveyService, $timeout){

    $scope.progressType = 'info';

	$scope.goToLogin = function()
	{
		$location.url('/login');
	};
    SurveyResult.hasAuthenticated($scope.surveyID, function(authenticated)
    {
        if (!authenticated)
        {
         //   $scope.goToLogin();
        }
    });

    $scope.getNumberAnswered = function()
    {
        if ($scope.survey)
        {
            var numAnswered = $scope.survey.questions.filter(isAnswered).length;
            $scope.progressType = numAnswered == $scope.totalQuestions ? 'success' : 'info';
            return numAnswered;
        }
    };
    $scope.getPercentAnswered = function()
    {
        return $scope.getNumberAnswered()/$scope.totalQuestions * 100;
    };
    var isAnswered = function(question)
    {
        return (question.selectedAnswer && question.selectedAnswer.length!= 0);
    };

    $scope.allAnswered = function()
    {
        return $scope.getNumberAnswered() == $scope.totalQuestions;
    };


    $scope.totalQuestions = 0;

    surveyService.getSurveyData($scope.surveyID, function(data){
        $scope.survey = data;
        $scope.totalQuestions = data.questions.length;
        setBodyMargin();
        $timeout(positionAnswers, 200);
    });
		
    $scope.complete = function()
	{
        toastr.clear();
        var unansweredRequired = new Array();
        for(i in $scope.survey.questions)
        {
            var question = $scope.survey.questions[i];

            if(question.isRequired ) //checking for any unanswered and required questions
            {
                    if (!question.selectedAnswer || question.selectedAnswer.length == 0)
                    {
                        unansweredRequired.push($scope.survey.questions[i].id);
                        $scope.survey.questions[i]["error"] = true;
                    }
            }
        }
        if (unansweredRequired.length > 0)
        {
            scrollToElement('questDiv' + unansweredRequired[0]); //scrolling the page to the first unanswered required question for user clarity
            toastr.error("Please answer all required questions to proceed");
            return;
        }
        SurveyResult.setQuestions($scope.survey.questions);
        var savePromise = SurveyResult.save($scope.surveyID);
        savePromise.success($location.url('/confirmation'));
	};
		
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
        surveyService.getSurveyData($scope.surveyID, function(data){
            $scope.survey = data;
        });
    }
]);


