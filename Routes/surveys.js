
var config = require('../config');
var dbConn = require('../Helpers/dbConn');
var jsonWebToken = require('jwt-simple');
var moment = require('moment');
var cryptoHelper = require('../Helpers/cryptoHelper');
var surveyValidation = require('../Helpers/surveyValidation');
var userValidation = require('../Helpers/userValidation');


//Returns all surveys
exports.findAll = function(req,res){
    dbConn.db.collection('surveys', function(err, collection){
        collection.find().toArray(function(err,items){
            res.send(items);
        });
    });
};

//Finds survey in DB based on ID provided in the request parameters, sends it on the response
exports.findById = function(req, res){
    var id = req.params.id.toUpperCase();
    console.log("get survey" + id);
    //setting headers to avoid IE never refreshing the data once it's cached a response
    res.setHeader("Expires", "-1");
    res.setHeader("Cache-Control", "must-revalidate, private");
    dbConn.db.collection('surveys', function(err,collection){
        collection.findOne({'_id':id}, function(err, item){
            if (err || !item)
            {
                res.send(404, 'Survey with ID ' + id + ' not found');
                return;
            }
            if (!item.authenticationFields || item.authenticationFields.length == 0) //if there are no authentication fields, no need to bother with the tokens
            {
                res.send(item);
                return;
            }
            var authenticated = false;
            var token = req.headers['x-access-token'];
            if(token)
            {
                try
                {
                    var decodedToken = jsonWebToken.decode(token, config.web.tokenSecret);
                    if (decodedToken.sub.toUpperCase() == id && moment() <= decodedToken.exp)
                    {
                        authenticated = true;
                    }
                }
                catch (exception)
                {
                    authenticated = false;
                }
            }
            if (authenticated) //If the user is authenticated(hold a valid token, send the full survey object
            {
                res.send(item);
            }
            else //this will be sent when there's no token and the survey requires authentication. This contains only introductory information
            {
                res.send(createAuthOnlySurvey(item));
            }
        });
    });
};

//Adds survey to DB (JSON must be provided in body)
exports.addSurvey = function(req,res){
    var survey = req.body;

    surveyValidation.isSurveyValid(survey, function(isValid, errors){ //Performing validation of the object provided
    if(isValid)
    {
        if(!survey._id && survey.id && typeof survey.id == 'string')
        {
            survey._id = survey.id; //ensuring the right type of id field is used for mongoDB
        }
        survey._id = survey._id.toUpperCase(); //ensuring all ID's are uppercase;

        dbConn.db.collection('surveys', function (err, collection) {
            collection.insert(survey, {safe: true},
                function (err, result) {
                    if (err)
                    {
                        if(err.code = 11000) //Mongo driver error code for "Can't insert duplicate"
                        {
                            res.status(400).send('Can\'t insert survey with duplicate id');
                            return;
                        }
                        res.status(400).send({'error': 'An error has occurred'});
                        return;
                    }
                    else {
                        res.status(201).send("Created");  //If all goes well
                        return;
                    }
                })
        })
    }
    else
    {
        res.status(400);
        for(var i in errors)
        {
            res.write(errors[i] + "\n");  //Returning all problems found in the response;
        }
        res.end();
    }
    });
};


//Updates existing survey with the object provided in the database
exports.updateSurvey = function(req,res)
{
    try
    {
        var survey = req.body;
        var id = req.params.id.toUpperCase();
        dbConn.db.collection('surveys', function(err, collection)
        {
            collection.count({'_id':id},
                function(err, count){
                    if (err)
                    {
                        res.send('error ' + err);
                    }
                    else if (!count)
                    {
                        exports.addSurvey(req); //add the Survey as the id doesn't exist
                    }
                    else
                    {
                        surveyValidation.isSurveyValid(survey, function(isValid, errors){
                            if (isValid) {
                                if (!survey._id && survey.id && typeof survey.id == 'string') {
                                    survey._id = survey.id; //ensuring the right type of id field is used for mongoDB
                                }
                                collection.update({'_id': id}, survey, function (err, result) {
                                    if (err) {
                                        res.status(400).send("Error updating survey");
                                    }
                                    else {
                                        res.status(200).send("Survey Updated");
                                    }
                                });
                            }
                            else
                            {
                                res.status(400);
                                for(var i in errors)
                                {
                                    res.write(errors[i] + "\n");
                                }
                                res.end();
                            }
                        })
                    }
                });
        });
    }
    catch (exception)
    {
        res.status(400).send('Error processing request');
    }
};

//function to check that a survey with the ID provided exists in the database
exports.surveyExists = function(surveyID, callback)
{
    var id = surveyID.toUpperCase();
    dbConn.db.collection('surveys', function(err, collection)
    {
        collection.count({'_id':id},
            function(err, count){
                if(count)
                {
                    callback(true);
                }
                else
                {
                    callback(false);
                }
                });
            });
};

//Deleting all surveys - method is intentionally unsupported, letting the user know this
exports.deleteAll = function(req, res)
{
    res.status(403).send("Deleting of all surveys disabled, please delete by ID");
};

//Deleting a survey by it's id.
exports.deleteById = function (req,res)
{
    try
    {
        var id = req.params.id.toUpperCase();
        dbConn.db.collection('surveys', function(err, collection)
        {
            collection.count({'_id':id},
                function(err, count){
                    if (err)
                    {
                        res.status(400).send("Error processing request");
                    }
                    else if (!count)
                    {
                        res.status(400).send("Survey for deletion not found") //If there's no survey with this id
                    }
                    else
                    {
                        collection.remove({'_id':id}, function(err, result)
                        {
                            if(err)
                            {
                                res.status(400).send("Error deleting survey");
                            }
                            else
                            {
                                res.status(204).send("Survey Deleted"); //If all goes well
                            }
                        });
                    }
                });
        });
    }

    catch (exception){
        res.status(400).send("Error processing request");
    }

};

//Adding a survey specific password
exports.addPassword = function (req,res){
    try {
        var id = req.body.surveyID;
        var password = req.body.password;
        if (!id || !password)
        {
            res.status(400).send("Please provide surveyID and password"); //IF required parameters are missing
        }
        userValidation.isPasswordValid(password, function(passwordValidationResult) { //Check password against security criteria
            if (passwordValidationResult.isValid)
            {
                exports.surveyExists(id, function(exists) //Check if it's a valid survey id
                        {
                            if(!exists)
                            {
                                res.status(400).send("Invalid Survey ID");
                            }
                            else
                            {
                                cryptoHelper.hashPassword(password, function (hash) { //Hash the password
                                    dbConn.db.collection('surveypasswords', function (err, collection) {
                                        collection.insert({'surveyID': id.toUpperCase(), 'password': hash}, function (err, item) { //store in the database
                                            if (err) {
                                                res.status(400).send("Error writing to database");
                                            }
                                            else {
                                                res.status(201).send("Created");
                                            }
                                        });
                                    })
                                });
                            }
                        });
                    }
            else //If the password validation failed
            {
                res.status(400);
                passwordValidationResult.errors.forEach(function(error){
                    res.write(error + '\n'); //Return all problems with the password in the response
                });
                res.end();
            }
    });
    }
    catch (Exception){
        res.status(400).send("Error reading request");
    }

};

//Function to remove a particular password for a survey
exports.deletePassword = function (req,res)
{
    try {
        var id = req.body.surveyID;
        var password = req.body.password;
        if (!id || !password) {
            res.status(400).send("Please provide surveyID and password"); //If data is missing
        }
            dbConn.db.collection('surveypasswords', function (err, collection) {
                collection.findOne({'surveyID': id}, function(err, item) //check if the password exists for this survey
                {
                    if (err)
                    {
                        res.status(400).send("Error reading request");
                        return;
                    }
                    if(!item)
                    {
                        res.status(400).send("Password not found for deletion");
                    }
                    else
                    {
                        cryptoHelper.checkPassword(password, item.password, function(success){
                            if(success) {
                                collection.remove({'surveyID': id}, function (err, result) {
                                    if (err) {
                                        res.status(400).send("Error reading request");
                                    }
                                    else {
                                        res.status(204).send("Password removed")
                                    }
                                });
                            }
                            else
                            {
                                res.status(400).send("Password not found for deletion");
                            }
                        })
                    }
                });
        })
    }
    catch(Exception)
    {
        res.status(400).send("Error reading request");
    }
};

//Perform survey-specific authentication
exports.authenticate = function(req, res){
    try {
        var authFields = req.body.authFields;
        var surveyId = req.body.surveyID;
        var passwordFields = authFields.filter(function(field) {return field.fieldType.toUpperCase() == "PASSWORD"}); //Get the password field (only one is allowed per survey)
        var password;
        if(passwordFields)
        {
            password = passwordFields[0].valueEntered;  //Password entered
        }
        dbConn.db.collection('surveypasswords', function (err, collection)
        {
            if(err)
            {
                res.send(401, "Authentication Error" + err.toString());
            }
            collection.findOne({'surveyID': surveyId}, function(err,item)
            {
                if (err || !item)
                {
                    res.send(401, "Incorrect surveyID provided");
                }
                if(item)
                {
                    var hashed = item.password;
                    cryptoHelper.checkPassword(password, hashed, function(matchedPasswords) //Check password against stored hash
                    {
                        if(!matchedPasswords)
                        {
                           res.send(401, "Incorrect password provided");
                        }
                        else
                        {
                            var noPasswordFields = authFields.filter(function(field) {return field.fieldType.toUpperCase() != "PASSWORD"}); //Returning non-password fields as these are used to store results
                            var expiryDate = moment().add(120, 'minutes').valueOf();
                            var userToken = jsonWebToken.encode({ //creating token
                                sub: surveyId,
                                exp: expiryDate
                            }, config.web.tokenSecret);

                            res.json({
                                token: userToken,
                                expires: expiryDate,
                                authFields: noPasswordFields
                            }); //send back token and fields
                        }
                    });
                }
            })
        });
    }
    catch (exception)
    {
        res.send(401, "Authentication Error" + exception.toString());
    }

};

//Used for running the survey - checks that survey exists and responds with client application
exports.runSurvey = function(req,res){
    var id = req.params.id.toUpperCase();
    dbConn.db.collection('surveys', function(err,collection){
        collection.count({'_id':id},
		function(err, count){
			if (err)
			{
			res.send('error ' + err);
			}
			else if (!count)
			{
				res.send('Survey with id: ' + id + ' not found!');
			}
			else
			{
            res.render('index', {
				title: 'Survey ' + id,
				surveyID: id //This is how the client app knows which survey it's running
			}
			);
			}
        });
    });
};


//Function creates a version of the survey object without any content except for authentication-relevant information
var createAuthOnlySurvey = function(surveyItem)
{
    if (!surveyItem)
    {
        return null;
    }
    var authOnlySurvey = {};
    authOnlySurvey.authenticationFields = surveyItem.authenticationFields;
    authOnlySurvey.introText = surveyItem.introText;
    authOnlySurvey.title = surveyItem.title;
    authOnlySurvey._id = surveyItem._id;
    authOnlySurvey.introFooter = surveyItem.introFooter;
    authOnlySurvey.requiresAuthentication = true;
    return authOnlySurvey;
};




