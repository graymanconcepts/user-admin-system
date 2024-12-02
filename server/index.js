import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

// Database initialization
let db;
async function initializeDb() {
  db = await open({
    filename: 'users.db',
    driver: sqlite3.Database
  });

  // Drop and recreate audit_logs table to modify schema
  await db.exec(`
    DROP TABLE IF EXISTS audit_logs;
    
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      organizationalUnit TEXT,
      managerEmail TEXT,
      lastLogin TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      userId INTEGER,
      userName TEXT NOT NULL,
      details TEXT,
      performedBy INTEGER,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (performedBy) REFERENCES users(id)
    );
  `);

  // Initialize admin account
  try {
    const adminData = JSON.parse(await readFile('admin.json', 'utf8'));
    const existingAdmin = await db.get('SELECT id FROM users WHERE email = ?', adminData.email);
    
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync(adminData.password, 10);
      await db.run(
        'INSERT INTO users (email, password, name, status, organizationalUnit, managerEmail) VALUES (?, ?, ?, ?, ?, ?)',
        [adminData.email, hashedPassword, adminData.name, adminData.status, adminData.organizationalUnit, adminData.managerEmail]
      );
      console.log('Admin account initialized');
    }
  } catch (error) {
    console.error('Error initializing admin account:', error);
  }
}

// Helper function for audit logging
async function logAuditEvent(action, userId, userName, performedBy, details) {
  await db.run(
    'INSERT INTO audit_logs (action, userId, userName, details, performedBy) VALUES (?, ?, ?, ?, ?)',
    [action, userId, userName, details, performedBy]
  );
}

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.get('SELECT * FROM users WHERE email = ?', email);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    await db.run('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?', user.id);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get users
app.get('/api/users', authenticateToken, async (req, res) => {
  const users = await db.all('SELECT id, email, name, status, lastLogin, organizationalUnit FROM users');
  res.json(users);
});

// Get user details
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  const user = await db.get(
    'SELECT id, email, name, status, lastLogin, organizationalUnit, managerEmail FROM users WHERE id = ?',
    req.params.id
  );
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Create user
app.post('/api/users', authenticateToken, async (req, res) => {
  const { email, password, name, organizationalUnit, managerEmail } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const result = await db.run(
      'INSERT INTO users (email, password, name, organizationalUnit, managerEmail) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, organizationalUnit, managerEmail]
    );

    await logAuditEvent('create_user', result.lastID, name, req.user.id, `Created user: ${email}`);
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  const { name, status, organizationalUnit, managerEmail } = req.body;
  
  try {
    await db.run(
      'UPDATE users SET name = ?, status = ?, organizationalUnit = ?, managerEmail = ? WHERE id = ?',
      [name, status, organizationalUnit, managerEmail, req.params.id]
    );

    await logAuditEvent('update_user', req.params.id, name, req.user.id, 'Updated user details');
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reset password
app.post('/api/users/:id/reset-password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  try {
    await db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.params.id]
    );
    
    await logAuditEvent('reset_password', req.params.id, (await db.get('SELECT name FROM users WHERE id = ?', req.params.id)).name, req.user.id, 'Password reset');
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user
app.post('/api/users/:id/delete', authenticateToken, async (req, res) => {
  try {
    // Check if user exists
    const user = await db.get('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log the deletion before deleting the user
    await logAuditEvent('delete_user', req.params.id, user.name, req.user.id, `Deleted user: ${user.email}`);

    // Delete the user
    await db.run('DELETE FROM users WHERE id = ?', req.params.id);

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get audit logs
app.get('/api/audit-logs', authenticateToken, async (req, res) => {
  const logs = await db.all(`
    SELECT 
      audit_logs.*,
      performers.email as performerEmail
    FROM audit_logs
    LEFT JOIN users performers ON performers.id = audit_logs.performedBy
    ORDER BY timestamp DESC
  `);
  
  res.json(logs);
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
initializeDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});