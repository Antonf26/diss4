exports.isSurveyValid = function(survey, callback)
{
    try
    {
        var mandatoryAttributes = ['id', 'title']; //checking for any mandatory string fields. Add more to the array to make them mandatory.
        var errors = [];
        for (var i in mandatoryAttributes)
        {
            if(!survey[mandatoryAttributes[i]] || survey[mandatoryAttributes[i]].length == 0 || typeof mandatoryAttributes[i] != 'string')
            {
                errors[errors.length] = "Invalid or missing value for " + mandatoryAttributes[i];
            }
        }

        //Note if default answers have been defined
        var hasDefaultAnswers = false;
        if(survey.defaultAnswers && survey.defaultAnswers.length > 0)
        {
            hasDefaultAnswers = true; //if default answers are defined, check that each has an ID and text //todo: check that ID's are unique
            for(var i in survey.defaultAnswers)
            {
                var ans = survey.defaultAnswers[i];
                if(!ans.id || !ans.answerText || ans.answerText.length == 0 || typeof  ans.answerText != 'string')
                {
                    errors[errors.length] = "Invalid default answer at position " + i;
                }
            }
        }


        if(survey.questions || survey.questions.length > 0) //check if any questions have been defined
        {
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
        if(errors.length>0)
        {
            callback(false, errors);
        }
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
        }
    }
    return questionValidationResult;
};



