var compressor = require('node-minify');
compressor.minify({
	compressor: 'uglifyjs',
	input: 'javascripts/**/*.js',
	output: './public/global.js',
	options: {
		warnings: true, 
		output: {},
		compress: {
			dead_code: true,
			global_defs: {
				DEBUG: false
			}
		}
	},
	callback: function (err, min) {}
});

compressor.minify({
	compressor: 'no-compress',
	input: 'javascripts/**/*.js',
	output: './public/global_unminified.js',
	callback: function (err, min) {}
});

var express = require('express');
var compression = require('compression');
var favicon = require('serve-favicon');
var port = process.env.port || 3000;
var app = express();
app.use(compression());
app.use(express.static('public'));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.get('/', function (req, res) {
  res.send('Hello World!');      
});

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!')
});