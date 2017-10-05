const authRoutes = require('./auth');
const userRoutes = require('./user');
const restrictedRoutes = require('./restricted');


const passport = require('passport');

require('../utils/passport')(passport);


module.exports = (server) => {
  server.use('/auth', authRoutes);
  server.use('/user', userRoutes);
  server.use('/restricted', passport.authenticate('jwt', { session: false }), restrictedRoutes);
  // Handle unspecified routes
  server.use((req, res) => res.status(404).json({
    error: `Unable to resolve ${req.originalUrl}`
  }));
};
