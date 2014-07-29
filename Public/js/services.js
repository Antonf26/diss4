var surveyAppServices = angular.module('surveyAppServices', ['ngResource']);

surveyAppServices.factory('surveyService', ['$http',
//Service deals with storing and retrieving the survey object
function($http) {
    var survey = {};
    survey.surveyData = null;
    survey.UserToken = null;

    survey.getSurveyData = function(surveyID, callback)
    {
		if(survey.surveyData && survey.surveyData._id == surveyID && !survey.surveyData.requiresAuthentication)  //if we already have the data and we've authenticated
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
        token = survey.getUserToken(surveyID);

        return $http.get('/surveys/' + surveyID, {headers: {'x-access-token' : token}});
    };

    survey.authenticate = function(surveyID, authFields, callback)
    {
        $http(
            {
                url: '/authenticate',
                method: 'POST',
                data: JSON.stringify({surveyID: surveyID, authFields: authFields}),
                headers: {'Content-Type': 'application/json'}
            }).success(function (data){
                survey.setUserToken(surveyID, data.token);
                callback(true, data.authFields);
            }).error(function(data)
            {
                callback(false);
            })
    };

    survey.setUserToken = function(surveyID, token)
    {
        survey.UserToken = {surveyID: token};
        amplify.store.sessionStorage("token" + surveyID, token);
    };

    survey.getUserToken = function(surveyID)
    {
      if(survey.UserToken && survey.UserToken.surveyID)
      {
          return survey.UserToken.surveyID;
      }
      else if (amplify.store.sessionStorage("token" + surveyID))
      {
          return amplify.store.sessionStorage("token" + surveyID);
      }
      return null;        //if we don't have a token cached or stored
    };


    return survey;
}]);



var services2 = angular.module('services2', ['ngResource']);

//Service handles formatting and submission of completed survey
services2.factory('SurveyResult', ['$http', 'surveyService',
    function($http, surveyService)
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
                    questionResults.push(
                        {
                            questionText: questions[q].questionText,
                            selectedAnswer: questions[q].selectedAnswer ? questions[q].selectedAnswer : "Not Answered",
                            questionId: questions[q].id
                        }
                    )
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
        result.authFields = null;
        result.respondentNumber = 0;
        result.surveyID = '';
        result.questions = [];
        result.authenticated = false; 
		
		//called from controllers to set completed values of the auth fields
        result.setAuthFields = function (authData)
        {
            result.authFields = authData;
            amplify.store(result.getSurveyId(), authData);
            result.authenticated = true; //add some validation here or on controller
            console.log(authData);
        };

        result.getAuthFields = function(surveyId)
        {
            if(result.authFields)
            {
                return result.authFields;
            }
            else
            {
                return amplify.store(surveyId);
            }
        };

        result.hasAuthenticated = function(surveyID, callback)
        {
            //check if we need to authenticate
            surveyService.getSurveyData(surveyID, function(data)
        {
            var surveyData = data;
            if (!surveyData.authenticationFields || surveyData.authenticationFields.length == 0)
            {
                callback(true); //no need for authentication
                return;
            }
            var authFields = result.getAuthFields(surveyID);
            if (!authFields || authFields.length != surveyData.authenticationFields.length)
            {
                callback(false);
                return;
            }
            else
            {
                callback(true);
                return;
            }
        });
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
        };
        
		result.save = function (surveyId){
            var saving = new resultSaver(surveyId,
            new Date(), questionCleaner(this.questions), authFieldCleaner(this.getAuthFields(surveyId)));
            return $http.post('/results', saving);
        };
		
        return result;
    }]);

