// app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const morgan = require('morgan');

// MongoDB
const mongoose = require('mongoose');
mongoose.set('debug', true);

// Load environment variables
dotenv.config();

// Import routes
const employeeRoutes = require('./routes/internRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiter for login endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: 'Too many login attempts, please try again later.',
});

// Logging with winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: 'app.log' }),
  ],
});

// Use morgan for request logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI,)
  .then(() => {
    console.log('Connected to MongoDB');
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    logger.error(`Database connection error: ${err.message}`);
  });

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Employee Management API');
});
app.use('/api/interns', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);
});
