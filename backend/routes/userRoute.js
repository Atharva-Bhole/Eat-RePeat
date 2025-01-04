const express = require('express');
const { registerUser, loginUser, LogOut, forgotPassword, resetPassword } = require('../controllers/userController');

const router = express.Router();


router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(LogOut);
router.route('/password/reset').post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

module.exports = router;