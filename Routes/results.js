/**
 * Created by Anton on 29/06/2014.
 */
    var dbConn = require('../Helpers/dbConn');
    var config = require('../config');
    var surveys = require('./surveys');
    var resultValidation = require('../Helpers/resultValidation');



//retrieve all results from the database
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

//Store a new result
exports.addResult = function(req,res){
    var surveyResult = req.body;
    resultValidation.isResultValid(surveyResult, function(valid, error){
     if(valid) {
         dbConn.db.collection('results', function (err, collection) {
             collection.insert(surveyResult, {safe: true},
                 function (err, result) {
                     if (err) {
                         res.status(400).send('Error writing to database');
                     }
                     else {
                         res.status(201).send('Result stored');
                     }
                 })
         });
     }
    else
     {
         res.status(400).send(error);
     }
    });
};


//Runs the proof of concept result viewer client
exports.viewer = function (req, res)
{
    res.render('results')
};
