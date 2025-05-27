const express = require('express');
const router = express.Router();
const passport = require('../controllers/passport-discord');

// Discord login
router.get('/discord', (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    // ✅ User is already logged in — redirect instead of reauthenticating
    return res.redirect('https://tenkaistudio.com/');
  }
  // 🚀 Not logged in — continue to Discord OAuth
  return passport.authenticate('discord')(req, res, next);
});

// Discord callback
router.get('/discord/callback', (req, res, next) => {
  passport.authenticate('discord', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('https://tenkaistudio.com/login/error'); // Failed auth

    req.logIn(user, (err) => {
      if (err) return res.redirect('https://tenkaistudio.com/login/error');

      // Make sure session is saved before redirecting
      req.session.save((err) => {
        if (err) return res.redirect('https://tenkaistudio.com/login/error');
        return res.redirect('https://tenkaistudio.com/dashboard');
      });
    });
  })(req, res, next);
});


// Logout
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(err => {
      if (err) return next(err);
      res.clearCookie('discord.sid', {
        path: '/',
        domain: '.tenkaistudio.com', // adjust if needed, or remove if not set originally
        secure: true,                 // set true if using HTTPS
        httpOnly: true,
        sameSite: 'none',              // or 'none' if cross-site and secure
      });
      // Don't redirect here since you want to handle redirect client-side
      res.status(200).json({ message: 'Logged out' });
    });
  });
});




// User info (protected)
router.get('/user', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Only send safe fields
  const { id, discordId, email, createdAt, updatedAt } = req.user;

  res.json({
    user: { id, discordId, email, createdAt, updatedAt }
  });
});

module.exports = router;
