/**
 * Created by Anton on 21/07/2014.
 */
var surveyDirectives = angular.module('surveyDirectives', []);

surveyDirectives.directive('ngQuestion', function () {

    return {
        restrict: 'A',
        scope: {
            question: '=',
            defanswers: '=',
            qindex: '='

        },
        controller: ["$scope", function ($scope) {
            $scope.questionInd = $scope.qindex + 1;

            $scope.valueChanged = function () {
                if ($scope.question.isRequired) {
                    $scope.question['error'] = false;
                }
            };

            $scope.selectAnswer = function(answer){
                if($scope.question.selectMultiple && $scope.question.selectedAnswer.indexOf(answer) == -1)
                {
                    $scope.question.selectedAnswer.push(answer);
                }
                else
                {
                    $scope.question.selectedAnswer = answer;
                }
            }

            if ($scope.question.textEntry) {
                $scope.templateURL = "../partials/textanswertemplate.html";
            }
            else //if this is a multiple choice question, handling answers, etc.
            {
                $scope.question.answers = $scope.question.useDefaultAnswers ? $scope.defanswers : $scope.question.customAnswers;
                $scope.question.selectedAnswer = [];
                if ($scope.question.selectMultiple) {
                    $scope.templateURL = "../partials/multianswertemplate.html";
                }
                else {
                    $scope.templateURL = "../partials/singleanswertemplate.html";
                }
            }
        }],
        template: '<div ng-include="templateURL"></div>',
        transclude: true

    }

});
