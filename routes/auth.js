const express = require('express');
const router = express.Router();
const passport = require('../controllers/passport-discord');

// Discord login
router.get('/discord', passport.authenticate('discord'));

// Discord callback
router.get('/discord/callback',
  passport.authenticate('discord', {
    failureRedirect: '/',
    successRedirect: '/dashboard', // or wherever
  })
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
});

module.exports = router;
