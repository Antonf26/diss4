//Handles API actions for managing administrative users.
var config = require('../config');
var dbConn = require('../dbConn');
var cryptoHelper = require('../Helpers/cryptoHelper');
var userValidation = require('../Helpers/userValidation');
var authenticationHelper = require('../Helpers/authenticationHelper');

//Creates a new admin user from http request if the provided data is valid
exports.addAdminUser = function(req, res)
{
    //Check request body for username and password and retrieve them.
    var userData = req.body;
    if(!userData.userName || !userData.password)
    {
        res.status(400).send("Error reading request");
        return;
    }
    var userName = userData.userName;
    var password = userData.password;


    //perform validation - checking for correct formatting, etc and is the user already exists in the database.
    checkValidUserDetails(userName, password, function(success, errors)
        {
            if(!success) //If the request is invalid, return an error status and list errors in the body of the response.
            {
                res.status(400);
                errors.forEach(function(element)
                {
                    res.write(element + '\n');
                });
                res.end();
            }
            else //If it is valid, attempt to add the user to the database
            {
                createAdminUser(userName, password, function (success, error)
                {
                    if (!success) {
                        res.status(400).send(error); //If we had a problem creating the user, 400 status and error sent back.
                        return;
                    }
                    res.status(201).send("User Created"); //Everything went well, notify in the response
                });
            }
    });
};

//Deletes an administrative user specified in the request
exports.deleteAdminUser = function (req, res)
{
    //Try to get username from request body
    var userData = req.body;
    if(!userData.userName)
    {
        res.status(400).send("Error reading request"); //Can't parse request or find username, notify client.
        return;
    }
    var userName = userData.userName;

    //Attempt to delete the user
    removeAdminUser(userName, function(success, error)
    {
        if(!success) //If there was a pobrlem, notify in the response
        {
            res.status(400).send(error);
        }
        else
        {
            res.status(204).send("Deleted"); //Deleted succesfully, notify client
        }
    });
};

//Returns information on existing administrative users (except password)
exports.getAdminUsers = function (req,res)
{
    retrieveAdminUsers(function(success, data)
    {
        var status = success ? 200 : 400; //If we're successful, send 200 status and data, if not, 400 and error
        res.status(status).send(data);
    });
};

//Function, called asynchronously that attempts to retrieve list of admin users from the database.
//Calls passed in callback function with boolean indicating success and either error or data as second parameter.
var retrieveAdminUsers = function(callback)
{
    dbConn.db.collection('adminUsers', function(err, collection)
    {
        if(err)
        {
            callback(false, "Error reading database")
        }
        else
        {
            collection.find({}, {'password': 0}).toArray(function(err, data) //second parameter of find specifies exclusion of password fields from returned data
            {
                if(err)
                {
                    callback(false, "Error reading database");
                }
                else
                {
                    callback(true, data);
                }
            })
        }
    });
};


//Function, called asynchronously that attempts to remove administrative user from the database by userName supplied
//Calls passed in callback function with boolean indicating success and error if present
var removeAdminUser = function(userName, callback)
{
    dbConn.db.collection('adminUsers', function(err, collection)
    {
        if(err)
        {
            callback(false, "error reading database");
            return;
        }
        collection.count({}, function (err, count) { //Gets coutn of existing admin users in the db.
            if (err)
            {
                callback(false, "error reading database");

            }
            else if(count < 2) //Not allowing deletion of all admin users to ensure functionality.
            {
                callback(false, "At least one administrative user must exist");
            }
            else
            {
                collection.remove({'userName':userName}, function(err, result) //Removes user by username
                {
                    if(err)
                    {
                        callback(false, "Error writing to database");
                    }
                    else
                    {
                        callback(true);
                    }
                });
            }
        });
    })
};

//Function, called asynchronously that attempts to create an administrative user from the database with username and password supplied
//Calls passed in callback function with boolean indicating success and error if present
var createAdminUser = function(userName, password, callback)
{
    dbConn.db.collection('adminUsers', function(err, collection)
    {
        if(err)
        {
            callback(false, "error reading database");
        }
        cryptoHelper.hashPassword(password, function (hash) { //Creating hash of the password to store
            dbConn.db.collection('adminUsers', function (err, collection) {
                collection.insert({'userName': userName, 'password': hash}, function (err, item) {
                    if (err)
                    {
                        callback(false, "error writing to database");
                    }
                    else
                    {
                        callback(true);
                    }
                });
            })
        })
    })
};

//Function, called asynchronously that performs validation on the provided username and password
//Calls passed in callback function with boolean indicating success and array of errors if present
var checkValidUserDetails = function(userName, password, callback)
{
    userValidation.isPasswordValid(password, function(passwordValid, errors){ //checking password meets security requirements
        if(!passwordValid)
        {
            callback(false, errors); //If there's an issue with the password
        }
        else {
            userValidation.isUsernameValid(password, function (usernameValid, errors) { //checking username meets security requirements
                if (!usernameValid) {
                    callback(false, errors);
                }
                else {
                    dbConn.db.collection('adminUsers', function (err, collection) {
                        if (err) {
                            callback(false, ["error reading database"]);
                            return;
                        }
                        collection.count({'userName': userName}, function (err, count) { //Check if there are any users with this username existing in the database
                            if (count > 0) {
                                callback(false, ["Username already exists"]);  //Enforcing uniqueness of username
                            }
                            else {
                                callback(true); //all good
                            }
                        });
                    });
                }
            });
        }
    });
};

exports.authenticateUser = function(req, res){

    if(!req.body.userName || !req.body.password)
    {
        res.status(400).send("Please provide username and password");
        return;
    }
    authenticationHelper.authenticateAdminUser(req.body.userName, req.body.password, function (success, data)
    {
        if(!success)
        {
            res.status(401).send(data);

        }
        else
        {
            authenticationHelper.createUserToken(data, 24, function(success, data)
            {
                if(success)
                {
                    tokendata = {userToken:data};

                    res.status(200).send(tokendata);
                }
                else
                {
                    res.status(400).send("Authentication Error");
                }
            });
        }
    });
};
