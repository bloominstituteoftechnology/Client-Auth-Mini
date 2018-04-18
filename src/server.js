const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');

const User = require('./user');

const STATUS_USER_ERROR = 422;
const BCRYPT_COST = 11; //! never gets used because out of scope when used

const server = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
server.use(cors(corsOptions));

server.use(express.json());
server.use(
  session({
    secret: 'e5SPiqsEtjexkTj3Xqovsjzq8ovjfgVDFMfUzSmJO21dtXs4re',
    cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 }, //! milliseconds
    secure: false,
    name: 'auth', //! why do we call this auth?
    resave: true, //! True or False? Which? Why?
    saveUninitialized: false, //! True or False? Which? Why?
    store: new MongoStore({
      url: 'mongodb://localhost/sessions',
      ttl: 10 * 60, //! seconds where is this in mongoCompass?
    }),
  })
);

const sendUserError = (err, res) => {
  res.status(STATUS_USER_ERROR);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};

const checkUsername = (req, res, next) => {
  const { username } = req.body;
  if (!username || !username.trim()) {
    return sendUserError('Must enter a username', res); //! which  way is preferred?
  }
  next(); // ? All good ... continue to next middleware
};

const checkPassword = (req, res, next) => {
  const { password } = req.body;
  if (!password || !password.trim()) {
    sendUserError('Must enter a password', res);
    return; //! Is return necessary? Looks like yes ...
  }
  next(); // ? All good ... continue to next middleware
};

const authenticateUser = (req, res, next) => {
  const { username } = req.session;

  if (username) {
    User.findOne({ username })
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => {
        return sendUserError(err, res);
      });
  } else {
    res.status(500).json({ message: 'you must be logged in to access route' });
  }
};

server.use('/restricted*', authenticateUser); //! sketchy stretch code

/* Sends the given err, a string or an object, to the client. Sets the status */
/* code appropriately. */

// TODO: implement routes

server.post('/users', checkUsername, checkPassword, (req, res) => {
  const { username, password } = req.body;

  // if (username && password) {
  // TODO *** put this in local middleware

  const user = new User({ username, passwordHash: password }); //! refactored to work with UserSchema.pre lifecylce hook
  user
    .save()
    .then(savedUser => {
      res.status(201).json(savedUser);
    })
    .catch(err => {
      sendUserError(err, res); //! What should be the error here?
      return;
    });
  // } else {
  //   sendUserError('username and password field are required.', res);
  // }
});

server.post('/login', checkUsername, checkPassword, (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username })
    .then(user => {
      user.isPasswordValid(password).then(isValid => {
        if (isValid) {
          req.session.username = username;
          res.status(200).json({ success: true });
        } else {
          return sendUserError('password is not valid', res);
        }
      });
    })
    .catch(err => {
      return sendUserError('username not in database', res);
    });
});

// TODO: add local middleware to this route to ensure the user is logged in
server.get('/me', authenticateUser, (req, res) => {
  // Do NOT modify this route handler in any way.
  res.json(req.user);
});

server.get('/users', (req, res) => {
  User.find({})
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => sendUserError(err, res)); //! lack of return okay here? Nowhere else to go
});

server.post('/logout', (req, res) => {
  const { username } = req.body;
  if (req.session.username) {
    req.session.destroy();
    res.status(200).json({ msg: `session logged out (${username})` });
  } else {
    return sendUserError(`${username} wasn't logged in, so can't log out`, res);
  }
});

server.get('/restricted/users', (req, res) => {
  res.status(200).json({ msg: 'Danger zone!' });
});
module.exports = { server };
