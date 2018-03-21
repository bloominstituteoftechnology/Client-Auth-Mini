/* eslint-disable */

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');
const User = require('./user');

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

const STATUS_USER_ERROR = 422;

const server = express();
server.use(bodyParser.json());
server.use(
  session({
    secret: 'e5SPiqsEtjexkTj3Xqovsjzq8ovjfgVDFMfUzSmJO21dtXs4re',
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      autoRemove: 'interval',
      autoRemoveInterval: 10,
    }),
  }),
);
server.use(cors(corsOptions));

server.use((req, res, next) => {
  if (req.originalUrl.includes('/restricted')) {
    checkIfLoggedIn(req, res, next);

    if (!req.username) return;
  }

  next();
});

const sendUserError = (err, res) => {
  res.status(STATUS_USER_ERROR);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};

const checkIfLoggedIn = (req, res, next) => {
  if (!req.session.username) {
    sendUserError('Not logged in.', res);
    return;
  }

  User.findById(req.session.username).then(foundUser => {
    if (foundUser === null) {
      sendUserError('Logged in user not found in db.', res);
      return;
    }

    req.user = foundUser;
    next();
  });
};

server.post('/users', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    sendUserError('Please provide a username and/or password.', res);
    return;
  }

  User({ username, passwordHash: password })
    .save()
    .then(savedUser => res.json(savedUser))
    .catch(err => sendUserError(err, res));
});

// server.post('/log-in', (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     sendUserError('Please provide a username and/or password.', res);
//     return;
//   }

//   if (req.session.username) {
//     sendUserError('There is a user already logged in.', res);
//     return;
//   }

//   User.findOne({ username }).then(foundUser => {
//     if (!foundUser) {
//       sendUserError('User not found in db.', res);
//       return;
//     }

//     foundUser.checkPassword(password, (isValid, err) => {
//       if (err) {
//         sendUserError(err, res);
//         return;
//       }

//       if (isValid) {
//         req.session.username = foundUser._id;
//         res.json({ success: true });
//         return;
//       }

//       sendUserError('Invalid password.', res);
//     });
//   });
// });

server.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    sendUserError('Please provide a username and/or password.', res);
    return;
  }

  if (req.session.username) {
    sendUserError('There is a user already logged in.', res);
    return;
  }

  User.findOne({ username }).then(foundUser => {
    if (!foundUser) {
      sendUserError('User not found in db.', res);
      return;
    }

    foundUser.checkPassword(password, (isValid, err) => {
      if (err) {
        sendUserError(err, res);
        return;
      }

      if (isValid) {
        req.session.username = foundUser._id;
        res.json({ success: true });
        return;
      }

      sendUserError('Invalid password.', res);
    });
  });
});

server.get('/log-out', (req, res) => {
  if (!req.session.username) {
    sendUserError('Not logged in.', res);
    return;
  }

  req.session.username = undefined;
  res.json({ message: 'Successfully logged out.' });
});

server.get('/me', checkIfLoggedIn, (req, res) => {
  res.json(req.user);
});

server.get('/restricted/something', (req, res) => {
  res.json({
    message: `something restricted accessed by ${req.user.username}`,
  });
});

server.get('/restricted/other', (req, res) => {
  res.json({ message: `other restricted accessed by ${req.user.username}` });
});
server.get('/restricted/a', (req, res) => {
  res.json({ message: `a restricted accessed by ${req.user.username}` });
});

module.exports = { server, sendUserError };
