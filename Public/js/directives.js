/**
 * Created by Anton on 21/07/2014.
 */
var surveyDirectives = angular.module('surveyDirectives', []);

surveyDirectives.directive('ngQuestion', function(){
    return {
        restrict: 'A',
        scope: {
            question: '=',
            defanswers: '=',
            qindex: '='
        },
        controller: ["$scope", function($scope)
        {
            $scope.questionInd = $scope.qindex + 1;

            if($scope.question.textEntry)
            {
                $scope.templateURL = "../partials/textanswertemplate.html";
            }
            else //if this is a multiple choice question, handling answers, erc.
            {
                $scope.question.answers = $scope.question.useDefaultAnswers ? $scope.defanswers : $scope.question.customAnswers;
                if ($scope.question.selectMultiple) {
                    $scope.templateURL = "../partials/multianswertemplate.html";
                }
                else {
                    $scope.templateURL = "../partials/singleanswertemplate.html";
                }
            }

        }],
        template: '<div ng-include="templateURL"></div>'

    }
});
