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

// app.use(function (req, res, next) {
//   console.log(
//     // Object.keys(req),
//     req.url)
//   next()
// });

app.use('/proxy', function (req, res) {
  if (req.isAuthenticated()){
    proxy.web(req, res, { target: 'http://amazon.com' });
  } else {
    res.redirect('/login');
  }
});

require('./config/routes')(app, config, passport);

selfSignedHttps(
  app
)
.listen(config.app.port, function () {
  console.log('Express server listening on port ' + config.app.port);
});


