var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var router = express.Router();

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var session = require('express-session')

var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth')

var app = express();

// google stategy

passport.use(new GoogleStrategy({
  clientID: '124221571735-b5t8li62qid2pqkk3a714vfkvr1a5k7k.apps.googleusercontent.com',
  clientSecret: 's4-7rvZmWWRrLtGCh7Tkd_3E',
  callbackURL: "https://trailmix.firebaseapp.com/views/timeline.html"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      return done(null, profile);
    });
  }
));

passport.serializeUser(function(user,done){
  done(null, user)
})

passport.deserializeUser(function(obj,done){
  done(null, obj)
})

// view engine setup
app.use(express.static('./views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// user authenication
app.use(passport.initialize());
app.use(passport.session());


// run authentication
function ensureAuthenticated(req, res, next) {
 console.log("ensureAuthenticated",req.isAuthenticated());
 if (req.isAuthenticated()) { return next(); }
 res.redirect('/');
}

// google oauth

app.get('/auth/google',
  passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/users');
  });

app.get('/logout', function(req, res, next){
  req.logout();
  res.redirect('/')
})

// auth routes

app.use('/', routes);
app.use('/users', ensureAuthenticated, users);

// home routes

app.get('/', function(req, res, next){
  res.redirect('/index.html')
})

app.get('/timeline.html', function(req, res, next){
  res.redirect('/timeline.html')
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
