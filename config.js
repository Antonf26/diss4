/**
 * Created by Anton on 28/07/2014.
 */
var config={};

config.web={};
config.db={};
config.security={};

config.web.port = 8080; //port for server to listen on
config.web.developmentRoutes = true; //whether we're enabling development-related routes
config.web.tokenSecret = "SecretString"; //string used encode token

config.db.host = 'localhost'; //host of db
config.db.port = 27017; //posrt of db
config.db.dbName = 'surveysdb';


config.security.minPasswordLength = 8;
config.security.minUsernameLength = 5;



module.exports = config;