const express = require('express');
const session = require('express-session');
const cors = require('cors');
const User = require('./user.js');

const STATUS_USER_ERROR = 422;

const server = express();
server.use(express.json());

const corsSetUp = {
  origin: "http://localhost:5000",
  credentials: true
};

server.use(session({
  secret: 'e5SPiqsEtjexkTj3Xqovsjzq8ovjfgVDFMfUzSmJO21dtXs4re',
  resave: true,
  saveUninitialized: false,
}));

server.use(cors(corsSetUp));

const auth = (req, res, next) => {
  User.find({ username: req.session.user })
  .then(activeUser => {
    if (activeUser.length) {
      req.user = req.session.user;
      next();
    } else {
      sendUserError({ message: `You must be logged in`}, res)
    }
  })
  .catch(err => {
    sendUserError({ message: `User not found`}, res);
  });
};

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

server.post('/users', (req, res) => {
  const userInfo = req.body;
  const user = new User(userInfo);
    user
      .save()
      .then((savedUser) => {
        res
          .status(200)
          .json(savedUser);
      })
      .catch((err) => {
        res
          .status(500)
          .json({ MESSAGE: 'There was an error saving the user' });
      });
});

server.post('/login', (req, res) => {
  const session = req.session;
  const username = req.body.username.toLowerCase();
  const potentialPW = req.body.password;

  if (!potentialPW || !username) {
    sendUserError(`Username and password required`, res);
    return;
  }

  User.findOne({ username }, (err, user) => {
    if (err) {
      return sendUserError(err);
    }
    user.checkPassword(potentialPW, (err, isMatch) => {
      if (isMatch) {
        req.session.user = user.username;
        req.session.loggedIn = true;
        res.status(200).json({ isLoggedIn: true });
      } else {
        res.status(401).json({ isLoggedIn: false });
      }
    });
  })
    .catch((err) => {
      res
        .status(500)
        .json({ message: `There was an error logging in.`, error: `No user found.` });
    });
});

server.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json(`You have been logged out`);
})

server.get('/me', auth, (req, res) => {
  // Do NOT modify this route handler in any way.
  res.json(req.user);
});

module.exports = { server };
