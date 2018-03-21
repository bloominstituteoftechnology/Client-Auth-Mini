/* eslint-disable */

const bodyParser = require('body-parser');
const express = require('express');
const User = require('./user');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');

const STATUS_USER_ERROR = 422;
const BCRYPT_COST = 11;


const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());
server.use(
  session({
    secret: 'e5SPiqsEtjexkTj3Xqovsjzq8ovjfgVDFMfUzSmJO21dtXs4re'
  })
);

const corsOptions = {
     "origin": "http://localhost:3000",
     "credentials": true
 };
 server.use(cors(corsOptions));

/* Sends the given err, a string or an object, to the client. Sets the status
* code appropriately. */
const sendUserError = (err, res) => {
  res.status(STATUS_USER_ERROR);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};

const handleLogin = (req, res, next) => {
  const { username, password } = req.body;
  if (!username) {
    sendUserError('No username', res);
    return;
  }
  if (!password) {
    sendUserError('No password', res);
    return;
  }
  User.find({ username })
    .then(user => {
      req.hashedPassword = user[0].passwordHash;
      next();
    })
    .catch(err => {
      sendUserError(err, res);
    });
};

const checkLoggedIn = (req, res, next) => {
  if (req.session.loggedIn) {
    User.findOne({ username: req.session.username })
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => {
        sendUserError(err, res);
      });
  } else {
    sendUserError('You must log in first', res);
  }
};

const restrictedPermissions = (req, res, next) => {
  // const path = req.path;
  // if (/restricted/test(path)) {
  if (!req.session.username) {
    sendUserError('You must login first.', res);
    return;
  }
  // }
  next();
};

server.use('/restricted', restrictedPermissions);

// TODO: implement routes

// TODO: add local middleware to this route to ensure the user is logged in
server.get('/me', checkLoggedIn, (req, res) => {
  // Do NOT modify this route handler in any way.
  console.log(req.user);
  res.json(req.user);
});

server.post('/users', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(STATUS_USER_ERROR)
      .json({ errorMessage: 'Must provide both a username and a password.' });
  } else {
    bcrypt.hash(password, BCRYPT_COST, (err, hash) => {
      const newUser = { username, passwordHash: hash };
      const user = new User(newUser);
      if (err) {
        sendUserError(err, res);
      } else {
        user
          .save()
          .then(savedUser => {
            res.status(200).json(savedUser);
          })
          .catch(error => {
            sendUserError(error, res);
          });
      }
    });
  }
});

server.post('/login', handleLogin, (req, res) => {
  const { username, password } = req.body;
  const hash = req.hashedPassword;

  bcrypt.compare(password, hash, (err, isValid) => {
    if (err) {
      sendUserError(err, res);
    }
    if (isValid) {
      req.session.loggedIn = true;
      req.session.username = username;
      res.json({ success: true });
    } else {
      sendUserError('Invalid username and password', res);
    }
  });
});

server.post('/logout', (req, res) => {
  //if (req.body.username === req.session.username) {
    req.session.username = null;
    req.user = null;
    req.session.loggedIn = false;
    res.json({ success: true });
});

server.get('/restricted/something', (req, res) => {
  res.json({
    message: "you are viewing restricted info because you're logged in."
  });
});

module.exports = { server };
