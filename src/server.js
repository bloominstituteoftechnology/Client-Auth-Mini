const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const User = require('./user.js');

const STATUS_USER_ERROR = 422;
const BCRYPT_COST = 11;

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

const auth = (req, res, next) => {
  // console.log(req.session);
  // if (req.session.loggedIn) {
  //   User.findById(req.session.loggedIn)
  //     .then((user) => {
  //       req.user = user;
  //       next();
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // } else {
  //   res.status(STATUS_USER_ERROR).send({ message: 'You are not logged in' });
  // }

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
  const userInfo = req.body; // body parser?
  bcrypt.hash(userInfo.passwordHash, 11, (hashErr, hashedPw) => {
    if (hashErr) throw new Error(hashErr);

    userInfo.passwordHash = hashedPw;
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
});

server.post('/login', (req, res) => {
  //const { username, passwordHash } = req.body;
  const session = req.session;
  const username = req.body.username.toLowerCase();
  const potentialPW = req.body.passwordHash;

  if (!potentialPW || !username) {
    sendUserError(`Username and password required`, res);
    return;
  }

  User.findOne({ username }, (err, user) => {
    if (err) {
      return sendUserError(err);
    }
    console.log(user.passwordHash);
    user.checkPassword(potentialPW, user.passwordHash, (err, isMatch) => {
      if (isMatch) {
        req.session.user = user.username;
        console.log(req.session.user);
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


server.get('/me', auth, (req, res) => {
  // Do NOT modify this route handler in any way.
  res.json(req.user);
});

module.exports = { server };

  // User
  //   .findOne({
  //     username
  //   })
  //   .then((foundUser) => {
  //     foundUser.checkPassword(potentialPW, (err, response) => {
  //       if (response) {
  //         req.session.username = username;
  //         res.status(200).json({ success: true, user: req.session.username });
  //       } else {
  //         res
  //           .status(500)
  //           .json({ success: false });
  //       }
  //     });
  //   })
