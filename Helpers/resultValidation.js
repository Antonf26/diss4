var surveys = require('../Routes/surveys.js');
var moment = require('moment');

//Perform basic validation on submitted survey result
// This is intentionally not as stringent as the survey and user validation - results validation should be done in the client
// It is preferable to have incomplete results stored rather then rejected to be reviewed anyway
// Returns true if valid and false and an error string if not.
exports.isResultValid = function(result, callback){
    if(!result.surveyID)
    {
        callback(false, "No survey id found");
    }
    else
    {
        var surveyID = result.surveyID;
    }

    surveys.surveyExists(surveyID, function(exists)
    {
        if(!exists)
        {
            callback(false,"Survey with id provided not found");
        }
        else
        {
            if(!result.time)
            {
                callback(false,"No time provided");
            }
            else
            {
                if(moment(result.time).isValid()) //attempts to validate string result against a range of date formats
                {
                    callback(true)
                }
                else
                {
                    callback(false, "Invalid time provided");
                }
            }
        }
    })
};
