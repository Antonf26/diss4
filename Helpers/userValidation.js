/**
 * Created by Anton on 02/09/2014.
 */
var config = require('./../config');
var helpers = require('./helpers');

exports.isPasswordValid = function(password, callback)
{
    var passwordValidationResult = {};
    passwordValidationResult.isValid = true;
    passwordValidationResult.errors = [];
    var minLength = config.security.minPasswordLength;
    //Checking if the password is at least the length specified as minimum in the config file.
    if (password.length < minLength)
    {
        passwordValidationResult.isValid = false;
        passwordValidationResult.errors.push("Password must be at least " + minLength + " characters long.");
    }

    //Checking if password contains only letters, numbers and _.
    if(!helpers.containsValidChars(password))
    {
        passwordValidationResult.isValid = false;
        passwordValidationResult.errors.push("Password contains illegal characters. Only letters, numbers and underscore are allowed.");
    }
    //Checking if the password contains at least one lowercase letter, one uppercase letter and one number
    if(!helpers.containsCapitalLetter(password) || !helpers.containsSmallLetter(password) || !helpers.containsNumber(password))
    {
        passwordValidationResult.isValid = false;
        passwordValidationResult.errors.push("Password must contain at least one lowercase letter, one uppercase letter and one number");
    }
    callback(passwordValidationResult);
};


exports.isUsernameValid = function(username, callback)
{
    var usernameValidationResult = {};
    usernameValidationResult.isValid = true;
    usernameValidationResult.errors = [];
    var minLength = config.security.minUsernameLength;
    //Checking if the username is at least the length specified as minimum in the config file.
    if (username.length < minLength)
    {
        usernameValidationResult.isValid = false;
        usernameValidationResult.errors.push("Username must be at least " + minLength + " characters long.");
    }

    //Checking if username contains only letters, numbers and _.
    if(!helpers.containsValidChars(username))
    {
        usernameValidationResult.isValid = false;
        usernameValidationResult.errors.push("Username contains illegal characters. Only letters, numbers and underscore are allowed.");
    }
    callback(usernameValidationResult);
};
