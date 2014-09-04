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
var authenticationHelper = require('./Helpers/authenticationHelper');

//Setting up express application
var app= express();
app.set('views', __dirname + '/Views');
app.set('jwtTokenSecret', config.web.tokenSecret); //Used to encode token for authentication
app.use(bodyParser.json()); //allows for parsing json - used for storing result
app.use(express.static(__dirname + '/Public')); //Where we serve static files from
app.set('view engine', 'jade'); //Templating engine
app.use(bodyParser.urlencoded({extended: true})); //Allows use of non-standard http methods (delete, etc)

//Defining the api routes - linking functions to url paths

app.post('/results', results.addResult); //used to store survey results
app.get('/surveys/:id', surveys.findById); //used to retrieve survey data by the front-end
app.post('/authenticate', surveys.authenticate); //used to authenticate and receive token for a particular survey
app.post('/authenticateAdmin', adminUsers.authenticateUser);
app.get('/results', [authenticationHelper.tokenMiddleware, results.findAll]); //used to retrieve results
app.post('/surveys', [authenticationHelper.tokenMiddleware, surveys.addSurvey]);
app.delete('/surveys', [authenticationHelper.tokenMiddleware, surveys.deleteAll]);
app.delete('/surveys/:id', [authenticationHelper.tokenMiddleware,surveys.deleteById]);
app.put('/surveys/:id', [authenticationHelper.tokenMiddleware, surveys.updateSurvey]);
app.get('/surveys', [authenticationHelper.tokenMiddleware, surveys.findAll]); //used to re
app.post('/surveyPasswords', [authenticationHelper.tokenMiddleware, surveys.addPassword]);
app.delete('/surveyPasswords', [authenticationHelper.tokenMiddleware, surveys.deletePassword]);
app.post('/adminUsers', [authenticationHelper.tokenMiddleware, adminUsers.addAdminUser]);
app.delete('/adminUsers', [authenticationHelper.tokenMiddleware, adminUsers.deleteAdminUser]);
app.get('/adminUsers', [authenticationHelper.tokenMiddleware, adminUsers.getAdminUsers])

//below routes serve client applications
app.get('/survey/:id', surveys.runSurvey); //used to run the survey front-end
app.get('/resultViewer', results.viewer);


//this starts the web server listening on the port specified in the config file.
var portNumber = config.web.port;
app.listen(portNumber);
console.log('Listening on port ' + portNumber);
