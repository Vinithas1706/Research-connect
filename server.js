require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const { router: authRouter, requireLogin } = require('./routes/authRoutes');
const chatRouter = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 hours
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api', chatRouter);

// Protect projects/explorer page (server-side check + client-side check both used)
app.get('/projects.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'projects.html'));
});

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
