var express = require('express');
var app = express();
var path = require('path');
var request = require('request');


app.use('/proxy', function (req, res) {
  var newUrl = 'https://clientapi.gsn2.com/api/v1' + req.url.replace('/proxy', '');
  req.pipe(request({ uri: newUrl, method: req.method })).pipe(res);
});
app.use('/src', express.static(__dirname + '/src'));
app.use('/deep-src', express.static(__dirname + '/deep-src'));
app.use('/vendor', express.static(__dirname + '/vendor'));
app.use('/asset', express.static(__dirname + '/asset'));
app.use(express.static(path.join(__dirname, 'example')));

app.listen(3280, function(e) {
	console.log('server started');
});