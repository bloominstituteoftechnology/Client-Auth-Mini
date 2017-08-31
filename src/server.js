const bodyParser = require('body-parser');
const express = require('express');          // https://www.npmjs.com/package/express
const session = require('express-session');  // https://www.npmjs.com/package/express-session
const cors = require('cors');                // https://github.com/expressjs/cors

const User = require('./user');   // <~~~ added
const bcrypt = require('bcrypt'); // <~~~ added https://www.npmjs.com/package/bcrypt
const path = require('path');     // <~~~ added

const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;  // <~~~ added
const BCRYPT_COST = 11;

const server = express();

// server.use(cors());               // <~~~ added GLOBAL CORS

server.use(bodyParser.json()); // <~~~ Higher Order Function

// express-session deprecated undefined resave option; provide resave option src/server.js:19:12
// express-session deprecated undefined saveUninitialized option; provide saveUninitialized option src/server.js:19:12
server.use(session({  // <~~~ Higher Order Function
  secret: 'e5SPiqsEtjexkTj3Xqovsjzq8ovjfgVDFMfUzSmJO21dtXs4re',
  // https://github.com/expressjs/session/issues/56
  // https://github.com/expressjs/session#options
  resave: true,
  saveUninitialized: false,
}));

// HELPER FUNCTIONS
const sendUserError = (err, res) => {
  res.status(STATUS_USER_ERROR);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};
const sendServerError = (err, res) => {
  res.status(STATUS_SERVER_ERROR);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};


// LOCAL MIDDLEWARE TO CONFIRM USER NAME AND PASSWORD
const confirmNameAndPassword = ((req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    sendUserError('Please enter BOTH a USERNAME and a PASSWORD.', res);
    return;
  }
  next();
});
// REGISTER A USER: POST THEIR USERNAME AND PASSWORD
// ALSO WITH CORS MIDDLEWARE
server.post('/users', cors(), confirmNameAndPassword, (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, BCRYPT_COST, (err, passwordHash) => {
    //  VVV ------------------------------------- WHAT COULD CAUSE AN ERROR HERE? (Just programming mistakes? Bad user input?)
    if (err) sendServerError({ 'That password broke us :_(': err.message, 'ERROR STACK': err.stack }, res);
    new User({ username, passwordHash })
    .save((error, user) => {
      if (error) {
        sendUserError({ [`The name '${username}' is already taken.`]: error.message, 'ERROR STACK': error.stack }, res);
        return;
      }
      res.json(user);
    });
  });
});
// LOGIN IN "REGISTERED" USER
// ALSO WITH CORS MIDDLEWARE
server.post('/login', cors(), confirmNameAndPassword, (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username })
  .exec()
  .then((loggingInUser) => {
    if (!loggingInUser) {
      sendUserError(`Who are you? I don't know no '${username}'! Please go to /users and create an account`, res);
    // MSG IF ALREADY LOGGED IN:
    } else if (req.session.user) {
      if (req.session.user.username === username) {
        res.json('You are already logged in, silly!');
      }
    } else {
      bcrypt.compare(password, loggingInUser.passwordHash, (err, isValid) => {
        if (err) { // <~~~~~~~~~~~~~~~~~~~~~~~~~~ WHAT COULD CAUSE AN ERROR HERE? (Just programming mistakes?)
          sendServerError({ 'Yeah.... no': err }, res);
          return;
        }
        if (!isValid) {
          sendUserError('That password just aint right!', res);
        } else {
          req.session.user = loggingInUser;
          res.json({ success: true });
        }
      });
    }
  })
  .catch((error) => {
    sendUserError({ 'CAUGHT RED HANDED!!!': error.message, 'ERROR STACK': error.stack }, res);
  });
});


// LOCAL MIDDLEWARE TO CONFIRM REGISTERED USER IS LOGGED IN
const isRegisteredUserLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    sendUserError('yoYOyo-yo!!! You gots to LOG IN, bruh!!!', res);
  } else {
    req.user = req.session.user;
    next();
  }
};
server.get('/me', isRegisteredUserLoggedIn, (req, res) => {
  res.json(req.user);
});


// GLOBAL MIDDLEWARE for EXTRA CREDIT http://localhost:3000/restricted/...
// USING JS REGEX
server.use((req, res, next) => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
  if (req.path.match(/restricted\/[\S]/)) { // <~~~~~~~~~~ props to Ely!!!!!!!!
    if (!req.session.user) {
      sendUserError('Who do you think you are????!!!???', res);
      return;
    }
    res.json(`Well, hello there ${req.session.user.username}. Welcome to the InterZone.`);
  }
  next();
});
// GLOBAL MIDDLEWARE for EXTRA CREDIT http://localhost:3000/top-secret/...
// USING WILDCARD *
// ALSO WITH CORS MIDDLEWARE
server.use('/top-secret/*', cors(), (req, res, next) => { // <~~~~ props to Antonio & Jake!!
  if (!req.session.user) {
    sendUserError('You need to tell us who you are for TOP-SECRET STUFF!!!', res);
    return;
  }
  next();
});
server.get('/top-secret/*', (req, res) => {
  res.json(`Hi ${req.session.user.username}. Val Kilmer was great in, 'TOP-SECRET' (1984).`);
});


// LOG-OUT - Q: SHOULD THIS BE AN HTTP DELETE OR POST METHOD?
//           A: PUT to modify login status, DELETE to remove the user from record
// https://www.npmjs.com/package/express-session
server.delete('/logout', (req, res) => {
  if (req.session.user === undefined) {
    res.json('You gotta log in before you can log out');
    return;
  }
  req.session.destroy((err) => { // <~~~~~~~~~~~~ WHAT COULD CAUSE AN ERROR HERE? (Just programming mistakes? Server timeout? etc.?)
    if (!err) {
      res.json('GedOUTTAhea!');
      return;
    }
    sendServerError(err, res);
  });
});

// DEMONSTRATING INDEPENDENT CLIENT SESSIONS
server.get('/view-counter', (req, res) => {
  const sehShun = req.session;
  if (!sehShun.viewCount) {
    sehShun.viewCount = 0;
  }
  sehShun.viewCount++;
  res.json({ viewCount: sehShun.viewCount });
});

module.exports = { server };
