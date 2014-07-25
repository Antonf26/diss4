/**
 * Created by Anton on 28/06/2014.
 */
var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true}, {safe:false, w:0, journal:false, fsync:false});
db = new Db('surveysdb', server);

//Opening database connection
db.open(function(err,db){
    if(!err){
        console.log("Connected to db");
        db.collection('surveys', {strict:true}, function(err,collection){
            if(err){
                console.log("The collection doesn't exist. Creating");
                populateDB();
            }
        });
    }

});

//Finds survey in DB based on ID provided in the request parameters, sends it on the response
exports.findById = function(req, res){
    var id = req.params.id.toUpperCase();
    console.log("get survey" + id);
    db.collection('surveys', function(err,collection){
        collection.findOne({'_id':id}, function(err, item){
            res.send(item);
        });
    });
};

//Returns all surveys //TODO: Remove in production (or the route to it)
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


//Deletes survey in the DB
exports.deleteSurvey = function (req, res) {
    var id = req.params.id;

};

//Retrieves all results stored in DB
exports.getResults = function(req,res){
    db.collection('results', function(err, collection){
        collection.find().toArray(function(err,items){
            res.send(items);
        });
    });
};

//Retrieves all results stored in DB for the survey ID provided
exports.getResultsById = function(req,res){
    var id = req.params.id.toUpperCase();
    db.collection('results', function(err, collection){
        collection.find({'surveyID':id}).toArray(function(err,items){
            res.send(items);
        });
    });
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
                        console.log('Success: ' + JSON.stringify(result[0]));
                        res.send(result[0]);
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
	

//Populates database with placeholder //TODO: Not needed in production!
var populateDB = function() {

    var surveys = [
        {
            name: "PlaceHolder"
        }

    ];
    db.collection('surveys', function(err, collection){
        collection.insert(surveys, {safe:true}, function (err, result){} );
    });

};



