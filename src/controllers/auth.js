// controllers/auth.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/postgress');
const { param, use } = require('../routes/auth');
dotenv = require('dotenv');
dotenv.config();

const jwtSecretKey = process.env.JWT_SECRET_KEY;

async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let query = `SELECT email FROM auth.users WHERE email = $1`;
    let rows = await db.any(query, [email]);
    if(rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    // Store user in database
    query = 'INSERT INTO auth.users (username, email, password) VALUES ($1, $2, $3) RETURNING *';
    rows  = await db.any(query, [username, email, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully', user: rows });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Retrieve user from database
    const query = 'SELECT email, last_login, auth0User, password FROM auth.users WHERE email ILIKE $1';
    let rows = await db.any(query, [email]);
    console.log("rows", rows);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    } else if(rows[0].auth0user) {
      console.log("User registered with social login");
      return res.status(400).json({ error: 'User registered with social login' });
    }
    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userEmail: user.email, lastLogin: user.last_login }, jwtSecretKey, { expiresIn: 60*60 });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function logoutUser(req, res) {
  try {
    const { email } = req.body;
    const query = 'UPDATE auth.users SET last_login = NOW() WHERE email ILIKE $1 RETURNING email, last_login';
    const rows = await db.any(query, [email]);
    const user = rows[0];
    if(!user.email){
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Logout successful', user: user.user});
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function socialLogin(user) {
  // Implementation for social login
  try {
    let query = `SELECT email FROM auth.users WHERE email = $1`;
    let row = await db.any(query, [user.email]);
    if(row.length === 0) {
      query = `INSERT INTO auth.users (email, name, last_login, auth0User) VALUES ($1, $2, $3, $4) RETURNING *`;
      row = await db.any(query, [user.email, user.name, user.updated_at, true]);
    }
    else {
      query = `UPDATE auth.users SET last_login = $1 WHERE email = $2 RETURNING *`;
      row = await db.any(query, [user.updated_at, user.email]);
    }
    const token = jwt.sign({ userEmail: user.email, lastLogin: user.updated_at }, process.env.JWT_SECRET_KEY, { expiresIn: 60*60 });

    return token;
  } catch (error) {
    console.error('Error logging in user:', error);
  }
}

module.exports = { registerUser, loginUser, logoutUser, socialLogin };
