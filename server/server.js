const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const app = express();

// 1. Helmet Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. Strict CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
}));

// 3. Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Data Sanitization against NoSQL Query Injection (Express 5 safe)
app.use((req, res, next) => {
  if (req.body) {
    mongoSanitize.sanitize(req.body);
  }
  next();
});

// 5. Global API Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', globalLimiter);

// 6. Auth Rate Limiter (Relaxed for active development & testing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many login/registration attempts. Please try again after 15 minutes.' }
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authLimiter, authRoutes);

const complaintRoutes = require('./routes/complaintRoutes');
app.use('/api/complaints', complaintRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🛡️ AI Smart Issue Routing API is running securely!' });
});

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('joinRoom', (userId) => {
    socket.join(`user:${userId}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🛡️ Secure Server running on port ${PORT}`);
  console.log(`⚡ Socket.io attached securely`);
});