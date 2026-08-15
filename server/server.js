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

// 1. Helmet Security Headers (Protects against clickjacking, sniffing, XSS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. Strict CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://ai-smart-issue-routing.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS security policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
}));

// 3. Body Parser with Payload Limiting (Prevents DOS attacks)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Data Sanitization against NoSQL Query Injection (Blocks $gt, $ne attacks)
app.use(mongoSanitize());

// 5. Global API Rate Limiter (100 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', globalLimiter);

// 6. Strict Auth Rate Limiter (Prevents Brute-force Password attacks - 10 attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' }
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

// Socket.io Setup with CORS origin validation
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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