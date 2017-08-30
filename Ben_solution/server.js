const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

const User = require('./user');

const app = express();

app.use(bodyParser.json());

app.use(session({
  secret: 'e5SPiqsEtjexkTj3Xqovsjzq8ovjfgVDFMfUzSmJO21dtXs4re',
  resave: true,
  saveUninitialized: false
}));

const sendUserError = (err, res) => {
  res.status('422');
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};

app.post('/users', (req, res) => {
  const { username, password } = req.body;
  if (!password) {
    sendUserError('Must provide password', res);
    return;
  }

  bcrypt.hash(password, 11, (err, hash) => {
    if (err) {
      sendUserError('couldn\'t hash password', res);
      return;
    }

    const user = new User({ username, password: hash });

    user.save((err, user) => {
      if (err) {
        sendUserError(err, res);
        return;
      }
      res.json(user);
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    sendUserError('Must provide username', res);
    return;
  }
  if (!password) {
    sendUserError('Must provide password', res);
    return;
  }

  User.findOne({ username }, (err, user) => {
    if (err) {
      sendUserError(err, res);
      return;
    }
    if (!user) {
      sendUserError('Bad credentials', res);
      return;
    }

    bcrypt.compare(password, user.password, (compareErr, valid) => {
      if (compareErr) {
        sendUserError(compareErr, res);
        return;
      }
      if (!valid) {
        sendUserError('Bad credentials', res);
        return;
      }

      req.session.username = user.username;
      res.json({ success: true });
    });
  });
});

app.post('/log-out', (req, res) => {
  if (!req.session.username) {
      sendUserError('Must be logged in', res);
      return;
  }

  req.session.username = null;
  res.json({ success: true });
});

const ensureLoggedIn = (req, res, next) => {
  const { username } = req.session;
  if (!username) {
    sendUserError('Must be logged in', res);
    return;
  }

  User.findOne({ username }, (err, user) => {
    if (err) {
      sendUserError(err, res);
    } else if (!user) {
      sendUserError('Must be logged in', res);
    } else {
      req.user = user;
      next();
    }
  });
};

app.get('/me', ensureLoggedIn, (req, res) => {
  res.json(req.user);
});

app.get('/restricted/users', (req, res) => {
  User.find({})
      .exec()
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        sendUserError(err, res);
      });
});

const checkRestricted = (req, res, next) => {
  const path = req.path;
  if (/restricted/.test(path)) {
    if (!req.session.username) {
      sendUserError('Must be logged in to access a restricted path', res);
    }
  }
  next();
};

app.use(checkRestricted);

/* eslint no-console: 0 */
app.listen(8080, () => {
  console.log('Server listening on port 8080');
});
