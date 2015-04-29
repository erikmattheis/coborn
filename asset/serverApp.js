var express = require('express'),
    path = require('path'),
    request = require('request'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    fs = require('fs'),
    url = require('url');
    
var config = require('./config.json');

var servicePath = path.resolve("..");
var apps = {};
var appPath = __dirname.replace(servicePath, '').replace(/\\+/gi, '/');

function startServer(chainId, version) {

  var indexFile;
  var port;

  version = typeof version !== 'undefined' ? version : "index";

  switch(version) {
    case "split":
      indexFile = path.resolve(__dirname + '/split.html');
      port = 3003;
      break;
    case "refactor":
      indexFile = path.resolve(__dirname + '/refactor.html');
      port = 3002;
      break;
    default:
      indexFile = path.resolve(__dirname + '/index.html');
      port = 3001;
      break;
  }

  var app = express();
  apps[chainId] = app;
  
  app.set('views', servicePath + path.sep);
  app.engine('html', require('ejs').renderFile);
  app.use('/proxy', function (req, res) {
    var newUrl = config.GsnApiUrl + req.url.replace('/proxy', '');
    req.pipe(request({ uri: newUrl, method: req.method })).pipe(res);
  });

  app.use(methodOverride());
  app.use('/asset', express.static(servicePath + path.sep + 'asset'));
  app.use('/src', express.static(servicePath + path.sep + 'src'));
  app.use('/vendor', express.static(servicePath + path.sep + 'vendor'));
  app.get('/unsupported-browser.html', function (request, response) {
    response.render('unsupported-browser.html');
  });

  app.get('*', function (request, response) {
    var myPath = url.parse(request.url).pathname.toLowerCase();
    fs.readFile(indexFile, 'utf8', function (err, str) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.write(str);
      response.end();
    });
  });

  // Start server
  app.listen(port, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });
}

// skip first two arguments

if (process.argv.length !== 4) {
  console.log('\n\nError: chain id and index file are required.\n');
  console.log('Example: \n node ' + path.basename(__filename) + ' 75 refactor');
  console.log('\n');
}
else {
  startServer(process.argv[2], process.argv[3]);
}

