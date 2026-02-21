// Simple backend server for testing API connections
// This is a basic Express server to handle API requests from your HR management system
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data store (in production, use a database)
let users = [
  {
    id: 'admin-1',
    name: 'Sarah Johnson',
    email: 'admin@hrms.com',
    password: '$2a$10$8K1p/a0dumN9EixQJvrMdOuP8oGP8c9r5U0yV/HQ.zTj/Y.fkNpGK', // bcrypt hash of 'admin123'
    role: 'admin',
    department: 'Management',
    position: 'HR Director',
    phone: '+1 (555) 100-0001',
    avatar: '👩‍💼',
    joinDate: '2020-01-15',
    salary: 95000,
    status: 'active',
  },
  {
    id: 'emp-1',
    name: 'James Wilson',
    email: 'james@hrms.com',
    password: '$2a$10$8K1p/a0dumN9EixQJvrMdOuP8oGP8c9r5U0yV/HQ.zTj/Y.fkNpGK', // bcrypt hash of 'emp123'
    role: 'employee',
    department: 'Engineering',
    position: 'Senior Developer',
    phone: '+1 (555) 200-0001',
    avatar: '👨‍💻',
    joinDate: '2021-03-10',
    salary: 78000,
    status: 'active',
  }
];

let attendance = [];
let leaves = [];
let payroll = [];
let files = [];
let announcements = [];

// Helper function to generate IDs
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // In a real app, you'd verify the JWT token here
  // For this mock, we'll just continue
  next();
};

// Routes

// Authentication
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // In a real app, you'd generate a JWT token here
  // For this mock, we'll return a simple token
  const token = 'mock-jwt-token-' + Date.now();
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({ 
    user: userWithoutPassword, 
    token 
  });
});

// Users routes
app.get('/api/users', authenticateToken, (req, res) => {
  // Return users without passwords
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

app.post('/api/users', authenticateToken, (req, res) => {
  const { email } = req.body;
  
  // Check if user with this email already exists
  if (users.some(u => u.email === email)) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }
  
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const newUser = {
    id: generateId(),
    ...req.body,
    password: hashedPassword,
  };
  
  users.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Hash password if it's being updated
  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 10);
  }
  
  users[index] = { ...users[index], ...req.body };
  const { password: _, ...userWithoutPassword } = users[index];
  res.json(userWithoutPassword);
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users.splice(index, 1);
  res.status(204).send();
});

// Attendance routes
app.get('/api/attendance', authenticateToken, (req, res) => {
  res.json(attendance);
});

app.post('/api/attendance', authenticateToken, (req, res) => {
  const newAttendance = {
    id: generateId(),
    ...req.body
  };
  
  attendance.push(newAttendance);
  res.status(201).json(newAttendance);
});

// Leave routes
app.get('/api/leaves', authenticateToken, (req, res) => {
  res.json(leaves);
});

app.post('/api/leaves', authenticateToken, (req, res) => {
  const newLeave = {
    id: generateId(),
    status: 'pending',
    appliedOn: new Date().toISOString().split('T')[0],
    ...req.body
  };
  
  leaves.push(newLeave);
  res.status(201).json(newLeave);
});

app.patch('/api/leaves/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const leave = leaves.find(l => l.id === id);
  
  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }
  
  leave.status = status;
  res.json(leave);
});

// Payroll routes
app.get('/api/payroll', authenticateToken, (req, res) => {
  res.json(payroll);
});

app.patch('/api/payroll/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const record = payroll.find(p => p.id === id);
  
  if (!record) {
    return res.status(404).json({ error: 'Payroll record not found' });
  }
  
  record.status = status;
  if (status === 'paid') {
    record.paidOn = new Date().toISOString().split('T')[0];
  }
  
  res.json(record);
});

// Files routes
app.get('/api/files', authenticateToken, (req, res) => {
  res.json(files);
});

app.post('/api/files', authenticateToken, (req, res) => {
  const newFile = {
    id: generateId(),
    uploadedOn: new Date().toISOString().split('T')[0],
    ...req.body
  };
  
  files.push(newFile);
  res.status(201).json(newFile);
});

app.delete('/api/files/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const index = files.findIndex(f => f.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  files.splice(index, 1);
  res.status(204).send();
});

// Announcements routes
app.get('/api/announcements', authenticateToken, (req, res) => {
  res.json(announcements);
});

app.post('/api/announcements', authenticateToken, (req, res) => {
  const newAnnouncement = {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    ...req.body
  };
  
  announcements.push(newAnnouncement);
  res.status(201).json(newAnnouncement);
});

app.delete('/api/announcements/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const index = announcements.findIndex(a => a.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Announcement not found' });
  }
  
  announcements.splice(index, 1);
  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Mock server is running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log('Ready to accept API requests from your HR management system!');
});