/**
 * Created by Anton on 29/07/2014.
 */
var bcrypt = require('bcrypt');

var cryptoHelper = {};
var saltIterations = 10; //iterations to use for salting algorythms

//function hashes provided cleartext password and passes resulting hash to the callback function provided - to be used for sotring newly created passwords
cryptoHelper.hashPassword = function(password, callback){
    bcrypt.genSalt(saltIterations, function(err,salt) //async function, generates a salt
    {
        bcrypt.hash(password, salt, function(err, hash)
        {
            callback(hash);
        });
    });

};

//function checks cleartext password against a hash and returns boolean value for success to the callback function provided
cryptoHelper.checkPassword = function(password, hash, callback)
{
    bcrypt.compare(password, hash, function(err, res){
        if (err || !res)
        {
            callback(false); //if passwords don't match or there is an error attempting to match them
            return;
        }
        callback(true);
    });
};


module.exports = cryptoHelper;

