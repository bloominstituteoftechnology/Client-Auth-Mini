const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const BCRYPT_COST = 11;

// Clear out mongoose's model cache to allow --watch to work for tests:
// https://github.com/Automattic/mongoose/issues/1251
mongoose.models = {};
mongoose.modelSchemas = {};

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/users');

const UserSchema = new mongoose.Schema({
  // TODO: fill in this schema
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: [true, 'Must provide a password'] }
});

UserSchema.pre('save', function (next) {
  bcrypt.hash(this.password, BCRYPT_COST).then((hashedPassword) => {
    this.password = hashedPassword;
    next();
  });
});

UserSchema.methods.checkPassword = function (potentialPassword, cb) {
  bcrypt.compare(potentialPassword, this.password, (err, isMatch) => {
    if (err) return err;
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
