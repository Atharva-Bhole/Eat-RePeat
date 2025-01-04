const express = require('express');
const { registerUser, loginUser, LogOut, forgotPassword } = require('../controllers/userController');

const router = express.Router();


router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(LogOut);
router.route('/forgot/password').post(forgotPassword);
module.exports = router;