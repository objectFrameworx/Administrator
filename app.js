
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , cluster = require('./routes/cluster')
  , http = require('http')
  , fs = require('fs')
  , path = require('path');

var app = express();
var confObj = JSON.parse(fs.readFileSync(__dirname + '/config/config.json', 'utf8'));

// all environments
app.set('configuration', confObj);
app.set('stdoutput', __dirname + '/stdoutput');
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.administration);
app.get('/home', routes.index);
app.get('/cluster', cluster.load_cluster);
app.get('/messaging', routes.index);
app.get('/processing', routes.index);
app.get('/database', routes.index);
app.get('/webrouter', routes.index);
app.get('/loadbalancer', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
