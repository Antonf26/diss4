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
var dbConn = require('../dbConn');
var cryptoHelper = require('../Helpers/cryptoHelper');

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

var token;


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
                        console.log(res.status);
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

validSurvey.authenticationFields = [
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
        fieldType: "text"
    }];

describe("Authenticated survey functionality", function(){ //tests for survey-level authentication

});

