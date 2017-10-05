const User = require('../user');
const { sendUserError } = require('../utils/error');

const generateUserToken = require('../utils/jwtToken');

module.exports = {

  registerUser: async (req, res) => {
    const { username, password: passwordHash } = req.body;
    const newUser = new User({ username, passwordHash });
    try {
      const success = await newUser.save();
      
      /* eslint no-underscore-dangle: 0 */
      res.json({
        token: await generateUserToken({
          _id: success._id,
          username: success.username
        })
      });
    } catch (error) {
      sendUserError(error, res);
    }
  },

  loginUser: async (req, res) => {
    const { username, password } = req.body;
    try {
      if (!username || !password) throw new Error('username and password required');

      const user = await User.findOne({ username });
      if (!user) throw new Error('not a valid username / password combination');

      const passwordMatch = await user.checkPassword(password);
      if (!passwordMatch) throw new Error('not a valid username / password combination');

      const token = await generateUserToken({ _id: user._id, username });
      res.json({ token });
    } catch (error) {
      sendUserError(error.message, res);
    }
  },

  logoutUser: (req, res) => {
    return res.json({ success: 'User logged out' });
  }
};
