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

  // Check if tables exist
  const tablesExist = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
  
  if (!tablesExist) {
    await db.exec(`
      -- Create departments table
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Create roles table
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        CHECK (name IN ('admin', 'manager', 'employee', 'contractor'))
      );

      -- Create users table with department reference
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        name TEXT,
        password TEXT,
        roleId INTEGER,
        departmentId INTEGER,
        managerId INTEGER,
        lastLogin TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (roleId) REFERENCES roles(id),
        FOREIGN KEY (departmentId) REFERENCES departments(id),
        FOREIGN KEY (managerId) REFERENCES users(id)
      );

      -- Create audit_logs table
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        userId INTEGER,
        userName TEXT,
        performedBy INTEGER,
        details TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (performedBy) REFERENCES users(id)
      );

      -- Insert initial roles
      INSERT INTO roles (name, description) VALUES
        ('admin', 'Administrator with full access'),
        ('manager', 'Department manager'),
        ('employee', 'Regular employee'),
        ('contractor', 'External contractor');

      -- Insert initial departments
      INSERT INTO departments (name, description) VALUES
        ('Engineering', 'Software development and engineering teams'),
        ('HR', 'Human Resources department'),
        ('Sales', 'Sales and business development'),
        ('Operations', 'Business operations and support');
    `);

    // Initialize admin account
    try {
      const adminData = JSON.parse(await readFile('admin.json', 'utf8'));
      const hashedPassword = bcrypt.hashSync(adminData.password, 10);
      // Get the admin role ID and default department ID
      const adminRole = await db.get('SELECT id FROM roles WHERE name = ?', 'admin');
      const adminDept = await db.get('SELECT id FROM departments WHERE name = ?', 'Engineering');
      
      await db.run(
        'INSERT INTO users (email, password, name, roleId, departmentId, status) VALUES (?, ?, ?, ?, ?, ?)',
        [adminData.email, hashedPassword, adminData.name, adminRole.id, adminDept.id, 'active']
      );
    } catch (error) {
      console.error('Error initializing admin account:', error);
    }
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
  try {
    const users = await db.all(`
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.roleId,
        u.departmentId,
        u.managerId,
        COALESCE(u.status, 'active') as status,
        r.name as roleName,
        d.name as departmentName,
        u.lastLogin
      FROM users u
      LEFT JOIN roles r ON u.roleId = r.id
      LEFT JOIN departments d ON u.departmentId = d.id
    `);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  const user = await db.get(
    'SELECT id, email, name, roleId, departmentId, managerId FROM users WHERE id = ?',
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
  const { email, password, name, roleId, departmentId, managerId } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const result = await db.run(
      'INSERT INTO users (email, password, name, roleId, departmentId, managerId) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, roleId, departmentId, managerId]
    );

    await logAuditEvent('create_user', result.lastID, name, req.user.id, `Created user: ${email}`);
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  const { name, roleId, departmentId, managerId, status } = req.body;
  
  try {
    await db.run(
      'UPDATE users SET name = ?, roleId = ?, departmentId = ?, managerId = ?, status = ? WHERE id = ?',
      [name, roleId, departmentId, managerId, status, req.params.id]
    );

    await logAuditEvent('update_user', req.params.id, name, req.user.id, `Updated user details. Status: ${status}`);
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
    const user = await db.get('SELECT u.*, r.name as roleName FROM users u JOIN roles r ON u.roleId = r.id WHERE u.id = ?', req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion of admin users
    if (user.roleName === 'admin') {
      return res.status(403).json({ error: 'Admin users cannot be deleted' });
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

// Department endpoints
app.get('/api/departments', authenticateToken, async (req, res) => {
  try {
    const departments = await db.all('SELECT * FROM departments');
    res.json(departments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/departments', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description]
    );
    await logAuditEvent('create_department', null, req.user.name, req.user.id, `Created department: ${name}`);
    res.json({ id: result.lastID, name, description });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/departments/:id', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  try {
    await db.run(
      'UPDATE departments SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );
    await logAuditEvent('update_department', null, req.user.name, req.user.id, `Updated department: ${name}`);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Role endpoints
app.get('/api/roles', authenticateToken, async (req, res) => {
  try {
    const roles = await db.all('SELECT id, name, description FROM roles ORDER BY name');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

app.get('/api/roles/:id', authenticateToken, async (req, res) => {
  try {
    const role = await db.get('SELECT * FROM roles WHERE id = ?', req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/roles', authenticateToken, async (req, res) => {
  const { name, description } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: 'Role name is required' });
  }

  try {
    // Check if role already exists
    const existingRole = await db.get('SELECT id FROM roles WHERE name = ?', name.toLowerCase());
    if (existingRole) {
      return res.status(400).json({ error: 'Role with this name already exists' });
    }

    const result = await db.run(
      'INSERT INTO roles (name, description) VALUES (?, ?)',
      [name.toLowerCase(), description]
    );

    const newRole = await db.get('SELECT * FROM roles WHERE id = ?', result.lastID);

    // Log the action
    await logAuditEvent(
      'create_role',
      null,
      null,
      req.user.id,
      `Created role: ${name}`
    );

    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/roles/:id', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  const roleId = req.params.id;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: 'Role name is required' });
  }

  try {
    // Check if role exists
    const existingRole = await db.get('SELECT * FROM roles WHERE id = ?', roleId);
    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Check if new name conflicts with another role
    const nameConflict = await db.get(
      'SELECT id FROM roles WHERE name = ? AND id != ?',
      [name.toLowerCase(), roleId]
    );
    if (nameConflict) {
      return res.status(400).json({ error: 'Role with this name already exists' });
    }

    await db.run(
      'UPDATE roles SET name = ?, description = ? WHERE id = ?',
      [name.toLowerCase(), description, roleId]
    );

    const updatedRole = await db.get('SELECT * FROM roles WHERE id = ?', roleId);

    // Log the action
    await logAuditEvent(
      'update_role',
      null,
      null,
      req.user.id,
      `Updated role: ${name}`
    );

    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/roles/:id', authenticateToken, async (req, res) => {
  const roleId = req.params.id;

  try {
    // Check if role exists
    const role = await db.get('SELECT * FROM roles WHERE id = ?', roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Check if role is in use
    const usersWithRole = await db.get('SELECT COUNT(*) as count FROM users WHERE roleId = ?', roleId);
    if (usersWithRole.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role that is assigned to users. Please reassign users first.' 
      });
    }

    await db.run('DELETE FROM roles WHERE id = ?', roleId);

    // Log the action
    await logAuditEvent(
      'delete_role',
      null,
      null,
      req.user.id,
      `Deleted role: ${role.name}`
    );

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Organizational hierarchy endpoint
app.get('/api/organization-tree', authenticateToken, async (req, res) => {
  try {
    const departmentId = req.query.departmentId;
    
    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.managerId,
        u.departmentId,
        r.name as role,
        d.name as department
      FROM users u
      LEFT JOIN roles r ON u.roleId = r.id
      LEFT JOIN departments d ON u.departmentId = d.id
      WHERE 1=1
    `;
    
    const params = [];
    if (departmentId && departmentId !== 'all') {
      query += ' AND u.departmentId = ?';
      params.push(departmentId);
    }

    const users = await db.all(query, params);
    
    if (users.length === 0) {
      return res.json([]);
    }

    // Convert manager IDs to numbers for consistent comparison
    users.forEach(user => {
      user.managerId = user.managerId ? Number(user.managerId) : null;
      user.id = Number(user.id);
    });

    // Create a map for O(1) lookup and initialize subordinates arrays
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = {
        ...user,
        subordinates: []
      };
    });

    // Separate root nodes and child nodes
    const roots = [];
    const children = [];

    // First pass: identify roots and children
    users.forEach(user => {
      const processedUser = userMap[user.id];
      if (!user.managerId) {
        roots.push(processedUser);
      } else if (userMap[user.managerId]) {
        children.push(processedUser);
      } else {
        // If manager doesn't exist, treat as root
        roots.push(processedUser);
      }
    });

    // Second pass: build hierarchy
    children.forEach(user => {
      const manager = userMap[user.managerId];
      if (manager) {
        manager.subordinates.push(user);
      }
    });

    // Sort subordinates by name
    const sortSubordinates = (node) => {
      if (node.subordinates && node.subordinates.length > 0) {
        node.subordinates.sort((a, b) => a.name.localeCompare(b.name));
        node.subordinates.forEach(sortSubordinates);
      }
    };

    // Sort roots by name and sort their subordinates
    roots.sort((a, b) => a.name.localeCompare(b.name));
    roots.forEach(sortSubordinates);

    res.json(roots);
  } catch (error) {
    console.error('Error in organization-tree:', error);
    res.status(500).json({ error: 'Failed to fetch organization tree' });
  }
});

// Get users by department
app.get('/api/departments/:id/users', authenticateToken, async (req, res) => {
  try {
    const users = await db.all(`
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        r.name as role,
        d.name as department,
        manager.name as managerName
      FROM users u
      LEFT JOIN roles r ON u.roleId = r.id
      LEFT JOIN departments d ON u.departmentId = d.id
      LEFT JOIN users manager ON u.managerId = manager.id
      WHERE u.departmentId = ?
    `, req.params.id);
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Load test data function
async function loadTestData() {
  try {
    // Check if we already have users other than admin
    const userCount = await db.get('SELECT COUNT(*) as count FROM users WHERE email != ?', ['admin@example.com']);
    
    if (userCount.count === 0) {
      const testData = await readFile('test-users.sql', 'utf8');
      await db.exec(testData);
      console.log('Test data loaded successfully');
    } else {
      console.log('Test data already exists, skipping import');
    }
  } catch (error) {
    console.error('Error loading test data:', error);
  }
}

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
initializeDb().then(async () => {
  // Load test data after database initialization
  await loadTestData();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});