var surveyAppServices = angular.module('surveyAppServices', ['ngResource']);

surveyAppServices.factory('surveyService', ['$http',
//Service deals with storing and retrieving the survey object
function($http) {
    var survey = {};
    survey.surveyData = null;
    survey.getSurveyData = function(surveyID, callback)
    {
		if(survey.surveyData && survey.surveyData._id == surveyID)
        {
            callback(survey.surveyData);
        }
        else
        {
            survey.retrieve(surveyID).success(function(data)
                {
                    survey.surveyData = data;
                    callback(data);
                }
                );
        }

    };
    //Performs retrieval of survey from server
    survey.retrieve = function(surveyID)
    {
        console.log(surveyID);
        return $http.get('/surveys/' + surveyID);
    };

    return survey;
}]);



var services2 = angular.module('services2', ['ngResource']);

//Service handles formatting and submission of completed survey
services2.factory('SurveyResult', ['$http',
    function($http) 
	{
        //object that's posted (as JSON) to the back-end holding the survey's results
		var resultSaver = function(ID, Time, Questions, AuthFields)
		{
                this.authFields = AuthFields;
                this.surveyID = ID;
                this.time = Time;
                this.questions = Questions;
        };
		
		//Converts survey questions into the survey results questions: extracts relevant properties, etc.
		//Returns array
        questionCleaner = function(questions)
		{
            var questionResults = [];
            for (var q in questions)
            {
                if (!questions[q].selectMultiple) {
                    questionResults.push(
                        {
                            questionText: questions[q].questionText,
                            selectedAnswer: questions[q].selectedAnswer ? questions[q].selectedAnswer : "Not Answered",
                            questionId: questions[q].id
                        }
                    )
                }
                else
                {
                    var selectedAnswers = questions[q].answers.filter(function(a){return a.selected});
                    questionResults.push(
                        {
                            questionText: questions[q].questionText,
                            selectedAnswer: selectedAnswers ? selectedAnswers : "Not Answered",
                            questionId: questions[q].id
                        }
                    )
                }

            }
            return questionResults;
        };
		
		//Converts survey authentication fields into the format applicable for storing results
        authFieldCleaner = function(authFields){
            var fieldResults = [];
            for (var a in authFields)
            {
                if (authFields[a].valueEntered)
                var r = {};
                r[authFields[a].fieldName] = authFields[a].valueEntered;
                fieldResults.push(r);
            }
            return fieldResults;
        };
		
		// result is the object returned by the service - handles storing, formatting and posting survey results 
		result = {};
		//required fields 
        result.consented = false;
        result.authFields = [];
        result.respondentNumber = 0;
        result.surveyID = '';
        result.questions = [];
        result.authenticated = false; 
		
		//called from controllers to set completed values of the auth fields
        result.setAuthFields = function (authData)
        {
            result.authFields = authData;
            amplify.store(result.surveyID, authData);
            result.authenticated = true; //add some validation here or on controller
            console.log(authData);
        };

        result.getAuthFields = function()
        {
            if(result.authFields)
            {
                return result.authFields;
            }
            else
            {
                return amplify.store(result.getSurveyId());
            }
        };

        result.setRespondentNumber = function (Number) {
            result.respondentNumber = Number;
        };
        
		result.getRespondentNumber = function(){
            return result.respondentNumber;
        };
        
		result.setQuestions = function (Questions) {
            result.questions = Questions;
        };


		result.setSurveyId = function(surveyId){
			result.surveyID = surveyId;
            amplify.store('surveyID', surveyId);
		};

        result.getSurveyId = function()
        {
            return result.surveyID || amplify.store('surveyID');
        }
        
		result.save = function (){
            var saving = new resultSaver(this.surveyID,
            new Date(), questionCleaner(this.questions), authFieldCleaner(this.getAuthFields()));
            return $http.post('/results', saving);
        };
		
        return result;
    }]);
