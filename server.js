require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./controllers/passport-discord');
const authRoutes = require('./routes/auth');
const { connectToDatabase } = require('./config/database');
const User = require('./models/user')
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    'http://localhost:4000',
    'https://TenkaiStudio.com:4040'
  ];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
app.use(express.json());

// Session config (3 days)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
  }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);

// Test route
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send('Not logged in');
  res.send(`Welcome ${req.user.discordId}`);
});

connectToDatabase().then(async () => {
    await User.sync({ alter: true }); // This will create or update the table
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  });
