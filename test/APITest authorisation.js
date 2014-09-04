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



describe('Test secured routes return 401 when unauthorised', function(){

    it('should not allow retrieval of all surveys by unauthorised users', function(done){
        api.get('/surveys')
            .expect(401, done);
    });

    it('should not allow submission of surveys by unauthorised users', function(done)
    {
        api.post('/surveys')
            .send(fakesurvey)
            .expect(401,done);
    });

    it('should not allow updating of surveys by unauthorised users', function(done)
    {
        api.put('/surveys/test')
            .send(fakesurvey)
            .expect(401,done);
    });
    it('should not allow deletion of surveys by unauthorised users', function(done)
    {
        api.delete('/surveys/test')
            .expect(401, done);
    });
    it('should not allow creation of survey passwords by unauthorised users', function(done)
    {
        api.post('/surveyPasswords')
            .send({})
            .expect(401, done);
    });
    it('should not allow deletion of survey passwords by unauthorised users', function(done)
    {
        api.delete('/surveyPasswords')
            .expect(401, done);
    });

    it('should not allow creation of administrative users by unauthorised users', function(done)
    {
        var fakeUser = {
            userName : 'Tester',
            password: 'Banana'
        };
        api.post('/adminUsers')
            .expect(401, done);
    });
    it('should not allow deletion of administrative users by unauthorised users', function(done)
    {
        var fakeUser = {
            userName : 'Tester'

        };
        api.delete('/adminUsers')
            .send(fakeUser)
            .expect(401, done);
    });
    it('should not allow retrieval of administrative users by unauthorised users', function(done)
    {

        api.get('/adminUsers')
            .expect(401, done);
    });

});

describe('Test administrative user authentication', function()
{
    it('should authenticate users with valid login details and return a valid token', function(done)
    {
        var validUser = {userName: 'Anton',
        password: 'Cardiff14'};

        api.post('/authenticateAdmin')
            .send(validUser)
            .expect(200)
            .end(function(err,res)
            {
                if(err)
                {
                    return done(err)
                }

                token = res.body.userToken; //storing token for use in later tests
                var decodedToken = jsonWebToken.decode(token, config.web.tokenSecret); //If this token is invalid, the test would fail.
                done();
            });
    });

    it('should not authenticate users with invalid login details', function(done){
        var invalidUser = {userName: 'Fake',
        password: "Nope"};
        api.post('/authenticateAdmin')
            .send(invalidUser)
            .expect(401, done);
    });

    it('should return an error status when attempting to authenticate with incorrect fields', function(done){
        var invalidUserObject = {name: 'Banana', age:'18'};
        api.post('/authenticateAdmin')
            .send(invalidUserObject)
            .expect(400)
            .expect("Please provide username and password", done);
    });
});

var fakeUser = { //new user to be used in tests
    userName : "Tester",
    password: "Password123"
};


describe('Test management of administrative users', function()
{

    before(function(done)
    {
        //In case the user object already exists (we're running this test more then once, need to delete the user that we attempt to create later to avoid error.
        api.delete('/adminUsers')
            .set('x-user-token', token) //Using token from earlier test
            .send({userName: "Tester"})
            .end(function(){
                done();
            });
    });

    it('should allow authorised users to create new Administrative users', function(done)
    {

        api.post('/adminUsers')
            .set('x-user-token', token) //Using token from earlier test
            .send(fakeUser)
            .expect(201, done);
    });

    it("Shouldn't allow creation of administrative users with invalid password", function(done)
    {
        var badPassUser = {
            userName : "Tester",
            password: "short"
        };
        api.post('/adminUsers')
            .set('x-user-token', token) //Using token from earlier test
            .send(badPassUser)
            .expect(400, done);
    });

    it('should allow newly created user to authenticate', function(done)
    {
        api.post('/authenticateAdmin')
            .send(fakeUser)
            .expect(200, done); //we know a token is sent for correct details from previous tests
    });
    it('should allow retrieval of list of Admin users, which should include newly created user', function(done)
    {
        api.get('/adminUsers')
            .set('x-user-token', token) //Using token from earlier test
            .expect(200)
            .end(function(err, res)
            {
                if(err)
                {
                    done(err)
                }
                var userDetails = res.body;
                assert.equal(userDetails.length, 2); //There should be two users now, including newly created one
                var numberOfUsersWithFakeUsername = userDetails.filter(function(user){return user.userName == fakeUser.userName}).length; //get the number of users
                assert.equal(numberOfUsersWithFakeUsername, 1);
                done();
            }
        )
    });

    it('should allow authorised users deletion Administrative user. Deleted user shouldn\'t be able to authenticate', function(done)
    {
        api.delete('/adminUsers')
            .set('x-user-token', token) //Using token from earlier test
            .send({userName: fakeUser.userName})
            .expect(204)
            .end(function(){
                api.post('/authenticateAdmin')
                    .send(fakeUser)
                    .expect(401, done); //we now a token is sent for correct details from previous tests
            });
    });
});












