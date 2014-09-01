/**
 * Created by Anton on 28/06/2014.
 */
var express = require('express');
var http = require('http');
var surveys = require('./Routes/surveys');
var results = require('./Routes/results');
var adminUsers = require('./Routes/adminUsers');
var bodyParser = require('body-parser');
var config = require('./config');
var authenticationHelper = require('./authenticationHelper');

var app= express();
app.set('views', __dirname + '/Views');
app.set('jwtTokenSecret', config.web.tokenSecret);
app.use(bodyParser.json()); //allows for parsing json - used for storing result
app.use(express.static(__dirname + '/Public'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({extended: true}));

//routes for users
app.get('/survey/:id', surveys.runSurvey); //used to run the survey front-end
app.post('/results', results.addResult); //used to store survey results
app.get('/surveys/:id', [authenticationHelper.tokenMiddleware, surveys.findById]); //used to retrieve survey data by the front-end
app.post('/authenticate', surveys.authenticate); //used to authenticate and receive token for a particular survey
app.post('/authenticateResults', results.authenticateUser);
app.get('/results', [authenticationHelper.tokenMiddleware, results.findAll]); //used to retrieve results
app.get('/resultViewer', results.viewer);


//development routes

if (config.web.developmentRoutes)
{
    app.post('/surveys', surveys.addSurvey);
    app.delete('/surveys', surveys.deleteAll);
    app.delete('/surveys/:id', surveys.deleteById);
    app.put('/surveys/:id', [authenticationHelper.tokenMiddleware, surveys.updateSurvey]);
    app.get('/surveys', [authenticationHelper.tokenMiddleware, surveys.findAll]); //used to re
    app.post('/surveyPasswords', [authenticationHelper.tokenMiddleware, surveys.addPassword]);
    app.put('/surveyPasswords', [authenticationHelper.tokenMiddleware, surveys.addPassword]);
    app.delete('/surveyPasswords', [authenticationHelper.tokenMiddleware, surveys.deletePassword]);
    app.post('/adminUsers', [authenticationHelper.tokenMiddleware, adminUsers.addAdminUser]);
    app.delete('/adminUsers', [authenticationHelper.tokenMiddleware, adminUsers.deleteAdminUser]);
    app.get('/adminUsers', [authenticationHelper.tokenMiddleware, adminUsers.getAdminUsers])
}

//change portNumber to change port server listens on.
var portNumber = config.web.port;
app.listen(portNumber);
console.log('Listening on port ' + portNumber);
