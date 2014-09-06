var surveyApp = angular.module('surveyApp');

surveyApp.factory('surveyService', ['$http',
//Service deals with storing and retrieving the survey object
function($http) {
    var survey = {};
    survey.surveyData = null;
    survey.UserToken = null;


    //retrieving survey data from server or local variable
    //when done, function passes survey object to callback function
    survey.getSurveyData = function(surveyID, callback)
    {
        if(survey.surveyData && survey.surveyData._id == surveyID && !survey.surveyData.requiresAuthentication)  //if we already have the data and we've authenticated (or don't need to)
        {
            callback(survey.surveyData);
        }
        else
        {
            survey.retrieve(surveyID).success(function(data) //if not, retrieve it from the server
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
        token = survey.getUserToken(surveyID); //grabbing the token if we have one
        return $http.get('/surveys/' + surveyID, {headers: {'x-access-token' : token}}); //getting survey from the server API
    };

    //Performs survey specifc authentication
    survey.authenticate = function(surveyID, authFields, callback)
    {
        $http(
            {
                url: '/authenticate',
                method: 'POST',
                data: JSON.stringify({surveyID: surveyID, authFields: authFields}),
                headers: {'Content-Type': 'application/json'}
            }).success(function (data){ //If there's a successful response from the server
                survey.setUserToken(surveyID, data.token); //store the token
                callback(true, data.authFields); //notify callback and pass cleaned-up authFields
            }).error(function(data)
            {
                callback(false);
            })
    };

    survey.setUserToken = function(surveyID, token) //Storing token in local variable and session storage (session storage will persist until browser tab is closed)
    {
        survey.UserToken = {surveyID: token};
        amplify.store.sessionStorage("token" + surveyID, token);
    };

    //Retrieving token
    survey.getUserToken = function(surveyID)
    {
      if(survey.UserToken && survey.UserToken.surveyID) //If we have it in a variable
      {
          return survey.UserToken.surveyID;
      }
      else if (amplify.store.sessionStorage("token" + surveyID)) //if not, check if we have it in session storage
      {
          return amplify.store.sessionStorage("token" + surveyID);
      }
      return null;        //if we don't have a token cached or stored
    };

    //Deleting any stored token for the surveyID - i.e. when logging out
    survey.clearUserToken = function(surveyID)
    {
        survey.UserToken = null;
        amplify.store.sessionStorage("token" + surveyID, null);
        survey.clearSurveyData();
    };


    //Deleting any data on the survey we're holding
    survey.clearSurveyData = function()
    {
        survey.surveyData = null;
    };

    return survey;
}]);




//Service handles formatting and submission of completed survey
surveyApp.factory('SurveyResult', ['$http', 'surveyService',
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
        result.authFields = null;
        result.surveyID = '';
        result.questions = [];
		
		//called from controllers to set completed values of the auth fields
        result.setAuthFields = function (authData)
        {
            result.authFields = authData;
            amplify.store(result.getSurveyId(), authData);
        };
        //retrieve stored authentication field data
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

        //getters and setters for portions of the result
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

        //cleaning up the results and posting them to the serverAPI. Return promise object for the http post request
		result.save = function (surveyId){
            var saving = new resultSaver(surveyId,
            new Date(), questionCleaner(this.questions), authFieldCleaner(this.getAuthFields(surveyId)));
            return $http.post('/results', saving);
        };
		
        return result;
    }]);

