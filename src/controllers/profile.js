const db = require('../db/postgress');
const bcrypt = require('bcrypt');

async function getUserProfile(req, res) {
  try {
    const userId = req.params.userId;

    // Retrieve user profile from database
    const query = 'SELECT id, username, email, bio, phone, photo, is_public FROM auth.users WHERE id = $1';
    const rows = await db.any(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
 
    const userProfile = rows[0];

    // Check if profile is public or if user is admin
    if (!userProfile.is_public && !req.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllUsers(req, res) {
  try {
    // Retrieve all users from database
    let { page, size, isAdmin } = req.query;

    const  query = `SELECT id, name, username, email, bio, phone, photo FROM auth.users ${isAdmin ? 'WHERE is_public = true' : ''} LIMIT $1 OFFSET $2`;
    const  rows = await db.any(query, [size, (page - 1) * size]);

    const users = rows;

    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function editUserProfile(req, res) {
  try {
    const userId = req.params.userId;
    const { name, bio, phone, photo } = req.body;

    // Update user profile in database
    const query = 'UPDATE auth.users SET name = $1, bio = $2, phone = $3, photo = $4 WHERE id = $5 RETURNING *';
    const rows = await db.any(query, [name, bio, phone, photo, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedProfile = rows[0];
    delete updatedProfile.password;

    res.status(200).json({ message: 'Profile updated successfully', user: updatedProfile });
  } catch (error) {
    console.error('Error editing user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function editUserEmail(req, res) {
  try {
    const userId = req.params.userId;
    const { email } = req.body;

    let query = 'SELECT email FROM auth.users WHERE email ILIKE $1';
    let rows = await db.any(query, [email]);

    if (rows.length !== 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Update user profile in database
    query = 'UPDATE auth.users SET email = $1 WHERE id = $2 RETURNING *';
    rows = await db.any(query, [email, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedProfile = rows[0];
    delete updatedProfile.password;

    res.status(200).json({ message: 'Profile updated successfully', user: updatedProfile });
  } catch (error) {
    console.error('Error editing user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function editUserPassword(req, res) {
  try {
    const userId = req.params.userId;
    const { currentPassword, newPassword } = req.body;

    // Retrieve user from database
    const query = 'SELECT * FROM auth.users WHERE id = $1';
    const rows = await db.any(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Update password in database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateQuery = 'UPDATE auth.users SET password = $1 WHERE id = $2 RETURNING email';
    const updatedRows = await db.any(updateQuery, [hashedPassword, userId]);

    const updatedUser = updatedRows[0];

    res.status(200).json({ message: 'Password updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error editing user password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

}

async function editUserPrivacy(req, res) {
  try {
    const userId = req.params.userId;
    const { isPublic } = req.body;

    // Update user privacy in database
    const query = 'UPDATE auth.users SET is_public = $1 WHERE id = $2 RETURNING email';
    const rows = await db.any(query, [isPublic, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedProfile = rows[0];

    res.status(200).json({ message: 'Privacy updated successfully', user: updatedProfile });
  } catch (error) {
    console.error('Error editing user privacy:', error);
    res.status(500).json({ error: 'Internal server errors' });
  }

}

module.exports = { getUserProfile, editUserProfile, editUserPassword, editUserPrivacy, getAllUsers, editUserEmail };
