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

  await db.exec(`
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
      details TEXT,
      performedBy INTEGER,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
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

    await db.run(
      'INSERT INTO audit_logs (action, userId, performedBy, details) VALUES (?, ?, ?, ?)',
      ['create_user', result.lastID, req.user.id, `Created user: ${email}`]
    );

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

    await db.run(
      'INSERT INTO audit_logs (action, userId, performedBy, details) VALUES (?, ?, ?, ?)',
      ['update_user', req.params.id, req.user.id, 'Updated user details']
    );

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
    
    await db.run(
      'INSERT INTO audit_logs (action, userId, performedBy, details) VALUES (?, ?, ?, ?)',
      ['reset_password', req.params.id, req.user.id, 'Password reset']
    );

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
      users.email as userEmail,
      performers.email as performerEmail
    FROM audit_logs
    LEFT JOIN users ON users.id = audit_logs.userId
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