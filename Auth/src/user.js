/* eslint-disable */

const mongoose = require('mongoose');
const { user, pass, authSource } = require('../config.js');

const bcrypt = require('bcrypt');
const BCRYPT_COST = 11;

const { sendUserError } = require('./server');

mongoose.models = {};
mongoose.modelSchemas = {};

mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost/users', {
  useMongoClient: true,
  user,
  pass,
  authSource,
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
});

UserSchema.pre('save', function(next) {
  bcrypt.hash(this.passwordHash, BCRYPT_COST, (err, hash) => {
    if (err) {
      sendUserError(err, res);
      return;
    }

    this.passwordHash = hash;
    next();
  });
});

UserSchema.methods.checkPassword = function(password, cb) {
  bcrypt.compare(password, this.passwordHash, (isValid, err) => {
    err ? cb(err) : cb(isValid);
  });
};

module.exports = mongoose.model('User', UserSchema);
