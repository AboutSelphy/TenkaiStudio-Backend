require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('./controllers/passport-discord');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const { connectToDatabase } = require('./config/database');
const User = require('./models/user');
const cors = require('cors');
const { parse } = require('url');


const app = express();
const PORT = process.env.PORT || 4000;



const allowedOrigins = [
  'http://localhost:4000',
  'http://localhost:3000',
  'https://tenkaistudio.com',          // ✅ production frontend
  'https://api.tenkaistudio.com'       // ✅ production backend
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('Incoming origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

app.use(express.json());

// 🧠 Parse MySQL connection URL
const dbUrl = new URL(process.env.DATABASE_URL);
const sessionStore = new MySQLStore({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
});

// 🛡️ Use session with MySQLStore
app.use(session({
  key: 'discord.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
  maxAge: 1000 * 60 * 60 * 24 * 3,
  secure: true,
  httpOnly: true,
  domain: '.tenkaistudio.com',
  sameSite: 'none' // ✅ IMPORTANT for cross-domain
}

}));

// 🛂 Passport setup
app.use(passport.initialize());
app.use(passport.session());

// 🔐 Routes
app.use('/auth', authRoutes);

// ✅ Protected route
app.use('/profile', profileRoutes);


// 🔌 DB sync + server start
connectToDatabase().then(async () => {
  await User.sync({ alter: true });
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
