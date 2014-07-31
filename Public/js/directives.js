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
        controller: ["$scope", '$timeout', function ($scope, $timeout) {
            $scope.questionInd = $scope.qindex + 1;

            $scope.valueChanged = function () {
                if ($scope.question.isRequired) {
                    $scope.question['error'] = false;
                }
            };

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
