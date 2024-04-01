const router = require('express').Router();
const { registerUser, loginUser, logoutUser, socialLogin } = require('../controllers/auth.js');
  
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/social-login', socialLogin);

module.exports = router;