// Handles connection to the database. Uses config file to know where to connect to.
var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db;
var config = require('./../config');


var server = new Server(config.db.host, config.db.port, {auto_reconnect: true}, {safe:false, w:0, journal:false, fsync:false});
var dbConn = {};
dbConn.db = new Db(config.db.dbName, server);

module.exports = dbConn;


//initialise connection
dbConn.db.open(function(err,db) {
    if (!err) {
        console.log("Connected to db");
    }
});