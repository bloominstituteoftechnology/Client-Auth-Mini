const express = require('express');
const { getAllUsers } = require('../controllers/user');

const router = express.Router();

const secretResponder = (req, res) => {
  res.json({ success: 'You made it to the super secret restricted route' });
};

router.get('/users', getAllUsers);
router.get('/other', secretResponder);
router.get('/a', secretResponder);

module.exports = router;
