/**
 * Created by Anton on 28/06/2014.
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
                populateDB();
            }
        });
    }

});

exports.findById = function(req, res){
    var id = req.params.id;
    console.log("get survey" + id);
    db.collection('surveys', function(err,collection){
        collection.findOne({'_id':id}, function(err, item){
            res.send(item);
        });
    });
};

exports.findAll = function(req,res){
    db.collection('surveys', function(err, collection){
        collection.find().toArray(function(err,items){
            res.send(items);
        });
    });
};

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

exports.deleteSurvey = function (req, res) {
    var id = req.params.id;

};


exports.getResults = function(req,res){
    db.collection('results', function(err, collection){
        collection.find().toArray(function(err,items){
            res.send(items);
        });
    });
};

exports.getResultsById = function(req,res){
	var id = req.params.id;
    db.collection('results', function(err, collection){
        collection.find({'surveyID':id}).toArray(function(err,items){
            res.send(items);
        });
    });
};

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



