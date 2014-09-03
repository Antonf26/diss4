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
    _id: "TestSurvey",
    id: "TestSurvey",
    title:"testing",
    defaultAnswers: [{
        id: "0",
        answerText: "Strongly Disagree"
    },
    {
        id: "1",
        answerText: "Disagree"
    }],
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
        customAnswers: [{
            id: "0",
            answerText: "Yes"
        },
            {
                id: "1",
                answerText: "No"
            }],
        isRequired: true
    }],
    introText: "Introductory",
    introFooter: "Footer",
    authenticationFields: [
        {
            fieldName: "respondentNumber",
            fieldLabel: "Respondent Number",
            isRequired: true,
            fieldType: "text"
        }
    ],
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

describe("Adding surveys", function(){
    before(function(done) //get a token for a valid user authentication
    {
        var validUser = {
            userName: 'Anton',
            password: 'Cardiff14'};

        api.post('/authenticateAdmin')
            .send(validUser)
            .end(function(err,res)
            {
                if(err)
                {
                    return done(err)
                }
                token = res.body.userToken; //storing token for use in later tests
                done();
            });
    });

    it("Should allow addition of valid surveys", function(done){
        api.post('/surveys')
            .set('x-user-token', token)
            .send(validSurvey)
            .expect(201, done);
    })


});
