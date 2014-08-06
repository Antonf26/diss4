/**
 * Created by Anton on 28/06/2014.
 */
var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db;//,
    //BSON = mongo.BSONPure;
var config = require('../config');
var jsonWebToken = require('jwt-simple');
var moment = require('moment');
var cryptoHelper = require('../cryptoHelper');

var server = new Server(config.db.host, config.db.port, {auto_reconnect: true}, {safe:false, w:0, journal:false, fsync:false});
db = new Db('surveysdb', server);

//Opening database connection
db.open(function(err,db){
    if(!err){
        console.log("Connected to db");
        db.collection('surveys', {strict:true}, function(err,collection){
            if(err){
            }
        });
    }
    else
    {
        console.log(err);
    }

});

//Finds survey in DB based on ID provided in the request parameters, sends it on the response //TODO: If the survey has authentication fields and the user hasn't presented a token, return only the auth fields
exports.findById = function(req, res){
    var id = req.params.id.toUpperCase();
    console.log("get survey" + id);
    db.collection('surveys', function(err,collection){
        collection.findOne({'_id':id}, function(err, item){
            if (err || !item)
            {
                res.send(404, 'Survey with ID ' + id + ' not found')
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

            if (authenticated)
            {
                res.send(item);
            }
            else //this will be sent when there's no token and the survey requires authentication
            {
                authonlySurvey = {};
                authonlySurvey.authenticationFields = item.authenticationFields;
                authonlySurvey.introText = item.introText;
                authonlySurvey.title = item.title;
                authonlySurvey._id = item._id;
                authonlySurvey.introFooter = item.introFooter;
                authonlySurvey.requiresAuthentication = true;
                res.send(authonlySurvey);
            }


        });
    });
};

exports.authenticate = function(req, res){
    try {
        var authFields = req.body.authFields;
        var surveyId = req.body.surveyID;
        var password = authFields.filter(function(field) {return field.fieldType.toUpperCase() == "PASSWORD"})[0].valueEntered; //todo: check if there are no password fields, then just make a token?
        db.collection('surveypasswords', function (err, collection)
        {
           if(err)
           {
               res.send(401, "Authentication Error" + exception.toString());
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
                   cryptoHelper.checkPassword(password, hashed, function(matchedPasswords)
                   {
                      if(!matchedPasswords)
                      {
                          res.send(401, "Incorrect password provided");
                      }
                      else
                      {
                          var noPasswordFields = authFields.filter(function(field) {return field.fieldType.toUpperCase() != "PASSWORD"});
                          var expiryDate = moment().add(120, 'minutes').valueOf();
                          var userToken = jsonWebToken.encode({
                              sub: surveyId,
                              exp: expiryDate
                          }, config.web.tokenSecret);

                          res.json({
                              token: userToken,
                              expires: expiryDate,
                              authFields: noPasswordFields
                          });
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

//Returns all surveys
exports.findAll = function(req,res){
    db.collection('surveys', function(err, collection){
        collection.find().toArray(function(err,items){
            res.send(items);
        });
    });
};

//Adds survey to DB (JSON must be provided in body)
exports.addSurvey = function(req,res){
    var survey = req.body;
    db.collection('surveys', function(err, collection){
        collection.insert(survey, {safe:true},
        function(err, result){
            if(err){
                res.send({'error': 'An error has occurred'});
            }
            else{
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        })
    })
};

exports.addPassword = function (req,res){
    var id = req.body.surveyID;
    var password = req.body.password;
    cryptoHelper.hashPassword(password, function(hash){
        db.collection('surveypasswords', function(err, collection){
            collection.insert({'surveyID': id, 'password': hash}, function(err, item)
            {
                if (err)
                {
                    console.log(err);
                }
                else
                {
                    console.log('added');
                }
            });
        })
    })

};

//Deletes survey in the DB
exports.deleteSurvey = function (req, res) {
    var id = req.params.id;

};

//Retrieves all results stored in DB
exports.getResults = function(req,res){
    var password = req.headers['x-password'];
    if (password == 'Cardiff14') {
        db.collection('results', function (err, collection) {
            collection.find().toArray(function (err, items) {
                res.send(items);
            });
        });
    }
    else
    {
        res.send(401);
    }
};

//Retrieves all results stored in DB for the survey ID provided
exports.getResultsById = function(req,res){
    var password = req.headers['x-password'];
    if (password == 'Cardiff14') {
        var id = req.params.id.toUpperCase();
        db.collection('results', function (err, collection) {
            collection.find({'surveyID': id}).toArray(function (err, items) {
                res.send(items);
            });
        });
    }
    else
    {
        res.send(401);
    }
};

//Stores the result provided in the DB
exports.addResult = function(req,res){
        var surveyResult = req.body;
        db.collection('results', function (err, collection) {
            collection.insert(surveyResult, {safe: true},
                function (err, result) {
                    if (err) {
                        res.send({'error': 'An error has occurred'});
                    }
                    else {
                        res.send(200, result[0]);
                    }
                })
        })
};

//Used for running the surveys - checks for existence of survey
exports.runSurvey = function(req,res){
    var id = req.params.id.toUpperCase();
    console.log("get survey" + id);
    db.collection('surveys', function(err,collection){
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
				surveyID: id
			}

			);
			}
        });
    });
};
	





