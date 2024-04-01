const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const socailAuthRoutes = require('./routes/socialAuth');
const { auth } = require('express-openid-connect');
const { authUser } = require('./middleware/auth');

app.use(bodyParser.json());
console.log("vies path: ", path.join(__dirname, 'views'), __dirname);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const config = {
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    secret: process.env.SECRET,
};

app.use(auth(config));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
    res.locals.user = req.oidc.user;
    next();
});
  
app.use('/', socailAuthRoutes)
app.use('/auth', authRoutes);
app.use('/profile',authUser, profileRoutes);

app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
    console.log(`http://localhost:${port}`);
})