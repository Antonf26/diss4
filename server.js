/**
 * Created by Anton on 28/06/2014.
 */
var express = require('express');
var http = require('http');
var surveys = require('./Routes/surveys');
//var frontend = require('./routes/frontend');
//var results = require('./routes/results');
var bodyParser = require('body-parser');
var config = require('./config');
var expressJwt = require('express-jwt');
var jsonWebToken = require('jwt-simple');



var app= express();
app.set('views', __dirname + '/Views');
app.set('jwtTokenSecret', config.web.tokenSecret);

app.use(bodyParser.json()); //allows for parsing json - used for storing result
app.use(express.static(__dirname + '/Public'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({extended: true}));
//app.use('/surveys', expressJwt({token: token}));
//routes for users
app.get('/survey/:id', surveys.runSurvey); //used to run the survey front-end
app.post('/results', surveys.addResult); //used to store survey results
app.get('/surveys/:id', surveys.findById); //used to retrieve survey data by the front-end
app.post('/authenticate', surveys.authenticate); //used to authenticate and receive token


//development routes
if (config.web.developmentRoutes)
{
    app.get('/results', surveys.getResults);
    app.post('/surveys', surveys.addSurvey);
    app.get('/surveys', surveys.findAll); //used to re
    app.get('/results/:id', surveys.getResultsById);
    app.post('/surveyPasswords', surveys.addPassword);
}

//change portNumber to change port server listens on.
var portNumber = config.web.port;
app.listen(portNumber);
console.log('Listening on port ' + portNumber);

