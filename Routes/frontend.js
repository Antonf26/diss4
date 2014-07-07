/**
 * Created by Anton on 30/06/2014.
 */
 var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('surveysdb', server);

 db.open(function(err,db){
    if(!err){
        console.log("Connected to db");
        db.collection('surveys', {strict:true}, function(err,collection){
            if(err){
                console.log("The collection doesn't exist. Creating");
            }
        });
    }

});
 
 
exports.index = function(req,res){
    var id = req.params.id;
	exports.findById = function(req, res){
    var id = req.params.id;
    console.log("get survey" + id);
    db.collection('surveys', function(err,collection){
        collection.findOne({'_id':id}, function(err, item){
            res.render('index', {
				surveyID : surveyID,
				survey: item
			});
        });
    });
};
	
	
    
};

