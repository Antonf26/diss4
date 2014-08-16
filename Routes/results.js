/**
 * Created by Anton on 29/06/2014.
 */
    var dbConn = require('../dbConn');
    var config = require('../config');
    var jsonWebToken = require('jwt-simple');
    var moment = require('moment');
    var cryptoHelper = require('../cryptoHelper');
    var ObjectID = require('mongodb').ObjectID;


exports.findAll = function(req,res){
    var authenticated = false;
    var token = req.headers['x-user-token'];
    if(!token)
    {
        res.send(401).end('Not authenticated');
        return;
    }
    try
    {
        var decodedToken = jsonWebToken.decode(token, config.web.tokenSecret);
        var userId = decodedToken.iss;
        var expiry = decodedToken.exp;
        if (moment() > decodedToken.exp)
        {
            res.send(401).end('Token expired');
            return;
        }
        dbConn.db.collection('adminUsers', function(err, collection)
        {
            if(!err){
                collection.findOne({'_id': new ObjectID(userId)}, function(err, item)
                {
                    if(err || !item)
                    {
                        res.send(401).end('Invalid Token');
                    }
                    else
                    {
                        dbConn.db.collection('results', function (err, collection) {
                            collection.find().toArray(function (err, items) {
                                res.send(items);
                            });
                        });
                    }
                });
            }
        })
    }
    catch (ex)
    {
        res.send(401);
    }
};

exports.viewer = function (req, res)
{
    res.render('results')
};

exports.addResult = function(req,res){
    var survey = req.body;
    dbConn.db.collection('results', function(err, collection){
        collection.insert(survey, {safe:true},
            function(err, result){
                if(err){
                    res.send({'error': 'An error has occurred'});
                }
                else{
                    console.log('Success: ' + JSON.stringify(result[0]));
                    res.send(result[0]); //TODO: delete
                }
            })
    })
};

//function that checks the

exports.authenticateUser = function(req, res){
    authenticate(req, function(success, data)
    {
        if(!success)
        {
            res.send(401, data);
        }
        else
        {
            res.send(data);
        }
    })
};

var authenticate = function (req, callback) {
    try {
        var password = req.body.password;
        var userName = req.body.userName;

        dbConn.db.collection('adminUsers', function (err, collection) {
            if (err) {
                callback(false, "Authentication Error");
                return;
            }
            collection.findOne({'userName': userName}, function (err, item) {
                if (err || !item) {
                    callback(false, "Username Not Found");
                    return;
                }
                if (item) {
                    var hashedPassword = item.password;
                    cryptoHelper.checkPassword(password, hashedPassword, function (matchedPasswords) {
                        if (!matchedPasswords) {
                            callback(false, "Incorrect Password Provided");
                        }
                        else {
                            var expiryDate = moment().add(24, 'hours').valueOf();
                            var userToken = jsonWebToken.encode({
                                iss: item._id,
                                exp: expiryDate}, config.web.tokenSecret)
                            callback(true, userToken);
                        }
                    });
                }
            });
        })
    }
    catch(ex)
    {
        callback(false, ex.toString());
    }
};