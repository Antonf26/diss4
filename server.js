/**
 * Created by Anton on 28/06/2014.
 */
var express = require('express');
var http = require('http');
var surveys = require('./Routes/surveys');
//var frontend = require('./routes/frontend');
var results = require('./Routes/results');
var bodyParser = require('body-parser');
var config = require('./config');
var expressJwt = require('express-jwt');
var jsonWebToken = require('jwt-simple');
var cryptoHelper = require('./cryptoHelper');


var app= express();
app.set('views', __dirname + '/Views');
app.set('jwtTokenSecret', config.web.tokenSecret);

app.use(bodyParser.json()); //allows for parsing json - used for storing result
app.use(express.static(__dirname + '/Public'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({extended: true}));

//routes for users
app.get('/survey/:id', surveys.runSurvey); //used to run the survey front-end

app.post('/results', surveys.addResult); //used to store survey results
app.get('/surveys/:id', surveys.findById); //used to retrieve survey data by the front-end
app.post('/authenticate', surveys.authenticate); //used to authenticate and receive token
app.post('/authenticateResults', results.authenticateUser);
app.get('/results', results.findAll); //used to retrieve results
app.get('/resultViewer', results.viewer);
app.get('/results/:id', surveys.getResultsById);
//development routes
if (config.web.developmentRoutes)
{
    app.post('/surveys', surveys.addSurvey);
    app.get('/surveys', surveys.findAll); //used to re
    app.post('/surveyPasswords', surveys.addPassword);
}

//change portNumber to change port server listens on.
var portNumber = config.web.port;
app.listen(portNumber);
console.log('Listening on port ' + portNumber);
