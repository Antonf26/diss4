/**
 * Created by Anton on 03/09/2014.
 */
/**
 * Created by Anton on 03/09/2014.
 */
var should = require('should');
var assert = require('assert');
var supertest = require('supertest');
var apiUrl = 'http://localhost:8080';
var jsonWebToken = require('jwt-simple');
var config = require('../config');
var api = supertest(apiUrl);
var fakesurvey = {};  //no need for actual survey object, testing authorisation
var token;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

var validSurvey = {
    _id: "TESTSURVEY",
    id: "TESTSURVEY",
    title: "testing",
    defaultAnswers: [
        {
            id: "0",
            answerText: "Strongly Disagree"
        },
        {
            id: "1",
            answerText: "Disagree"
        }
    ],
    questions: [
        {
            id: "0",
            questionText: "Huh?",
            useDefaultAnswers: true,
            customAnswers: null,
            isRequired: true
        },
        {
            id: "1",
            questionText: "Yep",
            useDefaultAnswers: false,
            customAnswers: [
                {
                    id: "0",
                    answerText: "Yes"
                },
                {
                    id: "1",
                    answerText: "No"
                }
            ],
            isRequired: true
        }
    ],
    introText: "Introductory",
    introFooter: "Footer",
    acceptanceText: "Please agree to the below to proceed",
    acceptanceCriteria: [
        {
            consentText: "I agree to take part in this study.",
            agreed: false
        }
    ],
    completionText: "Done, thanks",
    surveyHeading: "Header",
    surveyHead: "Head"
};

describe("Managing authentication-free surveys", function () {
    before(function (done) //get a token for a valid user authentication
    {
        var validUser = {
            userName: 'Anton',
            password: 'Cardiff14'};

        api.post('/authenticateAdmin')
            .send(validUser)
            .end(function (err, res) {
                if (err) {
                    return done(err)
                }
                token = res.body.userToken; //storing token for use in later tests
                api.delete('/surveys/' + validSurvey.id) //deleting any survey still in the database with the same id
                    .set('x-user-token', token)
                    .end(function (err, res) {
                        done()
                    });
            });


    });

    it("Should allow addition of valid surveys", function (done) {
        api.post('/surveys')
            .set('x-user-token', token)
            .send(validSurvey)
            .expect(201, done);
    });

    it("Should be able to retrieve newly added survey", function (done) {
        api.get('/surveys/' + validSurvey.id)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err)
                }
                assert.deepEqual(res.body, validSurvey, "Retrieved value equals defined survey"); //checking if the two are the same
                done();
            });
    });

    it("Should be able to update survey and retrieve it with changes reflected", function (done) {
        validSurvey.title = "New Title";
        api.put('/surveys/' + validSurvey.id)
            .set('x-user-token', token)
            .send(validSurvey)
            .expect(201)
            .end(
            function(err,res){
            api.get('/surveys/' + validSurvey.id)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err)
                }
                assert.deepEqual(res.body, validSurvey); //checking if the two are the same
                done();
            });
            });


    });

    it("Should be able to delete survey - survey shouldn't be retrievable afterwards", function(done){
        api.delete('/surveys/' + validSurvey.id)
            .set('x-user-token', token)
            .expect(204)
            .end(
            function(err,res){
                if(err)
                {
                    done(err);
                }
                api.get('/surveys/' + validSurvey.id)
                    .expect(404, done);
                    });
    });

    //We want a copy of validSurvey that we can break in different ways without affecting validSurvey
    //This is a (unpleasant) hack that circumvents Javascript's peculiarities about immutability.
    var cloneSurvey = JSON.parse(JSON.stringify(validSurvey));

    it("Shouldn't be able to submit a survey without questions", function(done)
    {
         delete cloneSurvey.questions;
        api.post('/surveys')
            .set('x-user-token', token)
            .send(cloneSurvey)
            .expect(400, done);
    });

    var cloneSurvey2 = JSON.parse(JSON.stringify(validSurvey)); //re-creating our clone
    it("Shouldn't be able to submit a survey without an id", function(done)
    {
        delete cloneSurvey2.id;
        api.post('/surveys')
            .set('x-user-token', token)
            .send(cloneSurvey)
            .expect(400, done);
    });

    cloneSurvey3 = JSON.parse(JSON.stringify(validSurvey)); //re-creating our clone
    it("Shouldn't be able to submit a survey without an title", function(done)
    {
        delete cloneSurvey3.title;
        api.post('/surveys')
            .set('x-user-token', token)
            .send(cloneSurvey)
            .expect(400, done);
    });

    cloneSurvey4 = JSON.parse(JSON.stringify(validSurvey)); //re-creating our clone
    it("Shouldn't be able to submit a survey with a title that's not a string", function(done)
    {
        cloneSurvey4.title = 123;
        api.post('/surveys')
            .set('x-user-token', token)
            .send(cloneSurvey4)
            .expect(400, done);
    });

    var cloneSurvey5 = JSON.parse(JSON.stringify(validSurvey)); //re-creating our clone
    it("Shouldn't be able to submit a survey with duplicate question id's", function(done)
    {
        cloneSurvey5.questions[1].id = cloneSurvey5.questions[0].id;
        api.post('/surveys')
            .set('x-user-token', token)
            .send(cloneSurvey5)
            .expect(400, done);
    });
});

var testAuthSurvey = JSON.parse(JSON.stringify(validSurvey)); //cloning survey to have a version for using in authentication testing

testAuthSurvey.authenticationFields = [
        {
            fieldName: "respondentNumber",
            fieldLabel: "Respondent Number",
            isRequired: true,
            fieldType: "text"
        },
    {
        fieldName: "password",
        fieldLabel: "Password",
        isRequired: true,
        fieldType: "password"
    }];

testAuthSurvey.id = "TESTAUTHSURVEY";
testAuthSurvey._id="TESTAUTHSURVEY";
testAuthSurvey.title= "Test Authentication";

describe("Authenticated survey functionality", function(){ //tests for survey-level authentication

    before(function(done){
    api.delete('/surveys/' + testAuthSurvey.id) //deleting any survey still in the database with the same id
        .set('x-user-token', token)
        .end(function (err, res) {
            done()
        });
    });

    it("Should allow addition of valid surveys with authentication fields", function (done) {
        api.post('/surveys')
            .set('x-user-token', token)
            .send(testAuthSurvey)
            .expect(201, done);
    });

    it("Should allow creation of survey-specific passwords", function(done){
        var surveyPasswordObject = {
            surveyID : testAuthSurvey.id,
            password: "Banana12"
        };

        api.post('/surveyPasswords')
            .set('x-user-token', token)
            .send(surveyPasswordObject)
            .expect(201, done);
    });

    it("Shouldn't allow creation of invalid passwords", function(done)
    {
        var brokenPasswordObject = {
            surveyID : testAuthSurvey.id,
            password: "short"
        };

        api.post('/surveyPasswords')
            .set('x-user-token', token)
            .send(brokenPasswordObject)
            .expect(400, done);
    });

    it("Shouldn't allow creation of password for non-existent survey", function(done)
    {
        var fakeSurveyObject = {
            surveyID: "Fictional",
            password: "Valid123"
        };

        api.post('/surveyPasswords')
            .set('x-user-token', token)
            .send(fakeSurveyObject)
            .expect(400, done);
    });

    it("Should retrieve authorisation-only version of surveys with authentication fields when no valid token is present", function(done)
    {
        var authOnlySurvey = {};
        authOnlySurvey.authenticationFields = testAuthSurvey.authenticationFields;
        authOnlySurvey.introText = testAuthSurvey.introText;
        authOnlySurvey.title = testAuthSurvey.title;
        authOnlySurvey._id = testAuthSurvey._id.toUpperCase();
        authOnlySurvey.introFooter = testAuthSurvey.introFooter;
        authOnlySurvey.requiresAuthentication = true;
        //These should be the only fields returned for a survey with authentication fields present when there's no token present for this survey
        api.get('/surveys/' + testAuthSurvey.id)
            .expect(200)
            .end(function(err, res)
            {
                if(err)
                {
                    done(err);
                }
                assert.deepEqual(res.body, authOnlySurvey);
                done();

            });
    });
    var surveyToken;
    it("Should allow authentication for survey with valid details", function(done)
    {
        var surveyAuthenticationObject = {};

        surveyAuthenticationObject.surveyID = testAuthSurvey._id.toUpperCase();
        surveyAuthenticationObject.authFields = [
            {
                fieldName: "respondentNumber",
                fieldLabel: "Respondent Number",
                isRequired: true,
                fieldType: "text",
                valueEntered: 12345
            },
            {
                fieldName: "password",
                fieldLabel: "Password",
                isRequired: true,
                fieldType: "password",
                valueEntered: "Banana12"
            }];

        api.post('/authenticate')
            .send(surveyAuthenticationObject)
            .expect(200)
            .end(function(err,res) {
                if (err) {
                    return done(err)
                }

                surveyToken = res.body.token; //storing token for use in later tests
                var decodedToken = jsonWebToken.decode(surveyToken, config.web.tokenSecret); //If this token is invalid, the test would fail as this would throw exception.
                assert(decodedToken.sub = testAuthSurvey._id.toUpperCase());
                done();
            });
    });

    it("Shouldn't allow authentication for survey with valid details", function(done)
    {
        var surveyAuthenticationObject = {};

        surveyAuthenticationObject.surveyID = testAuthSurvey._id.toUpperCase();
        surveyAuthenticationObject.authFields = [
            {
                fieldName: "respondentNumber",
                fieldLabel: "Respondent Number",
                isRequired: true,
                fieldType: "text",
                valueEntered: 12345
            },
            {
                fieldName: "password",
                fieldLabel: "Password",
                isRequired: true,
                fieldType: "password",
                valueEntered: "Wrong"
            }];

        api.post('/authenticate')
            .send(surveyAuthenticationObject)
            .expect(401, done);
    });

    it("Should return full survey for authentication-protected surveys when valid token is present", function(done)
    {
        api.get('/surveys/' + testAuthSurvey.id)
            .set('x-access-token', surveyToken)
            .expect(200)
            .end(function(err, res)
            {
                if(err)
                {
                    done(err);
                }
                assert.deepEqual(res.body, testAuthSurvey); //Deep equals compares all fields of object - making sure full survey is returned
                done();
            });
    });

    it("Should allow deletion of survey passwords", function(done)
    {
        var surveyPasswordObject = {
            surveyID : testAuthSurvey.id,
            password: "Banana12"
        };
        api.delete('/surveyPasswords')
            .set('x-user-token', token)
            .send(surveyPasswordObject)
            .expect(204, done);
    });

});

var sampleResult =
{
    authFields: {
        respondentNumber: "54789" //password fields are not submitted to results from the client
    },

    surveyID: "TESTAUTHSURVEY",
    time: "2014-09-03T23:48:35.355Z",
    questions: [
        {
            questionText: "Huh?",
            selectedAnswer: {
                id: "0",
                answerText: "Strongly Disagree"
            },
            questionId: "0"
        },
        {
            questionText: "Yep",
            selectedAnswer: {
                id: "1",
                answerText: "No"
            },
            questionId: "1"
        }
    ]
};
describe("Submission survey results", function(done){

    it("Should allow submission of valid result", function(done)
    {
        api.post('/results')
            .send(sampleResult)
            .expect(201, done);
    });

    it("Shouldn't allow submission of result for non-existent survey", function(done)
    {
        sampleResult.surveyID = "Fake";
        api.post('/results')
            .send(sampleResult)
            .expect(400, done);
    });

    it("Shouldn't allow submission of result with invalid time", function(done)
    {
        sampleResult.surveyID = "TESTAUTHSURVEY"; //restoring valid value to test time
        sampleResult.time="invalid";
        api.post('/results')
            .send(sampleResult)
            .expect(400, done);
    });

    it("Shouldnt' allow submission of result without a surveyID", function(done)
    {
        sampleResult.time = "2014-09-03T23:48:35.355Z"; //restoring valid value to test time
        delete sampleResult.surveyID;
        api.post('/results')
            .send(sampleResult)
            .expect(400, done);
    });

    it("Should alow retrieval of results by an authorised user", function(done)
    {
       api.get('/results')
           .set('x-user-token', token)
           .expect(200, done);
    });
});

