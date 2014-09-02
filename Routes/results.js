/**
 * Created by Anton on 29/06/2014.
 */
    var dbConn = require('../dbConn');
    var config = require('../config');
    var authenticationHelper = require('../Helpers/authenticationHelper');


exports.findAll = function(req,res){

    try
    {
        dbConn.db.collection('results', function (err, collection) {
            collection.find().toArray(function (err, items) {
                res.send(items);
            });
        });
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
    var surveyResult = req.body;
    dbConn.db.collection('results', function (err, collection) {
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

//function that checks the
exports.authenticateUser = function(req, res){
    authenticationHelper.authenticateAdminUser(req.body.userName, req.body.password, function (success, data)
    {
        if(!success)
        {
            res.status(403).send(data);
        }
        else
        {
            authenticationHelper.createUserToken(data, 24, function(success, data)
            {
                if(success)
                {
                    res.status(200).send(data);
                }
                else
                {
                    res.status(400).send("Authentication Error");
                }
            });
        }
    });
};

