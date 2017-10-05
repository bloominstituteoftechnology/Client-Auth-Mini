const jwt = require('jwt-simple');

const { secret } = require('../config');

module.exports = async (user) => {
  try {
    const token = await jwt.encode({
      sub: user.id,
      iat: new Date().getTime(),
    }, secret);
    return token;
  } catch (error) {
    throw new Error(error);
  }
};
