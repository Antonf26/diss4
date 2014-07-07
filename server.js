/**
 * Created by Anton on 28/06/2014.
 */
var express = require('express');
var http = require('http');
var surveys = require('./routes/surveys');
//var frontend = require('./routes/frontend');
//var results = require('./routes/results');
var bodyParser = require('body-parser');


var app= express();
app.set('views', __dirname + '/views');


app.use(bodyParser.json());
app.use(express.static(__dirname + '/Public'));
app.set('view engine', 'jade');
app.get('/surveys', surveys.findAll);
app.get('/surveys/:id', surveys.findById);
app.get('/results', surveys.getResults);
app.get('/survey/:id', surveys.runSurvey);
app.post('/surveys', surveys.addSurvey);
app.post('/results', surveys.addResult);
app.get('/results/:id', surveys.getResultsById);




var portNumber = 3000;
app.listen(portNumber);
console.log('Listening on port ' + portNumber);

