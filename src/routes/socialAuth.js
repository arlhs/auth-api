var router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
const { socialLogin } = require('../controllers/auth.js');

router.get('/', function (req, res, next) {
  console.log('req.oidc.isAuthenticated(): ', req.oidc.user);
  res.render('index', {
    title: 'Auth0 Webapp sample Nodejs',
    isAuthenticated: req.oidc.isAuthenticated()
  });
  // res.redirect('/profile');
});

router.get('/profile', requiresAuth(), async function (req, res, next) {
    if(!req.oidc.isAuthenticated()) {
        console.log("not authenticated");
        res.status(401).json({ error: 'User not authenticated' });
        return
    }
    const user = req.oidc.user;
    const token = await socialLogin(user);

    console.log("token aaya?", token);

  res.render('profile', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    token: token,
    title: 'Profile page'
  });
});

module.exports = router;
