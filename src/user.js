const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Clear out mongoose's model cache to allow --watch to work for tests:
// https://github.com/Automattic/mongoose/issues/1251
mongoose.models = {};
mongoose.modelSchemas = {};

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/users', { useMongoClient: true });

const UserSchema = new mongoose.Schema({
  // TODO: fill in this schema

  username: {
    type: String,
    // unique: true,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  }
});

UserSchema.pre('save', function (next) {
  console.log('pre');

  bcrypt.hash(this.passwordHash, 11, (err, hash) => {
    if (err) {
      return next(err);
    }

    this.passwordHash = hash;
    return next();
  });
});


UserSchema.methods.isPasswordValid = function (passFail) {
  return bcrypt.compare(passFail, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
