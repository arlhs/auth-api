const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


function authUser(req, res, next) {
  // Extract token from request header
  const bearerHeader = req.header('Authorization');
  if (!bearerHeader) {
    return res.status(401).json({ error: 'Access denied. No Authorization header provided' });
  }
  const bearer = bearerHeader.split(' ');
  const token = bearer[1];
  console.log("token", token);
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.email = decoded.userEmail;
    next();
  } catch (error) {
    console.error('Error authenticating user:', error.message);
    res.status(401).json({ error: `Invalid token: ${error.message}` });
  }
}

module.exports = { authUser };
