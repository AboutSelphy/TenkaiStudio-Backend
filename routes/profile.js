const express = require('express');
const router = express.Router();

router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send('Not logged in');
  res.send(`Welcome ${req.user.discordId}`);
});

module.exports = router;