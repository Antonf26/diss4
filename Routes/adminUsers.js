/**
 * Created by Anton on 01/09/2014.
 */
var config = require('../config');
var dbConn = require('../dbConn');
var jsonWebToken = require('jwt-simple');
var moment = require('moment');
var cryptoHelper = require('../cryptoHelper');


exports.addAdminUser = function(req, res)
{
    var userData = req.body;
    if(!userData.userName || !userData.password)
    {
        res.status(400).send("Error reading request");
        return;
    }

    var userName = userData.userName;
    var password = userData.password

    checkValidUserDetails(userName, password, function(success, error)
        {
            if(!success)
            {
                res.status(400).send(error);
                return;
            }
            else {
                createAdminUser(userName, password, function (success, error)
                {
                    if (!success) {
                        res.status(400).send(error);
                        return;
                    }
                    res.status(201).send("User Created");
                });
            }
    });

};

exports.deleteAdminUser = function (req, res)
{
    var userData = req.body;
    if(!userData.userName)
    {
        res.status(400).send("Error reading request");
        return;
    }
    var userName = userData.userName;
    removeAdminUser(userName, function(success, error)
    {
        if(!success)
        {
            res.status(400).send(error);
        }
        else
        {
            res.status(204).send("Deleted");
        }
    });
};

exports.getAdminUsers = function (req,res)
{
    retrieveAdminUsers(function(success, data)
    {
        var status = success ? 200 : 400;
        res.status(status).send(data);
    });
};

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
            collection.find({}, {'password': 0}).toArray(function(err, data)
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



var removeAdminUser = function(userName, callback)
{
    dbConn.db.collection('adminUsers', function(err, collection)
    {
        if(err)
        {
            callback(false, "error reading database");
            return;
        }
        collection.count({}, function (err, count) {
            if (err)
            {
                callback(false, "error reading database");

            }
            else if(count < 2)
            {
                callback(false, "At least one administrative user must exist");
            }
            else
            {
                collection.remove({'userName':userName}, function(err, result)
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

var createAdminUser = function(userName, password, callback)
{
    dbConn.db.collection('adminUsers', function(err, collection)
    {
        if(err)
        {
            callback(false, "error reading database");
        }
        cryptoHelper.hashPassword(password, function (hash) {
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


var checkValidUserDetails = function(userName, password, callback)
{
    dbConn.db.collection('adminUsers', function(err, collection)
    {
        if(err)
        {
            callback(false, "error reading database");
            return;
        }
        collection.count({'userName':userName}, function(err, count)
        {
            if(count>0)
            {
                callback(false, "Username already exists");
                return;
            }
            else
            {
                callback(true);
            }
        });
    });
};
