const express = require('express');
const router = express.Router();
const { getUserProfile, editUserProfile, editUserPassword, editUserPrivacy, getAllUsers, editUserEmail} = require('../controllers/profile.js');
const { requiresAuth } = require('express-openid-connect');

router.get('/profile', requiresAuth);
router.get('/get-all-user', getAllUsers);
router.get('/:userId', getUserProfile);
router.put('/:userId', editUserProfile);
router.put('/change-email/:userId', editUserEmail);
router.put('/change-password/:userId', editUserPassword);
router.put('/change-privacy/:userId', editUserPrivacy);

module.exports = router;