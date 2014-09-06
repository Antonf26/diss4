//This directive handles the display of survey questions
var surveyDirectives = angular.module('surveyApp');

surveyDirectives.directive('ngQuestion', function () {
    return {

        restrict: 'A',
        //Declaring variables in the directive scope
        scope: {
            question: '=',
            defanswers: '=',
            qindex: '='
        },
        //controller handles the logic
        controller: ["$scope", function ($scope) {
            $scope.questionInd = $scope.qindex + 1; //Using this to display the question numbers

            $scope.valueChanged = function () {
                if ($scope.question.isRequired) {
                    $scope.question['error'] = false;
                }
            }; //Detecting when a question has been answered, and hiding any errors

            //Handles user selecting a response
            $scope.selectAnswer = function(answer){
                if($scope.question.selectMultiple && $scope.question.selectedAnswer.indexOf(answer) == -1)
                {
                    $scope.question.selectedAnswer.push(answer); //If there can be multiple answers
                }
                else
                {
                    $scope.question.selectedAnswer = answer; //If there's only one
                }
            };

            //Determining which display template to use
            if ($scope.question.textEntry) {
                $scope.templateURL = "../partials/textanswertemplate.html";
            }
            else //if this is a multiple choice question, handling answers, etc.
            {
                $scope.question.answers = $scope.question.useDefaultAnswers ? $scope.defanswers : $scope.question.customAnswers; //Using default answers fro mthe survey of question-specific ones
                $scope.question.selectedAnswer = [];
                //choosing template
                if ($scope.question.selectMultiple) {
                    $scope.templateURL = "../partials/multianswertemplate.html";
                }
                else {
                    $scope.templateURL = "../partials/singleanswertemplate.html";
                }
            }
        }],
        template: '<div ng-include="templateURL"></div>',
        //i.e. replacing the placeholder div for the direcitve with the appropriate template.
        transclude: true

    }

});
