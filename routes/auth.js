const express = require('express');
const router = express.Router();
const passport = require('../controllers/passport-discord');

// Discord login
router.get('/discord', (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    // ✅ User is already logged in — redirect instead of reauthenticating
    return res.redirect('/');
  }

  // 🚀 Not logged in — continue to Discord OAuth
  passport.authenticate('discord')(req, res, next);
});

// Discord callback
router.get('/discord/callback', (req, res, next) => {
  passport.authenticate('discord', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('http://tenkaistudio.com/login/error'); // Failed auth — redirect home or error page

    req.logIn(user, (err) => {
      if (err) return res.redirect('http://tenkaistudio.com/login/error');  // Handle login failure similarly

      // ✅ Force redirect to dashboard
      return res.redirect('http://tenkaistudio.com/dashboard');
    });
  })(req, res, next);
});



// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
});

router.get('/user', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Destructure only safe fields
  const { id, discordId, email, createdAt, updatedAt } = req.user;

  res.json({
    user: { id, discordId, email, createdAt, updatedAt }
  });
});

module.exports = router;
