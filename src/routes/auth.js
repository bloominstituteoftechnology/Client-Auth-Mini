const express = require('express');

const router = express.Router();

const { registerUser, loginUser, logoutUser } = require('../controllers/auth');

router.post('/register', registerUser);
router.post('/logout', logoutUser);
router.post('/login', loginUser);

module.exports = router;
