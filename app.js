var express = require('express');
var path = require('path');
var passport = require('passport');
var selfSignedHttps = require('self-signed-https');

// Create a proxy server with custom application logic
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

require('./config/passport')(passport, config);

var app = express();

app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'butterbean' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/add', prox('http://127.0.0.1:4003'));
app.use('/reverse', prox('http://127.0.0.1:4002'));

function prox (url) {
  return function (req, res) {
    if (req.isAuthenticated()){
      return proxy.web(req, res, { target: url });
    } else {
      res.send('Please log in.');
    }
  }
}

require('./config/routes')(app, config, passport);

selfSignedHttps(app).listen(config.app.port, function () {
  console.log('Proxy server listening on port ' + config.app.port);
});







var add = express();

add.use(express.bodyParser());

add.use('/', function (req, res) {
  console.log(req.originalUrl)
  res.send(req.query.foo + 'two');
});

add.listen(4003, 'localhost', function () {
  console.log('Add API server listening on port 4003');
});


var reverse = express();

reverse.use(express.bodyParser());

reverse.use('/', function (req, res) {
  res.send(req.query.foo && req.query.foo.split('').reverse().join(''));
});

reverse.listen(4002, 'localhost', function () {
  console.log('Add API server listening on port 4002');
});
