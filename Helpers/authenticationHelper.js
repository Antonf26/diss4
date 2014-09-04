/**
 * Created by Anton on 01/09/2014.
 */
var dbConn = require('./dbConn');
var cryptoHelper = require('./cryptoHelper');
var moment = require('moment');
var jsonWebToken = require('jwt-simple');
var config = require('./../config');
var ObjectID = require('mongodb').ObjectID;

//Function attempts to authenticate user with username and password provided. Result is passed as parameter to callback function, with true for success and false for error.
//Second parameter returns error text if authentication failed or user ID if authentication succeeded.
exports.authenticateAdminUser = function(userName, password, callback)
{
    dbConn.db.collection('adminUsers', function (err, collection) {
        if (err)
        {
            callback(false, "Authentication Error");
            return;
        }
        collection.findOne({'userName': userName}, function (err, item) {
            if (err || !item)
            {
                callback(false, "Username Not Found");
                return;
            }
            if (item)
            {
                var hashedPassword = item.password;
                cryptoHelper.checkPassword(password, hashedPassword, function (matchedPasswords) {
                    if (!matchedPasswords)
                    {
                        callback(false, "Incorrect Password Provided");
                    }
                    else
                    {
                        callback(true, item._id);
                    }
                });
            }
        });
    })
};

//Creates token with userId provided, expiring in amount of hours provided
//Calls callback function passed in with boolean indicating success and string error if present
exports.createUserToken = function(userId, ttlHours, callback)
{
  if(!userId || userId.length < 1)
  {
      callback(false, "Invalid user ID");
      return;
  }
  try
  {
      var expiryDate = moment().add(ttlHours, 'hours').valueOf();
      var userToken = jsonWebToken.encode({
          iss: userId,
          exp: expiryDate}, config.web.tokenSecret);
      callback(true, userToken); //Success, return the token
  }
  catch (exception)
  {
      callback(false, exception.message);
  }
};


//Verifies an administrative user token - token string is passed in as parameter
//Calls callback function provided when done, with boolean indication success and string error if token wasn't verified or the user data object if it was
exports.verifyUserToken = function(token, callback)
{
    try
    {
        var decodedToken = jsonWebToken.decode(token, config.web.tokenSecret);
        var userId = decodedToken.iss;
        var expiry = decodedToken.exp;
        if (moment() > expiry) //Comparing expiration data to current
        {
            callback(false, "Token Expired");
            return;
        }
        dbConn.db.collection('adminUsers', function(err, collection)
        {
            if(!err){
                collection.findOne({'_id': new ObjectID(userId)}, function(err, item) //Checking if there's a user with this id
                {
                    if(err || !item)
                    {
                        callback(false, "Invalid Token");
                    }
                    else
                    {
                       callback(true, item);
                    }
                });
            }
        })
    }

    catch (exception)
    {
        callback(false, "Invalid Token");
    }
};

//Middleware - used by express to check user has a valid token before providing access to secured routes
exports.tokenMiddleware = function(req,res, next)
{
    var token = req.headers['x-user-token']; //getting token from the headers
    if(!token)
    {
        res.status(401).send("Please authenticate"); //If there's no token, the request doesn't go any further
        return;
    }
    exports.verifyUserToken(token, function(success, data)
    {
        if(success)
        {
            req.user = data; //attaching the user data to the request, this can be queried in route function
            next();
        }
        else
        {
            res.status(401).send(data); //Respond with the error
        }
    })
};




