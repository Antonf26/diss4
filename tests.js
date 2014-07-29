/**
 * Created by Anton on 28/07/2014.
 */
var http = require('http');
var fs = require('fs');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('alive');
    res.end();
    console.log('accessed');
}).listen(8080);