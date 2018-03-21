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
  passwordHash: { type: String, required: [true, 'Must provide a password'] }
});

UserSchema.pre('save', function (next) {
  bcrypt.hash(this.passwordHash, BCRYPT_COST).then((hashedPassword) => {
    this.passwordHash = hashedPassword;
    next();
  });
});

UserSchema.methods.checkPassword = function (potentialPassword, hashedPassword, cb) {
  console.log(`potentialPassword line 28`, potentialPassword);
  console.log(`hashedPassword line 32`, hashedPassword)
  bcrypt.compare(potentialPassword, hashedPassword, (err, isMatch) => {
    console.log(`Did we get here?`, potentialPassword);
    if (err) return err;
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
