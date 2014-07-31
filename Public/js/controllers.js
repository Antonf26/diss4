/**
 * Created by Anton on 24/06/2014.
 */

var surveyControllers = angular.module('surveyControllers', []);

surveyControllers.controller('redirectController', [
    '$scope', '$location', 'SurveyResult', 'surveyService',
    function ($scope, $location, SurveyResult, surveyService) {
        //handles redirection at entry point to the survey
        var redirect = function (surveyData) {
            if (surveyData.authenticationFields && surveyData.authenticationFields.length > 0 || surveyData.requiresAuthentication) //go to login page if we need to authenticate
            {
                $location.url('/login');
                return;
            }
            //if we're logged in or there's no need to authenticate, but there are consent rows that must be agreed to
            if (surveyData.acceptanceCriteria && surveyData.acceptanceCriteria.length > 0) {
                $location.url('/consent');
                return;
            }
            //Otherwise, redirect straight to survey
            $location.url('/survey');
        };

        //retrieves survey data and calls redirect function when done
        surveyService.getSurveyData($scope.surveyID, redirect);
    }
]);

surveyControllers.controller('loginController', [
    '$scope', '$location', 'SurveyResult', 'surveyService',
    function ($scope, $location, SurveyResult, surveyService) {
        //handles login attempts
        $scope.handleLogin = function () {

            toastr.clear();
            //checking required fields for completion
            var hasIncomplete = false;
            for (var i in $scope.survey.authenticationFields) {
                if ($scope.survey.authenticationFields[i].isRequired && !$scope.survey.authenticationFields[i].valueEntered) {
                    $scope.survey.authenticationFields[i]['error'] = true; //used for highlighting the field in the view
                    hasIncomplete = true;
                }
                else {
                    $scope.survey.authenticationFields[i]['error'] = false; //removing the error if they've completed it since the last time they pressed the button
                }
            }
            if (hasIncomplete) {
                toastr.error("Please complete all required fields"); //if there are incomplete required fields, notify the user and don't bother trying to authenticate
                return;
            }


            SurveyResult.setSurveyId($scope.survey._id); //storing the surveyID for the service to use //TODO: check if this is needed
            $scope.showError = false; //hide invalid password error
            surveyService.authenticate($scope.surveyID, $scope.survey.authenticationFields, function (successful, authFields) { //async call to authentication service
                if (successful) {
                    SurveyResult.setAuthFields(authFields); //if authentication was successful, store the non-password fields
                    $location.url('/consent');   //and move forward
                }
                else {
                    $scope.showError = true; //inform user of failed authentication
                }
            });
        };

        surveyService.getSurveyData($scope.surveyID, function (data) {
            $scope.survey = data;
            if (!$scope.survey.requiresAuthentication) //if there are no authentication fields defined or we're already authenticated
            {
                $location.url('/consent');
            }
        });
    }]);

surveyControllers.controller('consentController',
    ['$scope', 'SurveyResult', '$location', 'surveyService',
        function ($scope, SurveyResult, $location, surveyService) {
            $scope.goToLogin = function () //function to redirect to login
            {
                $location.url('/login');
            };

            $scope.logout = function()
            {
                surveyService.clearUserToken($scope.surveyID);
                surveyService.clearSurveyData();
                $scope.goToLogin();
            };
            $scope.goToSurvey = function () //handles attempt by user to proceed
            {
                toastr.clear();
                $scope.allCompleted = true;
                if ($scope.survey.acceptanceCriteria && $scope.survey.acceptanceCriteria.length > 0) //checking for criteria that were not agreed to
                {
                    $scope.survey.acceptanceCriteria.forEach(
                        function (criterion) {
                            if (!criterion.agreed) {
                                $scope.allCompleted = false;
                                criterion['error'] = true; //setting error attribute to enable styling highlighting
                            }
                        });
                }
                if ($scope.allCompleted) {
                    $location.url('/survey');  //moving to the survey if we're happy
                }
                else {
                    toastr.error("You must agree to all the below criteria to proceed"); //notifying the user
                }
            };
            surveyService.getSurveyData($scope.surveyID, function (data) {
                $scope.survey = data; //one the survey has been retrieved
                if ($scope.survey.requiresAuthentication) {
                    $scope.goToLogin(); //login if need to
                }
                if (!$scope.survey.acceptanceCriteria || $scope.survey.acceptanceCriteria.length == 0) {
                    $scope.goToSurvey(); //if there's no consent items but we've somehow ended up here (shouldn't happen except for user doing it manually as this check is performed in the redirection controller
                }
            });
        }]);


surveyControllers.controller('questionController',
    ['$scope', 'SurveyResult', '$location', 'surveyService', '$timeout',
        function ($scope, SurveyResult, $location, surveyService, $timeout) {

            $scope.progressType = 'info'; //used to style the progress bar
            $scope.goToLogin = function () //function to return to the login screen
            {
                $location.url('/login');
            };
            $scope.logout = function()
            {
                surveyService.clearUserToken($scope.surveyID);
                surveyService.clearSurveyData();
                $scope.goToLogin();
            };
            $scope.getNumberAnswered = function () //returns the number of questions answered (used to operate the progress bar)
            {
                if ($scope.survey) {
                    var numAnswered = $scope.survey.questions.filter(isAnswered).length;
                    $scope.progressType = numAnswered == $scope.totalQuestions ? 'success' : 'info'; //if all questions are answered, re-styling the progress bar
                    return numAnswered;
                }
            };

            $scope.getPercentAnswered = function ()  //convert the number of questions answered into a percentage. Workaround for bug with angular-ui-boostrap progress bar that doesn't allow changing values for max
            {
                return $scope.getNumberAnswered() / $scope.totalQuestions * 100;
            };

            var isAnswered = function (question) //checks if a question has been answered
            {
                return (question.selectedAnswer && question.selectedAnswer.length != 0);
            };

            $scope.totalQuestions = 0; //holds the total number of questions

            surveyService.getSurveyData($scope.surveyID, function (data) { //retrievig the survey
                if (data.requiresAuthentication) //redirect to login if needed
                {
                    $scope.goToLogin();
                }
                $scope.survey = data;
                $scope.totalQuestions = data.questions.length;
                setBodyMargin(); //jquery helper that adjust the bottom margin of the body to show the footer
                $timeout(positionAnswers, 200); //jquery helper that positions answers horizontally or vertically depending on length and available width. Timer is a workaround to ensure DOM is populated
            });

            $scope.complete = function ()  //when the user has pressed "Submit"
            {
                toastr.clear();
                var unansweredRequired = [];
                for (var i in $scope.survey.questions) {
                    var question = $scope.survey.questions[i];

                    if (question.isRequired) //checking for any unanswered and required questions
                    {
                        if (!isAnswered(question)) {
                            unansweredRequired.push($scope.survey.questions[i].id);  //these two used for styling and display of required questions that haven't been answered
                            $scope.survey.questions[i]["error"] = true;
                        }
                    }
                }
                if (unansweredRequired.length > 0) {
                    scrollToElement('questDiv' + unansweredRequired[0]); //scrolling the page to the first unanswered required question for user clarity
                    toastr.error("Please answer all required questions to proceed");
                    return;
                }
                SurveyResult.setQuestions($scope.survey.questions); //storing questions in the appropriate service
                var savePromise = SurveyResult.save($scope.surveyID); //submitting the survey
                savePromise.success($location.url('/confirmation')); //if successful, moving on to confirmation page
                savePromise.fail(toastr.error("Something went wrong, please try again"));
            };
        }]);

surveyControllers.controller('confirmationController', ['$scope', 'surveyService', '$location',
    function ($scope, surveyService, $location)
        //controller displays confirmation message from survey
    {
        $scope.goToLogin = function () {
            $location.url('/login');
        };
        surveyService.getSurveyData($scope.surveyID, function (data) {
            if (data.requiresAuthentication) {
                $scope.goToLogin();
            }
            $scope.survey = data;
        });
    }
]);


