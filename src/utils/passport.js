const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../user');
const { secret } = require('../config');

module.exports = async (passport) => {
  try {
    const options = {
      usernameField: 'username',
      passwordField: 'password',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret
    };
    passport.use(new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await User.findOne({ id: payload.id });
        if (!user) done(null, false);
        else done(null, user);
      } catch (error) {
        throw new Error(error);
      }
    }));
  } catch (error) {
    throw new Error(error);
  }
};
