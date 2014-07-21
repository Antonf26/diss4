/**
 * Created by Anton on 29/06/2014.
 */
var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true},{safe:false, w:0, journal:false, fsync:false});
db = new Db('surveysdb', server);



exports.findAll = function(req,res){
    db.collection('results', function(err, collection){
        collection.find().toArray(function(err,items){
            res.send(items);
        });
    });
};

exports.addResult = function(req,res){
    var survey = req.body;
    db.collection('results', function(err, collection){
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