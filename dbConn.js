/**
 * Created by Anton on 07/08/2014.
 */
var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db;
var config = require('./config');


var server = new Server(config.db.host, config.db.port, {auto_reconnect: true}, {safe:false, w:0, journal:false, fsync:false});
var dbConn = {};
dbConn.db = new Db(config.db.dbName, server);

module.exports = dbConn;