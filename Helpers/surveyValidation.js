var helpers = require('./helpers');

//Performs validation on survey object passed in
exports.isSurveyValid = function(survey, callback)
{
    try
    {
        var mandatoryAttributes = ['id', 'title']; //checking for any mandatory string fields. Add more to the array to make them mandatory.
        var errors = [];
        for (var i in mandatoryAttributes)
        {
            if(!survey[mandatoryAttributes[i]] || survey[mandatoryAttributes[i]].length == 0 || typeof survey[mandatoryAttributes[i]] != 'string')
            {
                errors[errors.length] = "Invalid or missing value for " + mandatoryAttributes[i];
            }
        }

        //Note if default answers have been defined
        var hasDefaultAnswers = false;
        if(survey.defaultAnswers && survey.defaultAnswers.length > 0)
        {
            hasDefaultAnswers = true; //if default answers are defined, check that each has an ID and text
            if(!helpers.attributeIsUnique(survey.defaultAnswers, 'id'))
            {
                errors.push("Duplicate Id's for default answers");
            }
            for(var i in survey.defaultAnswers)
            {
                var ans = survey.defaultAnswers[i];
                if(!ans.id || !ans.answerText || ans.answerText.length == 0 || typeof  ans.answerText != 'string')
                {
                    errors[errors.length] = "Invalid default answer at position " + i;
                }
            }
        }
        if(survey.questions && survey.questions.length > 0) //check if any questions have been defined
        {
            if(!helpers.attributeIsUnique(survey.questions, 'id'))
            {
                errors.push("Duplicate Id's for questions");
            }
            for(var i in survey.questions)
            {
                var questionValidationResult = isValidQuestion(survey.questions[i], hasDefaultAnswers);
                if(!questionValidationResult.isValid)
                {
                    for(var e in questionValidationResult.errors)
                    {
                        errors.push("Error with question at position " + i + ": " + questionValidationResult.errors[e])
                    }
                }
            }
        }
        else
        {
            errors.push("No questions found, at least one question must be defined.");
        }
        if(survey.authenticationFields && survey.authenticationFields.length > 0)
        {
            var invalidFields = survey.authenticationFields.filter(isInvalidAuthenticationField);
            if(invalidFields.length > 0)
            {
                invalidFields.forEach(function(element, index, array)
                {
                    errors.push("Invalid authentication field at position " + index);
                });
            }
            var numberOfPasswordFields = survey.authenticationFields.filter(function(authField)
            {return authField.fieldType.toLowerCase() == 'password';});

            if(numberOfPasswordFields > 1)
            {
                errors.push("Only one authentication field with type 'Password' is allowed");
            }
        }
        if(survey.acceptanceCriteria && survey.acceptanceCriteria.lencth >0)
        {
            survey.acceptanceCriteria.forEach(function(criterion, index, array)
            {
                if(!criterion.consentText || !criterion.consentText.length == 0 || typeof criterion.consentText != 'sting')
                {
                    errors.push("Please provide some text for acceptance criterion at position " + index);
                }
            })
        }

        if(errors.length>0)
        {
            callback(false, errors);
        }
        else
        {
            callback(true);
        }
    }
    catch (Exception)
    {
        console.log(Exception);
        callback(false, ["Parsing error"]);
    }

};

var isValidQuestion = function(question, surveyHasDefaultAnswers)
{
    var questionValidationResult = {};
    questionValidationResult.isValid = true;
    questionValidationResult.errors = [];

    if(!question.id || question.id.length == 0 || typeof question.id != "string")
    {
        questionValidationResult.isValid = false;
        questionValidationResult.errors.push("Invalid or missing question id");
    }
    if(!question.questionText || question.questionText.length == 0 || typeof question.questionText != "string")
    {
        questionValidationResult.isValid = false;
        questionValidationResult.errors.push("Invalid or missing question text.");
    }

    if(question.useDefaultAnswers)
    {
        if(!surveyHasDefaultAnswers)
        {
            questionValidationResult.isValid = false;
            questionValidationResult.errors.push("Question is configured to use default values but none are defined");
        }
        if(question.customAnswers)
        {
            questionValidationResult.isValid = false;
            questionValidationResult.errors.push("Question is configured to use both default and custom answers");
        }
    }
    else if(!question.textEntry) //Unless this question is a text entry one (where respondent types in text), and there are no default answers, custom answers must be defined
    {
        if(!question.customAnswers || question.customAnswers.length == 0)
        {
            questionValidationResult.isValid = false;
            questionValidationResult.errors.push("Question has no answers defined.");
        }
        else //If there are answers, need to check they each have id and text
        {
            for(var i in question.customAnswers)
            {
                var ans = question.customAnswers[i];
                if(!ans.id || !ans.answerText || ans.answerText.length == 0 || typeof  ans.answerText != 'string')
                {
                    questionValidationResult.isValid = false;
                    questionValidationResult.errors.push("Invalid custom answer at position " + i);
                }
            }
            if(!helpers.attributeIsUnique(question.customAnswers, 'id'))
            {
                questionValidationResult.isValid = false;
                questionValidationResult.errors.push("Duplicate answer id's")
            }

        }
    }
    return questionValidationResult;
};


//functions checks the validity of survey authentication fields. True signifies invalid field
var isInvalidAuthenticationField = function(authField) //filter array of authentication fields for any invalid ones
{
    var mandatoryAttributes = ['fieldName', 'fieldLabel', 'fieldType'];
    for (var i in mandatoryAttributes)
    {
        if(!authField[mandatoryAttributes[i]] || authField[mandatoryAttributes[i]].length == 0 || typeof authField[mandatoryAttributes[i]] != 'string') //checking all mandatory attributes are present and strings
        {
            return true;
        }
        var validFieldTypes = ['password', 'text', 'number'];
        if(validFieldTypes.indexOf(authField.fieldType.toLowerCase()) == -1) //if the field type declared is not one of the valid options
        {
            return true;
        }
    }
};






